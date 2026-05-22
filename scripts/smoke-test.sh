#!/usr/bin/env bash
set -e
API="${VITE_BACKEND_URL:-http://localhost:5001}"

echo "Health..."
curl -sf "$API/health" | head -c 200
echo ""

echo "Banners..."
curl -sf "$API/api/banners" | head -c 200
echo ""

echo "Done."
