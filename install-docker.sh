#!/usr/bin/env bash
set -Eeuo pipefail

# Docker Engine installer for Ubuntu / Hetzner Cloud
# Installs Docker CE, containerd, Buildx and Docker Compose plugin
#
# Usage:
#   chmod +x install-docker.sh
#   sudo ./install-docker.sh

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERROR: Run this script as root:"
  echo "  sudo ./install-docker.sh"
  exit 1
fi

if [[ ! -f /etc/os-release ]]; then
  echo "ERROR: /etc/os-release not found."
  exit 1
fi

# shellcheck disable=SC1091
. /etc/os-release

if [[ "${ID:-}" != "ubuntu" ]]; then
  echo "ERROR: This script is intended for Ubuntu."
  echo "Detected OS: ${PRETTY_NAME:-unknown}"
  exit 1
fi

CODENAME="${UBUNTU_CODENAME:-${VERSION_CODENAME:-}}"
ARCH="$(dpkg --print-architecture)"

if [[ -z "${CODENAME}" ]]; then
  echo "ERROR: Could not detect Ubuntu codename."
  exit 1
fi

echo "========================================"
echo " Docker installation"
echo "========================================"
echo "OS:           ${PRETTY_NAME}"
echo "Codename:     ${CODENAME}"
echo "Architecture: ${ARCH}"
echo

echo "[1/7] Installing prerequisites..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates \
  curl

echo "[2/7] Preparing Docker keyring..."
install -m 0755 -d /etc/apt/keyrings

# Remove files that may have been created incorrectly before.
rm -f /etc/apt/keyrings/docker.asc
rm -f /etc/apt/sources.list.d/docker.list
rm -f /etc/apt/sources.list.d/docker.sources

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

echo "[3/7] Adding Docker APT repository..."
printf '%s\n' \
  'Types: deb' \
  'URIs: https://download.docker.com/linux/ubuntu' \
  "Suites: ${CODENAME}" \
  'Components: stable' \
  "Architectures: ${ARCH}" \
  'Signed-By: /etc/apt/keyrings/docker.asc' \
  > /etc/apt/sources.list.d/docker.sources

echo
echo "Docker repository configuration:"
cat /etc/apt/sources.list.d/docker.sources
echo

echo "[4/7] Updating APT package index..."
apt-get update

echo "[5/7] Checking Docker CE availability..."
DOCKER_CANDIDATE="$(apt-cache policy docker-ce | awk '/Candidate:/ {print $2}')"

if [[ -z "${DOCKER_CANDIDATE}" || "${DOCKER_CANDIDATE}" == "(none)" ]]; then
  echo
  echo "ERROR: docker-ce is not available from the configured repository."
  echo
  echo "Repository file:"
  cat /etc/apt/sources.list.d/docker.sources
  echo
  echo "APT policy:"
  apt-cache policy docker-ce || true
  echo
  echo "Check whether Docker supports Ubuntu codename '${CODENAME}'."
  exit 1
fi

echo "Docker CE candidate: ${DOCKER_CANDIDATE}"

echo "[6/7] Installing Docker..."
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

echo "[7/7] Enabling and starting Docker..."
systemctl enable --now docker

echo
echo "========================================"
echo " Installation complete"
echo "========================================"
docker --version
docker compose version
echo

if systemctl is-active --quiet docker; then
  echo "Docker service: ACTIVE"
else
  echo "ERROR: Docker service is not running."
  systemctl status docker --no-pager || true
  exit 1
fi

echo
echo "Running hello-world test..."
docker run --rm hello-world

echo
echo "Docker was installed successfully."
