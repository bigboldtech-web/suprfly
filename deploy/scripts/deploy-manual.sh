#!/bin/bash
# ──────────────────────────────────────────────
# Suprfly Manual Deploy Script
# Run on the production server as suprfly user
# ──────────────────────────────────────────────
set -euo pipefail

APP_DIR="/home/suprfly/apps/suprfly"
cd "$APP_DIR"

echo "═══ Pulling latest code ═══"
git pull origin main

echo "═══ Building Backend ═══"
cd "$APP_DIR/backend"
npm ci --production
npx prisma generate
npx prisma migrate deploy
npm run build

echo "═══ Building Dashboard ═══"
cd "$APP_DIR/dashboard"
npm ci
NEXT_PUBLIC_API_URL=https://api.suprfly.io/api/v1 npm run build

echo "═══ Restarting Services ═══"
pm2 restart suprfly-api --update-env
pm2 restart suprfly-dashboard --update-env

echo "═══ Verifying ═══"
sleep 5
pm2 status
curl -sf https://api.suprfly.io/health && echo " API OK" || echo " API FAILED"
curl -sf https://app.suprfly.io -o /dev/null && echo " Dashboard OK" || echo " Dashboard FAILED"

echo ""
echo "═══ Deploy complete! ═══"
