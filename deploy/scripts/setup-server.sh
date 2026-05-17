#!/bin/bash
# ─── Suprfly Server Setup Script ───
# Run as root on a fresh Ubuntu 22.04 VPS (Linode)
set -e

echo "=== Suprfly Server Setup ==="

# 1. Create app user
adduser --disabled-password --gecos "" suprfly || true
usermod -aG sudo suprfly
mkdir -p /home/suprfly/{apps,logs,backups/postgres,scripts}
chown -R suprfly:suprfly /home/suprfly

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Install PM2
npm install -g pm2

# 4. Install PostgreSQL 16
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get install -y postgresql-16

# 5. Install Redis
apt-get install -y redis-server
systemctl enable redis-server

# 6. Configure PostgreSQL
sudo -u postgres psql -c "CREATE USER suprfly WITH PASSWORD 'CHANGE_ME_TO_STRONG_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE suprfly OWNER suprfly;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE suprfly TO suprfly;"

# 7. Install Nginx
apt-get install -y nginx
systemctl enable nginx

# 8. Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx

# 9. Firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 10. Install fail2ban
apt-get install -y fail2ban
systemctl enable fail2ban

# 11. Security hardening
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# 12. Auto security updates
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 13. Redis security
cat >> /etc/redis/redis.conf << 'EOF'
bind 127.0.0.1
requirepass CHANGE_ME_TO_STRONG_REDIS_PASSWORD
rename-command FLUSHDB ""
rename-command FLUSHALL ""
EOF
systemctl restart redis-server

# 14. PM2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u suprfly --hp /home/suprfly

# 15. Set up log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7

echo ""
echo "=== Server setup complete! ==="
echo "Next steps:"
echo "  1. Replace CHANGE_ME passwords in this script"
echo "  2. Clone repo: su - suprfly && cd apps && git clone <repo> suprfly"
echo "  3. Copy .env files to backend/"
echo "  4. Run: cd backend && npm ci && npx prisma migrate deploy && npm run build"
echo "  5. Run: cd ../dashboard && npm ci && npm run build"
echo "  6. Start: pm2 start ecosystem.config.js --env production"
echo "  7. Set up SSL: certbot --nginx -d api.suprfly.io -d app.suprfly.io -d suprfly.io"
echo "  8. Copy nginx configs from deploy/nginx/ to /etc/nginx/sites-available/"
