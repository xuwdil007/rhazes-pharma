#!/usr/bin/env bash
set -Eeuo pipefail

# Configure Nginx reverse proxy for the Rhazes app.
# Expected app upstream:
#   http://127.0.0.1:8080
#
# Result:
#   http://SERVER_IP
#   http://SERVER_IP/#/admin
#
# Usage:
#   chmod +x setup-nginx.sh
#   sudo ./setup-nginx.sh

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERROR: Run this script as root:"
  echo "  sudo ./setup-nginx.sh"
  exit 1
fi

UPSTREAM_HOST="127.0.0.1"
UPSTREAM_PORT="8080"
SITE_NAME="rhazes"
SITE_AVAILABLE="/etc/nginx/sites-available/${SITE_NAME}"
SITE_ENABLED="/etc/nginx/sites-enabled/${SITE_NAME}"

echo "========================================"
echo " Rhazes Nginx reverse proxy setup"
echo "========================================"
echo "Upstream: http://${UPSTREAM_HOST}:${UPSTREAM_PORT}"
echo

echo "[1/6] Installing Nginx if needed..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx curl

echo "[2/6] Checking application upstream..."
if ! curl -fsS --max-time 10 "http://${UPSTREAM_HOST}:${UPSTREAM_PORT}" >/dev/null; then
  echo
  echo "ERROR: Application is not responding at:"
  echo "  http://${UPSTREAM_HOST}:${UPSTREAM_PORT}"
  echo
  echo "Make sure Docker is running and your compose port mapping is:"
  echo '  127.0.0.1:8080:4173'
  exit 1
fi

echo "Application upstream is responding."

echo "[3/6] Writing Nginx site config..."
cat > "${SITE_AVAILABLE}" <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

echo "[4/6] Enabling Rhazes site..."
rm -f /etc/nginx/sites-enabled/default
ln -sfn "${SITE_AVAILABLE}" "${SITE_ENABLED}"

echo "[5/6] Validating Nginx configuration..."
nginx -t

echo "[6/6] Enabling and reloading Nginx..."
systemctl enable nginx
systemctl reload nginx

echo
echo "========================================"
echo " Setup complete"
echo "========================================"

if systemctl is-active --quiet nginx; then
  echo "Nginx service: ACTIVE"
else
  echo "ERROR: Nginx is not running."
  systemctl status nginx --no-pager || true
  exit 1
fi

echo
echo "Local proxy test:"
if curl -fsS --max-time 10 http://127.0.0.1 >/dev/null; then
  echo "  http://127.0.0.1 -> OK"
else
  echo "ERROR: Nginx proxy test failed."
  exit 1
fi

PUBLIC_IP="$(curl -4 -fsS --max-time 10 https://ifconfig.me || true)"

echo
if [[ -n "${PUBLIC_IP}" ]]; then
  echo "Open the project at:"
  echo "  http://${PUBLIC_IP}"
  echo
  echo "Admin:"
  echo "  http://${PUBLIC_IP}/#/admin"
else
  echo "Open the project at:"
  echo "  http://YOUR_SERVER_IP"
fi

echo
echo "IMPORTANT:"
echo "Docker should preferably expose the app only on localhost:"
echo '  ports:'
echo '    - "127.0.0.1:8080:4173"'
echo
echo "For a future domain, point the DNS A record to this server,"
echo "then replace 'server_name _;' with the domain and configure HTTPS."
