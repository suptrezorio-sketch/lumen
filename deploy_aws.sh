#!/bin/bash
# Usage: ./deploy_aws.sh

SERVER_IP="13.51.109.252"
SSH_KEY="/Users/panfi.love/Downloads/Server5034!.pem"
SSH_USER="ec2-user"
SSH="ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$SERVER_IP"
SCP="scp -o StrictHostKeyChecking=no -i $SSH_KEY"

echo "==> Preparing AWS EC2 server $SERVER_IP..."

# 1. Install dependencies on server
$SSH << 'REMOTE'
# Remove set -e to prevent exit on package manager conflicts
export DEBIAN_FRONTEND=noninteractive

echo "--- Install nginx, unzip, curl ---"
# Support both Amazon Linux/CentOS (yum) and Ubuntu/Debian (apt)
sudo yum install -y nginx unzip curl || sudo apt-get install -y nginx unzip curl

echo "--- Create app directories ---"
sudo mkdir -p /var/www/app
sudo mkdir -p /var/www/crm
sudo mkdir -p /var/www/pocketbase
sudo chown -R $USER:$USER /var/www

echo "--- Download PocketBase 0.22 ---"
cd /var/www/pocketbase
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
User=root
WorkingDirectory=/var/www/pocketbase
ExecStart=/var/www/pocketbase/pocketbase serve --http=0.0.0.0:8090 --dir=/var/www/pocketbase/pb_data
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVC

sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl restart pocketbase
echo "PocketBase started"

echo "Nginx already configured with SSL. Skipping Nginx setup."
REMOTE

echo "==> Building PWA locally..."
cd /Users/panfi.love/Downloads/lumen-bank

# Write .env with server IP
cat > .env.production.local << ENVEOF
VITE_PB_URL=
VITE_BACKEND_URL=
ENVEOF

npm run build

echo "==> Uploading PWA build to server (APP & CRM)..."
# Upload to app
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i $SSH_KEY" dist/ $SSH_USER@$SERVER_IP:/var/www/app/
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i $SSH_KEY" dist/ $SSH_USER@$SERVER_IP:/var/www/crm/

echo "==> Uploading local PocketBase data (pb_data)..."
if [ -d "/Users/panfi.love/Downloads/lumen-bank/pocketbase/pb_data" ]; then
  $SCP -r /Users/panfi.love/Downloads/lumen-bank/pocketbase/pb_data $SSH_USER@$SERVER_IP:/var/www/pocketbase/
fi
if [ -d "/Users/panfi.love/Downloads/lumen-bank/pocketbase/pb_migrations" ]; then
  $SCP -r /Users/panfi.love/Downloads/lumen-bank/pocketbase/pb_migrations $SSH_USER@$SERVER_IP:/var/www/pocketbase/
fi

# Restart pocketbase to apply migrations
$SSH "sudo systemctl restart pocketbase"

echo ""
echo "=============================================="
echo "  DEPLOY COMPLETE"
echo "  App:      http://${SERVER_IP}"
echo "  CRM:      http://${SERVER_IP}/admin"
echo "  PB Admin: http://${SERVER_IP}/_/"
echo "=============================================="
