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

# GitHub refuses to let the same SSH public key be a deploy key on more
# than one repository, so each repo gets its own key. Both aliases below
# resolve to the real github.com — the alias is only there so ~/.ssh/config
# can hand git a different IdentityFile depending on which repo it's
# talking to (the standard workaround for "multiple deploy keys, one box").
TENANT_HOST_ALIAS="tenant-app.github.com"
ADMIN_HOST_ALIAS="admin-portal.github.com"
TENANT_KEY="$HOME/.ssh/github_deploy_key_tenant"
ADMIN_KEY="$HOME/.ssh/github_deploy_key_admin"

TENANT_REPO="git@${TENANT_HOST_ALIAS}:skmdkhasim/nija-manpower-tenant-app.git"
ADMIN_REPO="git@${ADMIN_HOST_ALIAS}:skmdkhasim/manpower-admin-portal.git"
APPS_DIR="/opt/apps"

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

echo "==> Setting up dedicated SSH deploy keys for GitHub (one per repo)"
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

# Shared across both aliases below — they both resolve to the real
# github.com, so one known_hosts entry covers both.
if ! ssh-keygen -F github.com >/dev/null 2>&1; then
  ssh-keyscan -t ed25519 github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null
fi

# Generates a key + SSH config alias for one repo, and (unless it's
# already authorized) pauses to have you add it as a Deploy Key on GitHub
# before continuing. Safe to re-run — every step here is idempotent.
setup_deploy_key() {
  local key_path="$1" host_alias="$2" settings_url="$3" comment="$4"

  if [ ! -f "$key_path" ]; then
    ssh-keygen -t ed25519 -C "$comment" -f "$key_path" -N ""
  else
    echo "Key already exists at $key_path, reusing it."
  fi

  if ! grep -q "^Host $host_alias\$" "$HOME/.ssh/config" 2>/dev/null; then
    cat >> "$HOME/.ssh/config" <<EOF

Host $host_alias
  HostName github.com
  User git
  IdentityFile $key_path
  IdentitiesOnly yes
EOF
  fi
  chmod 600 "$HOME/.ssh/config"

  # Captured into a variable rather than piped directly — `ssh -T
  # git@<alias>` always exits 1 even on successful auth (GitHub grants no
  # shell), and with `pipefail` active a direct `ssh | grep` would always
  # read as "not authenticated" regardless of what grep matched.
  local probe
  probe="$(ssh -T "git@$host_alias" -o BatchMode=yes -o StrictHostKeyChecking=accept-new 2>&1 || true)"
  if ! grep -q "successfully authenticated" <<< "$probe"; then
    echo
    echo "=================================================================="
    echo "Add this PUBLIC key as a read-only Deploy Key here:"
    echo "  $settings_url"
    echo
    cat "$key_path.pub"
    echo
    echo "(Add deploy key -> paste it -> leave \"Allow write access\" UNCHECKED -> Add key)"
    echo "Each repo needs its OWN key — GitHub refuses to reuse one deploy"
    echo "key across two repos, so don't reuse a key you've already added"
    echo "to the other repo."
    echo "=================================================================="
    echo
    read -rp "Press Enter once you've added it... " _
  fi
}

setup_deploy_key "$TENANT_KEY" "$TENANT_HOST_ALIAS" \
  "https://github.com/skmdkhasim/nija-manpower-tenant-app/settings/keys" \
  "ec2-deploy-key-tenant-app"

setup_deploy_key "$ADMIN_KEY" "$ADMIN_HOST_ALIAS" \
  "https://github.com/skmdkhasim/manpower-admin-portal/settings/keys" \
  "ec2-deploy-key-admin-portal"

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
--build` automatically — see each repo's .github/workflows/ci.yml. Each
clone remembers its own alias-based remote URL, so `git pull` will keep
using the correct per-repo deploy key with no further setup.
==================================================================
EOF
