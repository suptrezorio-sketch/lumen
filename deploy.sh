#!/bin/bash
# Quick deploy: build + upload ALL dist files to server
set -e
KEY="/Users/panfi.love/Downloads/df2b_key.pem"
HOST="azureuser@20.15.161.128"
REMOTE_DIR="/opt/lumen/www"

echo "==> Building..."
npm run build

echo "==> Uploading ALL files (including sw.js)..."
scp -o StrictHostKeyChecking=no -i "$KEY" -r dist/* "$HOST:$REMOTE_DIR/"

echo "==> Verifying sw.js on server..."
ssh -o StrictHostKeyChecking=no -i "$KEY" "$HOST" "grep -o 'index-[A-Za-z0-9]*\.js' $REMOTE_DIR/sw.js"

echo "==> Done. Hard-reload required on client devices."
