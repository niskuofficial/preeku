#!/bin/bash

# Preeku - AWS EC2 Deployment Script
# EC2: Ubuntu 22.04 LTS | Run as: bash deploy-aws.sh
# Domain: preeku.niskutech.com

set -e

DOMAIN="preeku.niskutech.com"
REPO="https://github.com/niskuofficial/preeku"
APP_DIR="/var/www/preeku"

echo "======================================"
echo "  Preeku - AWS Deployment Starting"
echo "======================================"

# 1. System update
echo "[1/8] System update..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Node.js 20 via NVM
echo "[2/8] Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20 && nvm use 20 && nvm alias default 20

# 3. Install pnpm & pm2
echo "[3/8] Installing pnpm and PM2..."
npm install -g pnpm pm2

# 4. Install nginx & certbot
echo "[4/8] Installing Nginx and Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 5. Install PostgreSQL
echo "[5/8] Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql && sudo systemctl enable postgresql

# Create DB and user
sudo -u postgres psql <<EOF
CREATE USER preeku_user WITH PASSWORD 'Preeku@DB2024!';
CREATE DATABASE preeku_db OWNER preeku_user;
GRANT ALL PRIVILEGES ON DATABASE preeku_db TO preeku_user;
EOF

DB_URL="postgresql://preeku_user:Preeku%40DB2024!@localhost:5432/preeku_db"
echo "DB created: $DB_URL"

# 6. Clone and setup repo
echo "[6/8] Cloning repository..."
sudo mkdir -p $APP_DIR && sudo chown $USER:$USER $APP_DIR
git clone $REPO $APP_DIR
cd $APP_DIR

# Create .env file
cat > $APP_DIR/.env <<EOF
DATABASE_URL=$DB_URL
NODE_ENV=production
SESSION_SECRET=preeku-prod-secret-$(openssl rand -hex 16)

# IMPORTANT: Yeh values apni credentials se replace karo
ANGEL_API_KEY=your_angel_api_key
ANGEL_CLIENT_ID=your_angel_client_id
ANGEL_PASSWORD=your_angel_password
ANGEL_TOTP_SECRET=your_angel_totp_secret

# Clerk keys (apni Clerk dashboard se copy karo)
CLERK_SECRET_KEY=your_clerk_secret_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

EXPO_PUBLIC_DOMAIN=$DOMAIN
PORT=8080
EOF

echo ""
echo "⚠️  IMPORTANT: Edit .env file with your actual credentials:"
echo "   nano $APP_DIR/.env"
echo ""
read -p "Kya aapne .env file update ki? (y se aage badho): " confirm
if [ "$confirm" != "y" ]; then
  echo "Pehle .env file update karo phir script dobara run karo."
  exit 1
fi

# 7. Install deps and build
echo "[7/8] Installing dependencies and building..."
cd $APP_DIR
pnpm install --frozen-lockfile

# Run DB migrations
pnpm --filter @workspace/db run push || true

# Build web app
pnpm --filter @workspace/preeku run build

# Build API server
pnpm --filter @workspace/api-server run build

# 8. Setup PM2 for API server
echo "[8/8] Setting up PM2 and Nginx..."
cat > $APP_DIR/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'preeku-api',
    script: './artifacts/api-server/dist/index.mjs',
    cwd: '$APP_DIR',
    env_file: '$APP_DIR/.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    interpreter: 'node',
    interpreter_args: '--enable-source-maps'
  }]
}
EOF

pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup | tail -1 | sudo bash

# Setup Nginx
sudo tee /etc/nginx/sites-available/preeku <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Web App (static files)
    root $APP_DIR/artifacts/preeku/dist/public;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/preeku /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# SSL Certificate
echo ""
echo "======================================"
echo "  SSL Certificate Setup"
echo "======================================"
echo "Pehle DNS record add karo:"
echo "  Type: A"
echo "  Name: preeku"
echo "  Value: $(curl -s ifconfig.me)"
echo "  TTL: Auto"
echo ""
read -p "DNS propagate ho gaya? (y se SSL setup shuru hoga): " dns_ready
if [ "$dns_ready" == "y" ]; then
  sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m preeku.com@gmail.com
  sudo systemctl reload nginx
fi

echo ""
echo "======================================"
echo "  Deployment Complete!"
echo "======================================"
echo "  Web App: https://$DOMAIN"
echo "  Admin Panel: https://$DOMAIN/admin"
echo "  API: https://$DOMAIN/api"
echo ""
echo "  PM2 status: pm2 status"
echo "  Nginx status: sudo systemctl status nginx"
echo "  Logs: pm2 logs preeku-api"
echo "======================================"
