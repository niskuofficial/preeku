#!/bin/bash
# Preeku - AWS EC2 Deployment Script v2
# Ubuntu 22.04 | Domain: preeku.niskutech.com
set -e

APP_DIR="/var/www/preeku"
DOMAIN="preeku.niskutech.com"
REPO="https://github.com/niskuofficial/preeku"

echo "======================================"
echo "  Preeku AWS Deploy v2"
echo "======================================"

# Load NVM always
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Step 1: Install NVM + Node if not present
if ! command -v node &>/dev/null; then
  echo "[1] Installing Node.js..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  \. "$NVM_DIR/nvm.sh"
  nvm install 20
else
  echo "[1] Node $(node --version) already installed"
  nvm use 20 2>/dev/null || true
fi

# Step 2: Install pnpm if not present
if ! command -v pnpm &>/dev/null; then
  echo "[2] Installing pnpm..."
  npm install -g pnpm pm2
else
  echo "[2] pnpm $(pnpm --version) already installed"
fi

# Ensure pm2 is installed
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

# Step 3: Install nginx + certbot if not present
if ! command -v nginx &>/dev/null; then
  echo "[3] Installing nginx + certbot..."
  sudo apt-get install -y nginx certbot python3-certbot-nginx
else
  echo "[3] nginx already installed"
fi

# Step 4: PostgreSQL
if ! command -v psql &>/dev/null; then
  echo "[4] Installing PostgreSQL..."
  sudo apt-get install -y postgresql postgresql-contrib
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
fi

# Create DB/user (ignore errors if already exists)
echo "[4] Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER preeku_user WITH PASSWORD 'Preeku\$DB2024!';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE preeku_db OWNER preeku_user;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE preeku_db TO preeku_user;" 2>/dev/null || true

DB_URL="postgresql://preeku_user:Preeku\$DB2024!@localhost:5432/preeku_db"

# Step 5: Clone or pull repo
echo "[5] Syncing code..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR && git pull origin main
else
  git clone $REPO $APP_DIR
  cd $APP_DIR
fi

# Step 6: Write .env
echo "[6] Setting up .env..."
if [ ! -f "$APP_DIR/.env" ] || ! grep -q "CLERK_SECRET_KEY=sk_" "$APP_DIR/.env"; then
  echo ""
  echo "======================================" 
  echo "  Ab aapko credentials enter karne hain"
  echo "======================================"
  read -p "ANGEL_API_KEY: " angel_api
  read -p "ANGEL_CLIENT_ID: " angel_id
  read -p "ANGEL_PASSWORD: " angel_pass
  read -p "ANGEL_TOTP_SECRET: " angel_totp
  read -p "CLERK_SECRET_KEY (sk_ se shuru hoga): " clerk_secret
  read -p "VITE_CLERK_PUBLISHABLE_KEY (pk_ se shuru hoga): " clerk_pub

  cat > $APP_DIR/.env <<ENVEOF
DATABASE_URL=$DB_URL
NODE_ENV=production
SESSION_SECRET=$(openssl rand -hex 32)
ANGEL_API_KEY=$angel_api
ANGEL_CLIENT_ID=$angel_id
ANGEL_PASSWORD=$angel_pass
ANGEL_TOTP_SECRET=$angel_totp
CLERK_SECRET_KEY=$clerk_secret
VITE_CLERK_PUBLISHABLE_KEY=$clerk_pub
EXPO_PUBLIC_DOMAIN=$DOMAIN
PORT=8080
ENVEOF
  echo ".env file saved!"
else
  echo ".env already configured, skipping..."
fi

# Load env vars
set -a; source $APP_DIR/.env; set +a

# Step 7: Install dependencies
echo "[7] Installing dependencies..."
cd $APP_DIR
pnpm install

# Step 8: Build
echo "[8] Building web app..."
pnpm --filter @workspace/preeku run build

echo "[8] Building API server..."
pnpm --filter @workspace/api-server run build

# Step 9: PM2
echo "[9] Starting API with PM2..."
cat > $APP_DIR/ecosystem.config.cjs <<PMEOF
module.exports = {
  apps: [{
    name: 'preeku-api',
    script: './artifacts/api-server/dist/index.mjs',
    cwd: '$APP_DIR',
    env_file: '$APP_DIR/.env',
    interpreter: 'node',
    interpreter_args: '--enable-source-maps',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '400M'
  }]
}
PMEOF

pm2 delete preeku-api 2>/dev/null || true
pm2 start $APP_DIR/ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:$(which node) $(which pm2) startup systemd -u $USER --hp $HOME | tail -1 | sudo bash || true

# Step 10: Nginx
echo "[10] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/preeku > /dev/null <<NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 10M;

    root $APP_DIR/artifacts/preeku/dist/public;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/preeku /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Step 11: SSL
echo "[11] Setting up SSL..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m preeku.com@gmail.com || echo "SSL baad mein try karo — DNS propagate hone do"

echo ""
echo "======================================"
echo "  DEPLOY COMPLETE!"
echo "  URL: https://$DOMAIN"
echo "  Admin: https://$DOMAIN/admin"
echo "  PM2: pm2 status"
echo "  Logs: pm2 logs preeku-api"
echo "======================================"
