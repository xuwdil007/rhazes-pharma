package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

func openDatabase(root string) (*sql.DB, error) {
	dataDir := filepath.Join(root, "backend", "data")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, err
	}
	db, err := sql.Open("sqlite", filepath.Join(dataDir, "site.db"))
	if err != nil {
		return nil, err
	}
	for _, statement := range []string{
		`PRAGMA journal_mode=WAL`,
		`PRAGMA busy_timeout=5000`,
		`CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
		`CREATE TABLE IF NOT EXISTS applications (
			id TEXT PRIMARY KEY, submitted_at TEXT NOT NULL, name TEXT NOT NULL,
			email TEXT NOT NULL, phone TEXT NOT NULL, direction TEXT NOT NULL, about TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY, submitted_at TEXT NOT NULL, name TEXT NOT NULL,
			email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS admin_credentials (
			id INTEGER PRIMARY KEY CHECK (id = 1), login TEXT NOT NULL,
			password_salt TEXT NOT NULL, password_hash TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
	} {
		if _, err = db.Exec(statement); err != nil {
			db.Close()
			return nil, err
		}
	}
	if err = migrateJSONData(db, dataDir); err != nil {
		db.Close()
		return nil, err
	}
	db.SetMaxOpenConns(1)
	return db, nil
}

func tableEmpty(tx *sql.Tx, table string) (bool, error) {
	var count int
	err := tx.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&count)
	return count == 0, err
}

func readJSON(path string, target any) bool {
	data, err := os.ReadFile(path)
	return err == nil && json.Unmarshal(data, target) == nil
}

func migrateJSONData(db *sql.DB, dataDir string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var migrationDone string
	if tx.QueryRow(`SELECT value FROM app_meta WHERE key = 'legacy_json_migrated'`).Scan(&migrationDone) == nil {
		return tx.Commit()
	}

	if empty, _ := tableEmpty(tx, "content"); empty {
		content := map[string]string{}
		if readJSON(filepath.Join(dataDir, "content.json"), &content) {
			for key, value := range content {
				if _, err = tx.Exec(`INSERT OR REPLACE INTO content(key, value) VALUES(?, ?)`, key, value); err != nil {
					return err
				}
			}
		}
	}
	if empty, _ := tableEmpty(tx, "applications"); empty {
		items := []application{}
		if readJSON(filepath.Join(dataDir, "applications.json"), &items) {
			for _, item := range items {
				if _, err = tx.Exec(`INSERT OR IGNORE INTO applications VALUES(?, ?, ?, ?, ?, ?, ?)`, item.ID, item.SubmittedAt, item.Name, item.Email, item.Phone, item.Direction, item.About); err != nil {
					return err
				}
			}
		}
	}
	if empty, _ := tableEmpty(tx, "messages"); empty {
		items := []contactMessage{}
		if readJSON(filepath.Join(dataDir, "messages.json"), &items) {
			for _, item := range items {
				if _, err = tx.Exec(`INSERT OR IGNORE INTO messages VALUES(?, ?, ?, ?, ?, ?)`, item.ID, item.SubmittedAt, item.Name, item.Email, item.Subject, item.Message); err != nil {
					return err
				}
			}
		}
	}
	if empty, _ := tableEmpty(tx, "admin_credentials"); empty {
		var item storedCredentials
		if readJSON(filepath.Join(dataDir, "credentials.json"), &item) && item.Login != "" && item.PasswordSalt != "" && item.PasswordHash != "" {
			if _, err = tx.Exec(`INSERT INTO admin_credentials(id, login, password_salt, password_hash) VALUES(1, ?, ?, ?)`, item.Login, item.PasswordSalt, item.PasswordHash); err != nil {
				return err
			}
		}
	}
	if _, err = tx.Exec(`INSERT INTO app_meta(key, value) VALUES('legacy_json_migrated', '1')`); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *server) readContent() map[string]string {
	result := map[string]string{}
	rows, err := s.db.Query(`SELECT key, value FROM content`)
	if err != nil {
		return result
	}
	defer rows.Close()
	for rows.Next() {
		var key, value string
		if rows.Scan(&key, &value) == nil {
			result[key] = value
		}
	}
	return result
}

func (s *server) writeContent(content map[string]string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err = tx.Exec(`DELETE FROM content`); err != nil {
		return err
	}
	statement, err := tx.Prepare(`INSERT INTO content(key, value) VALUES(?, ?)`)
	if err != nil {
		return err
	}
	defer statement.Close()
	for key, value := range content {
		if _, err = statement.Exec(key, value); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *server) saveApplication(item application) error {
	_, err := s.db.Exec(`INSERT OR REPLACE INTO applications VALUES(?, ?, ?, ?, ?, ?, ?)`, item.ID, item.SubmittedAt, item.Name, item.Email, item.Phone, item.Direction, item.About)
	return err
}

func (s *server) listApplications() ([]application, error) {
	rows, err := s.db.Query(`SELECT id, submitted_at, name, email, phone, direction, about FROM applications ORDER BY submitted_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []application{}
	for rows.Next() {
		var item application
		if err = rows.Scan(&item.ID, &item.SubmittedAt, &item.Name, &item.Email, &item.Phone, &item.Direction, &item.About); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *server) saveMessage(item contactMessage) error {
	_, err := s.db.Exec(`INSERT OR REPLACE INTO messages VALUES(?, ?, ?, ?, ?, ?)`, item.ID, item.SubmittedAt, item.Name, item.Email, item.Subject, item.Message)
	return err
}

func (s *server) listMessages() ([]contactMessage, error) {
	rows, err := s.db.Query(`SELECT id, submitted_at, name, email, subject, message FROM messages ORDER BY submitted_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []contactMessage{}
	for rows.Next() {
		var item contactMessage
		if err = rows.Scan(&item.ID, &item.SubmittedAt, &item.Name, &item.Email, &item.Subject, &item.Message); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *server) loadStoredCredentials() (storedCredentials, bool) {
	var item storedCredentials
	err := s.db.QueryRow(`SELECT login, password_salt, password_hash FROM admin_credentials WHERE id = 1`).Scan(&item.Login, &item.PasswordSalt, &item.PasswordHash)
	return item, err == nil
}

func (s *server) saveStoredCredentials(item storedCredentials) error {
	result, err := s.db.Exec(`INSERT INTO admin_credentials(id, login, password_salt, password_hash) VALUES(1, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET login=excluded.login, password_salt=excluded.password_salt, password_hash=excluded.password_hash`, item.Login, item.PasswordSalt, item.PasswordHash)
	if err != nil {
		return err
	}
	if affected, _ := result.RowsAffected(); affected != 1 {
		return fmt.Errorf("credentials were not saved")
	}
	return nil
}
