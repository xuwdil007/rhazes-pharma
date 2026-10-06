package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const maxBodySize = 16 << 20

type server struct {
	root, dataFile, applicationsFile, messagesFile, credentialsFile, secret string
	login, password, passwordSalt, passwordHash                             string
	contentMux, applicationsMux, messagesMux, authMux                       sync.RWMutex
}

type storedCredentials struct {
	Login        string `json:"login"`
	PasswordSalt string `json:"passwordSalt"`
	PasswordHash string `json:"passwordHash"`
}

func hashPassword(password, salt string) string {
	sum := sha256.Sum256([]byte(salt + password))
	for i := 0; i < 120000; i++ {
		next := sha256.New()
		_, _ = next.Write(sum[:])
		_, _ = next.Write([]byte(salt))
		sum = sha256.Sum256(next.Sum(nil))
	}
	return hex.EncodeToString(sum[:])
}

func newPasswordSalt() (string, error) {
	data := make([]byte, 24)
	if _, err := rand.Read(data); err != nil {
		return "", err
	}
	return hex.EncodeToString(data), nil
}

func (s *server) loadCredentials() {
	data, err := os.ReadFile(s.credentialsFile)
	if err != nil {
		return
	}
	var saved storedCredentials
	if json.Unmarshal(data, &saved) == nil && saved.Login != "" && saved.PasswordSalt != "" && saved.PasswordHash != "" {
		s.login = saved.Login
		s.password = ""
		s.passwordSalt = saved.PasswordSalt
		s.passwordHash = saved.PasswordHash
	}
}

func (s *server) validCredentials(login, password string) bool {
	s.authMux.RLock()
	defer s.authMux.RUnlock()
	loginOK := subtle.ConstantTimeCompare([]byte(login), []byte(s.login)) == 1
	if s.passwordHash != "" {
		candidate := hashPassword(password, s.passwordSalt)
		return loginOK && subtle.ConstantTimeCompare([]byte(candidate), []byte(s.passwordHash)) == 1
	}
	return loginOK && subtle.ConstantTimeCompare([]byte(password), []byte(s.password)) == 1
}

type application struct {
	ID          string `json:"id"`
	SubmittedAt string `json:"submittedAt"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Direction   string `json:"direction"`
	About       string `json:"about"`
}

type contactMessage struct {
	ID          string `json:"id"`
	SubmittedAt string `json:"submittedAt"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Subject     string `json:"subject"`
	Message     string `json:"message"`
}

func cleanField(value string, limit int) string {
	value = strings.TrimSpace(value)
	if len(value) > limit {
		value = value[:limit]
	}
	return value
}

func (s *server) applicationsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	switch r.Method {
	case http.MethodPost:
		r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
		defer r.Body.Close()
		var item application
		if json.NewDecoder(r.Body).Decode(&item) != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Некорректные данные"})
			return
		}
		item.ID = cleanField(item.ID, 100)
		item.SubmittedAt = cleanField(item.SubmittedAt, 60)
		item.Name = cleanField(item.Name, 180)
		item.Email = cleanField(item.Email, 240)
		item.Phone = cleanField(item.Phone, 80)
		item.Direction = cleanField(item.Direction, 180)
		item.About = cleanField(item.About, 4000)
		if item.Name == "" || item.Email == "" || item.Phone == "" || item.Direction == "" || item.About == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Заполните все поля"})
			return
		}
		s.applicationsMux.Lock()
		defer s.applicationsMux.Unlock()
		items := []application{}
		if data, err := os.ReadFile(s.applicationsFile); err == nil {
			_ = json.Unmarshal(data, &items)
		}
		items = append([]application{item}, items...)
		data, _ := json.MarshalIndent(items, "", "  ")
		if err := os.WriteFile(s.applicationsFile, append(data, '\n'), 0600); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Не удалось сохранить отклик"})
			return
		}
		writeJSON(w, http.StatusCreated, map[string]bool{"ok": true})
	case http.MethodGet:
		if !s.validToken(r) {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Требуется авторизация"})
			return
		}
		s.applicationsMux.RLock()
		defer s.applicationsMux.RUnlock()
		items := []application{}
		if data, err := os.ReadFile(s.applicationsFile); err == nil {
			_ = json.Unmarshal(data, &items)
		}
		writeJSON(w, http.StatusOK, items)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *server) messagesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	switch r.Method {
	case http.MethodPost:
		r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
		defer r.Body.Close()
		var item contactMessage
		if json.NewDecoder(r.Body).Decode(&item) != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Некорректные данные"})
			return
		}
		item.ID = cleanField(item.ID, 100)
		item.SubmittedAt = cleanField(item.SubmittedAt, 60)
		item.Name = cleanField(item.Name, 180)
		item.Email = cleanField(item.Email, 240)
		item.Subject = cleanField(item.Subject, 180)
		item.Message = cleanField(item.Message, 4000)
		if item.Name == "" || item.Email == "" || item.Subject == "" || item.Message == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Заполните все поля"})
			return
		}
		s.messagesMux.Lock()
		defer s.messagesMux.Unlock()
		items := []contactMessage{}
		if data, err := os.ReadFile(s.messagesFile); err == nil {
			_ = json.Unmarshal(data, &items)
		}
		items = append([]contactMessage{item}, items...)
		data, _ := json.MarshalIndent(items, "", "  ")
		if err := os.WriteFile(s.messagesFile, append(data, '\n'), 0600); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Не удалось сохранить сообщение"})
			return
		}
		writeJSON(w, http.StatusCreated, map[string]bool{"ok": true})
	case http.MethodGet:
		if !s.validToken(r) {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Требуется авторизация"})
			return
		}
		s.messagesMux.RLock()
		defer s.messagesMux.RUnlock()
		items := []contactMessage{}
		if data, err := os.ReadFile(s.messagesFile); err == nil {
			_ = json.Unmarshal(data, &items)
		}
		writeJSON(w, http.StatusOK, items)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

type tokenPayload struct {
	Login   string `json:"login"`
	Expires int64  `json:"expires"`
}

func loadDotEnv(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, found := strings.Cut(line, "=")
		key = strings.TrimSpace(key)
		if !found || os.Getenv(key) != "" {
			continue
		}
		_ = os.Setenv(key, strings.Trim(strings.TrimSpace(value), `"'`))
	}
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func (s *server) readContent() map[string]string {
	s.contentMux.RLock()
	defer s.contentMux.RUnlock()
	result := map[string]string{}
	if data, err := os.ReadFile(s.dataFile); err == nil {
		_ = json.Unmarshal(data, &result)
	}
	return result
}

func (s *server) writeContent(content map[string]string) error {
	s.contentMux.Lock()
	defer s.contentMux.Unlock()
	data, err := json.MarshalIndent(content, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(s.dataFile), 0755); err != nil {
		return err
	}
	return os.WriteFile(s.dataFile, append(data, '\n'), 0644)
}

func (s *server) signature(payload string) string {
	mac := hmac.New(sha256.New, []byte(s.secret))
	_, _ = mac.Write([]byte(payload))
	return fmt.Sprintf("%x", mac.Sum(nil))
}

func (s *server) createToken() string {
	s.authMux.RLock()
	login := s.login
	s.authMux.RUnlock()
	payload, _ := json.Marshal(tokenPayload{login, time.Now().Add(8 * time.Hour).UnixMilli()})
	encoded := base64.RawURLEncoding.EncodeToString(payload)
	return encoded + "." + s.signature(encoded)
}

func (s *server) validToken(r *http.Request) bool {
	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	payload, signature, found := strings.Cut(token, ".")
	if !found || !hmac.Equal([]byte(signature), []byte(s.signature(payload))) {
		return false
	}
	decoded, err := base64.RawURLEncoding.DecodeString(payload)
	if err != nil {
		return false
	}
	var data tokenPayload
	s.authMux.RLock()
	login := s.login
	s.authMux.RUnlock()
	return json.Unmarshal(decoded, &data) == nil && data.Login == login && data.Expires >= time.Now().UnixMilli()
}

func (s *server) contentHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, http.StatusOK, s.readContent())
	case http.MethodPut:
		if !s.validToken(r) {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Требуется авторизация"})
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, maxBodySize)
		defer r.Body.Close()
		var incoming map[string]any
		if json.NewDecoder(r.Body).Decode(&incoming) != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Некорректные данные"})
			return
		}
		clean := make(map[string]string, len(incoming))
		for key, raw := range incoming {
			value, ok := raw.(string)
			if !ok {
				continue
			}
			if len(key) > 300 {
				key = key[:300]
			}
			if len(value) > 12<<20 {
				value = value[:12<<20]
			}
			clean[key] = value
		}
		if err := s.writeContent(clean); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Не удалось сохранить данные"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"ok": true, "count": len(clean)})
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *server) loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxBodySize)
	defer r.Body.Close()
	var credentials struct{ Login, Password string }
	if json.NewDecoder(r.Body).Decode(&credentials) != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Некорректные данные"})
		return
	}
	if !s.validCredentials(credentials.Login, credentials.Password) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Неверный логин или пароль"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"token": s.createToken()})
}

func (s *server) credentialsHandler(w http.ResponseWriter, r *http.Request) {
	if !s.validToken(r) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Требуется авторизация"})
		return
	}
	if r.Method == http.MethodGet {
		s.authMux.RLock()
		login := s.login
		s.authMux.RUnlock()
		writeJSON(w, http.StatusOK, map[string]string{"login": login})
		return
	}
	if r.Method != http.MethodPut {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 32<<10)
	defer r.Body.Close()
	var incoming struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	if json.NewDecoder(r.Body).Decode(&incoming) != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Некорректные данные"})
		return
	}
	incoming.Login = cleanField(incoming.Login, 80)
	if len(incoming.Login) < 3 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Логин должен содержать не менее 3 символов"})
		return
	}
	if len(incoming.Password) < 8 || len(incoming.Password) > 256 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Пароль должен содержать от 8 до 256 символов"})
		return
	}
	salt, err := newPasswordSalt()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Не удалось подготовить пароль"})
		return
	}
	saved := storedCredentials{
		Login:        incoming.Login,
		PasswordSalt: salt,
		PasswordHash: hashPassword(incoming.Password, salt),
	}
	data, err := json.MarshalIndent(saved, "", "  ")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Не удалось сохранить настройки"})
		return
	}
	s.authMux.Lock()
	if err = os.WriteFile(s.credentialsFile, append(data, '\n'), 0600); err == nil {
		s.login = saved.Login
		s.password = ""
		s.passwordSalt = saved.PasswordSalt
		s.passwordHash = saved.PasswordHash
	}
	s.authMux.Unlock()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Не удалось сохранить настройки"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"token": s.createToken()})
}

func (s *server) staticHandler(w http.ResponseWriter, r *http.Request) {
	cleanPath := filepath.Clean(strings.TrimPrefix(r.URL.Path, "/"))
	requested := filepath.Join(s.root, "dist", cleanPath)
	if info, err := os.Stat(requested); err == nil && !info.IsDir() {
		http.ServeFile(w, r, requested)
		return
	}
	http.ServeFile(w, r, filepath.Join(s.root, "dist", "index.html"))
}

func main() {
	root, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	loadDotEnv(filepath.Join(root, ".env"))
	app := &server{
		root:             root,
		dataFile:         filepath.Join(root, "backend", "data", "content.json"),
		applicationsFile: filepath.Join(root, "backend", "data", "applications.json"),
		messagesFile:     filepath.Join(root, "backend", "data", "messages.json"),
		credentialsFile:  filepath.Join(root, "backend", "data", "credentials.json"),
		login:            envOr("ADMIN_LOGIN", "admin"),
		password:         envOr("ADMIN_PASSWORD", "Rhazes2026!"),
		secret:           envOr("ADMIN_SECRET", "change-this-secret-in-production"),
	}
	app.loadCredentials()
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	})
	mux.HandleFunc("/api/content", app.contentHandler)
	mux.HandleFunc("/api/admin/login", app.loginHandler)
	mux.HandleFunc("/api/admin/credentials", app.credentialsHandler)
	mux.HandleFunc("/api/applications", app.applicationsHandler)
	mux.HandleFunc("/api/messages", app.messagesHandler)
	mux.HandleFunc("/", app.staticHandler)
	port := envOr("PORT", "4173")
	log.Printf("Rhazes Pharma: http://localhost:%s", port)
	log.Printf("Admin: http://localhost:%s/#/admin", port)
	httpServer := &http.Server{
		Addr:              ":" + port,
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       90 * time.Second,
	}
	log.Fatal(httpServer.ListenAndServe())
}
