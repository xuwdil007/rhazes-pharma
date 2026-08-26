package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
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

const maxBodySize = 2 << 20

type server struct {
	root, dataFile, login, password, secret string
	contentMux                              sync.RWMutex
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
	payload, _ := json.Marshal(tokenPayload{s.login, time.Now().Add(8 * time.Hour).UnixMilli()})
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
	return json.Unmarshal(decoded, &data) == nil && data.Login == s.login && data.Expires >= time.Now().UnixMilli()
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
			if len(value) > 10000 {
				value = value[:10000]
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
	loginOK := subtle.ConstantTimeCompare([]byte(credentials.Login), []byte(s.login)) == 1
	passwordOK := subtle.ConstantTimeCompare([]byte(credentials.Password), []byte(s.password)) == 1
	if !loginOK || !passwordOK {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Неверный логин или пароль"})
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
		root:     root,
		dataFile: filepath.Join(root, "backend", "data", "content.json"),
		login:    envOr("ADMIN_LOGIN", "admin"),
		password: envOr("ADMIN_PASSWORD", "Rhazes2026!"),
		secret:   envOr("ADMIN_SECRET", "change-this-secret-in-production"),
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/api/content", app.contentHandler)
	mux.HandleFunc("/api/admin/login", app.loginHandler)
	mux.HandleFunc("/", app.staticHandler)
	port := envOr("PORT", "4173")
	log.Printf("Rhazes Pharma: http://localhost:%s", port)
	log.Printf("Admin: http://localhost:%s/#/admin", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
