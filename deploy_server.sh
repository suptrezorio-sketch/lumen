#!/bin/bash
# Usage: ./deploy_server.sh <SERVER_IP>
# Deploys PocketBase + Lumen Bank PWA to Azure VM

SERVER_IP="${1:?Usage: $0 <SERVER_IP>}"
SSH_KEY="/Users/panfi.love/Downloads/df2b_key.pem"
SSH_USER="azureuser"
SSH="ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$SERVER_IP"
SCP="scp -o StrictHostKeyChecking=no -i $SSH_KEY"

echo "==> Preparing remote server $SERVER_IP..."

# 1. Install dependencies on server
$SSH << 'REMOTE'
set -e
export DEBIAN_FRONTEND=noninteractive

echo "--- Update packages ---"
sudo apt-get update -qq

echo "--- Install nginx, unzip, curl ---"
sudo apt-get install -y nginx unzip curl certbot python3-certbot-nginx

echo "--- Install Node.js 20 ---"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "--- Create app directories ---"
sudo mkdir -p /opt/lumen/pb_data
sudo mkdir -p /opt/lumen/www
sudo chown -R azureuser:azureuser /opt/lumen

echo "--- Download PocketBase 0.22 ---"
cd /opt/lumen
if [ ! -f pocketbase ]; then
  curl -L -o pb.zip https://github.com/pocketbase/pocketbase/releases/download/v0.22.20/pocketbase_0.22.20_linux_amd64.zip
  unzip -o pb.zip pocketbase
  rm pb.zip
  chmod +x pocketbase
fi

echo "--- Create PocketBase systemd service ---"
sudo tee /etc/systemd/system/pocketbase.service > /dev/null << 'SVC'
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=azureuser
WorkingDirectory=/opt/lumen
ExecStart=/opt/lumen/pocketbase serve --http=0.0.0.0:8090 --dir=/opt/lumen/pb_data
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVC

sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl restart pocketbase
echo "PocketBase started"

echo "--- Configure nginx ---"
sudo tee /etc/nginx/sites-available/lumen > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    root /opt/lumen/www;
    index index.html;

    # PWA — serve static, fallback to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy PocketBase API
    location /api/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # PocketBase admin UI
    location /_/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/lumen /etc/nginx/sites-enabled/lumen
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
echo "Nginx configured"
REMOTE

echo "==> Building PWA locally..."
cd /Users/panfi.love/Downloads/lumen-bank

# Write .env with server IP
cat > .env.production.local << EOF
VITE_PB_URL=http://${SERVER_IP}/api
VITE_BACKEND_URL=http://${SERVER_IP}
EOF

npm run build

echo "==> Uploading PWA build to server..."
$SCP -r dist/* $SSH_USER@$SERVER_IP:/opt/lumen/www/

echo "==> Uploading local PocketBase data (pb_data)..."
# Only upload if pb_data exists and has data
if [ -d "/Users/panfi.love/Downloads/lumen-bank/pocketbase/pb_data" ]; then
  $SCP -r /Users/panfi.love/Downloads/lumen-bank/pocketbase/pb_data/* $SSH_USER@$SERVER_IP:/opt/lumen/pb_data/ 2>/dev/null || echo "pb_data upload skipped (empty)"
fi

echo ""
echo "=============================================="
echo "  DEPLOY COMPLETE"
echo "  PWA:      http://${SERVER_IP}"
echo "  PB Admin: http://${SERVER_IP}/_/"
echo "  PB API:   http://${SERVER_IP}/api/"
echo "=============================================="
