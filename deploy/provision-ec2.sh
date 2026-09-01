#!/bin/bash
# One-time setup for a fresh Ubuntu EC2 instance that will host BOTH apps
# side by side via Docker Compose:
#   - manpower-admin-portal   (Super Admin Portal)  -> ports 3000/3001
#   - nija-manpower-tenant-app (Tenant application)  -> ports 3010/3011
#
# Run this ONCE, directly on the EC2 box, over your own SSH session —
# never hand your SSH key to anyone (including an AI assistant) to run
# this for you. After this script finishes, the recurring CI deploy step
# only ever does `git pull && docker compose up -d --build` in each repo's
# directory — this script is what makes that possible.
#
# Usage (from your own machine):
#   scp deploy/provision-ec2.sh ubuntu@<EC2_IP>:~/
#   ssh ubuntu@<EC2_IP>
#   chmod +x provision-ec2.sh && ./provision-ec2.sh

set -euo pipefail

TENANT_REPO="git@github.com:skmdkhasim/nija-manpower-tenant-app.git"
ADMIN_REPO="git@github.com:skmdkhasim/manpower-admin-portal.git"
APPS_DIR="/opt/apps"
DEPLOY_KEY="$HOME/.ssh/github_deploy_key"

echo "==> Updating packages"
sudo apt-get update -y
sudo apt-get upgrade -y

echo "==> Installing Docker Engine + Compose plugin"
if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get install -y ca-certificates curl gnupg git
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Let the current user run `docker` without sudo (takes effect on next login).
sudo usermod -aG docker "$USER"

echo "==> Setting up a dedicated SSH deploy key for GitHub"
# GitHub dropped password auth for git over HTTPS years ago, and a fully
# unattended box (this one — CI will `git pull` here forever, with nobody
# watching) can't type a Personal Access Token into a prompt either. A
# read-only SSH deploy key, scoped to just these two repos, is the right
# fit: generated once here, never expires, never touches your own GitHub
# login/2FA/OTP at all.
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

if [ ! -f "$DEPLOY_KEY" ]; then
  ssh-keygen -t ed25519 -C "ec2-deploy-key" -f "$DEPLOY_KEY" -N ""
else
  echo "Deploy key already exists at $DEPLOY_KEY, reusing it."
fi

# Pre-populate known_hosts so the later `git clone` doesn't hang on an
# interactive "are you sure you want to continue connecting?" prompt.
if ! ssh-keygen -F github.com >/dev/null 2>&1; then
  ssh-keyscan -t ed25519 github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null
fi

if ! grep -q "^Host github.com$" "$HOME/.ssh/config" 2>/dev/null; then
  cat >> "$HOME/.ssh/config" <<EOF
Host github.com
  IdentityFile $DEPLOY_KEY
  IdentitiesOnly yes
EOF
fi
chmod 600 "$HOME/.ssh/config"

# Captured into a variable rather than piped directly — `ssh -T
# git@github.com` always exits 1 even on successful auth (GitHub doesn't
# grant shell access), and with `pipefail` active that would make
# `ssh | grep` always report non-zero regardless of what grep matched.
ssh_probe="$(ssh -T git@github.com -o BatchMode=yes -o StrictHostKeyChecking=accept-new 2>&1 || true)"
if ! grep -q "successfully authenticated" <<< "$ssh_probe"; then
  echo
  echo "=================================================================="
  echo "Add this PUBLIC key as a read-only Deploy Key on BOTH repos before"
  echo "continuing (it's just a public key — safe to paste anywhere):"
  echo
  cat "$DEPLOY_KEY.pub"
  echo
  echo "  https://github.com/skmdkhasim/nija-manpower-tenant-app/settings/keys"
  echo "  https://github.com/skmdkhasim/manpower-admin-portal/settings/keys"
  echo "(Add deploy key -> paste it -> leave \"Allow write access\" UNCHECKED -> Add key)"
  echo "=================================================================="
  echo
  read -rp "Press Enter once you've added it to both repos... " _
fi

echo "==> Cloning both repos into $APPS_DIR"
sudo mkdir -p "$APPS_DIR"
sudo chown "$USER":"$USER" "$APPS_DIR"

if [ ! -d "$APPS_DIR/tenant-app/.git" ]; then
  git clone "$TENANT_REPO" "$APPS_DIR/tenant-app"
else
  echo "tenant-app already cloned, skipping."
fi

if [ ! -d "$APPS_DIR/admin-portal/.git" ]; then
  git clone "$ADMIN_REPO" "$APPS_DIR/admin-portal"
else
  echo "admin-portal already cloned, skipping."
fi

echo "==> Scaffolding .env files (edit these with real secrets before starting either app)"
[ -f "$APPS_DIR/tenant-app/.env" ] || cp "$APPS_DIR/tenant-app/.env.example" "$APPS_DIR/tenant-app/.env"
[ -f "$APPS_DIR/admin-portal/.env" ] || cp "$APPS_DIR/admin-portal/.env.example" "$APPS_DIR/admin-portal/.env"

cat <<'EOF'

==================================================================
Provisioning complete. Three things left, all manual and one-time:

1. Log out and back in (or run `newgrp docker`) so your user can run
   docker without sudo.

2. Edit the real secrets before first boot:
     nano /opt/apps/tenant-app/.env
     nano /opt/apps/admin-portal/.env
   At minimum set: DB_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
   and the SEED_*_PASSWORD / SEED_SUPER_ADMIN_PASSWORD values.
   Generate strong secrets with: openssl rand -hex 32

3. First boot of each app (this also proves everything works before CI
   ever touches it):
     cd /opt/apps/admin-portal  && docker compose up -d --build
     cd /opt/apps/tenant-app    && docker compose up -d --build

Open these inbound ports in the EC2 instance's Security Group:
  3000, 3001  (Super Admin Portal frontend/backend)
  3010, 3011  (Tenant application frontend/backend)

From here on, pushing to each repo's default branch (main / master)
runs CI, then SSHes in and re-runs `git pull && docker compose up -d
--build` automatically — see each repo's .github/workflows/ci.yml. That
`git pull` uses the same SSH deploy key set up above, so it will never
prompt for credentials.
==================================================================
EOF
