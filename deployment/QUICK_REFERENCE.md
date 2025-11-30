# 🚀 Deployment Quick Reference

Quick commands for common deployment tasks.

## 🐳 Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart python-api
docker-compose restart nuxt-app

# Rebuild after code changes
docker-compose up -d --build

# Scale services
docker-compose up -d --scale python-api=3

# Remove all data (DANGEROUS)
docker-compose down -v
```

## 🖥️ Systemd Services

```bash
# Start services
sudo systemctl start python-api
sudo systemctl start nuxt-app

# Stop services
sudo systemctl stop python-api
sudo systemctl stop nuxt-app

# Restart services
sudo systemctl restart python-api
sudo systemctl restart nuxt-app

# Check status
sudo systemctl status python-api
sudo systemctl status nuxt-app

# Enable auto-start on boot
sudo systemctl enable python-api
sudo systemctl enable nuxt-app

# Disable auto-start
sudo systemctl disable python-api
sudo systemctl disable nuxt-app

# View logs
sudo journalctl -u python-api -f
sudo journalctl -u nuxt-app -f
sudo journalctl -u python-api -n 100 --no-pager
```

## 🔄 Updates

```bash
# Pull latest code
git pull origin main

# Update Python dependencies
source venv/bin/activate
pip install -r python_api/requirements.txt

# Update Node.js dependencies
npm ci

# Rebuild Nuxt
npm run build

# Restart services (systemd)
sudo systemctl restart python-api nuxt-app

# Restart services (Docker)
docker-compose restart
```

## 📊 Health & Monitoring

```bash
# Run health checks
cd deployment
./health_check.sh

# Check service status
sudo systemctl status python-api nuxt-app nginx redis-server

# View all logs
sudo journalctl -u python-api -u nuxt-app -f

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
htop

# Docker resource usage
docker stats

# Test API endpoint
curl http://localhost:8000/health
curl http://localhost:8000/api/analytics/eda/summary

# Test Nuxt app
curl http://localhost:3000/
```

## 💾 Backups

```bash
# Manual full backup
cd deployment
./backup.sh --full

# Manual incremental backup
./backup.sh

# Schedule daily backup (cron)
sudo crontab -e
# Add: 0 2 * * * /var/www/matlab-mobile-dataset/deployment/backup.sh --full

# List backups
ls -lh /var/backups/matlab-mobile-dataset/

# Restore from backup
cd /var/backups/matlab-mobile-dataset/
tar -xzf models_YYYYMMDD_HHMMSS.tar.gz -C /var/www/matlab-mobile-dataset/python_api/
```

## 🔒 SSL/TLS

```bash
# Obtain Let's Encrypt certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Renew certificate
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run

# Check certificate expiry
sudo certbot certificates
```

## 🌐 Nginx

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx status
sudo systemctl status nginx
```

## 🗄️ Redis

```bash
# Start Redis
sudo systemctl start redis-server

# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping  # Should return "PONG"

# Clear cache
redis-cli FLUSHALL

# Monitor Redis
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory
```

## 🔧 Troubleshooting

```bash
# Check port usage
sudo lsof -i :8000  # Python API
sudo lsof -i :3000  # Nuxt app
sudo lsof -i :80    # Nginx HTTP
sudo lsof -i :443   # Nginx HTTPS

# Kill process on port
sudo kill -9 $(sudo lsof -t -i:8000)

# Check Python API health
curl -f http://localhost:8000/health || echo "FAILED"

# Check Nuxt app health
curl -f http://localhost:3000/ || echo "FAILED"

# View systemd unit file
systemctl cat python-api
systemctl cat nuxt-app

# Reload systemd daemon
sudo systemctl daemon-reload

# Check environment variables
sudo systemctl show python-api --property=Environment
sudo systemctl show nuxt-app --property=Environment

# Test Python API manually
cd /var/www/matlab-mobile-dataset/python_api
source ../venv/bin/activate
python api.py

# Test Nuxt app manually
cd /var/www/matlab-mobile-dataset
node .output/server/index.mjs
```

## 🔥 Emergency Commands

```bash
# Stop all services
sudo systemctl stop python-api nuxt-app nginx

# Emergency restart
sudo systemctl restart python-api nuxt-app nginx redis-server

# Reset everything (Docker)
docker-compose down
docker-compose up -d --build

# Full system reboot
sudo reboot

# Check system logs
sudo journalctl -xe

# Disk space cleanup
sudo apt-get clean
sudo apt-get autoremove
docker system prune -a
```

## 📈 Performance Tuning

```bash
# Increase worker processes (Python API)
# Edit: /etc/systemd/system/python-api.service
# Change: --workers 4

# Enable compression (Nginx)
# Already enabled in nginx.conf

# Optimize Redis
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Monitor slow queries
redis-cli SLOWLOG GET 10
```

## 🎯 One-Line Deployment

```bash
# Full deployment from scratch
git pull && source venv/bin/activate && pip install -r python_api/requirements.txt && npm ci && npm run build && sudo systemctl restart python-api nuxt-app && ./deployment/health_check.sh
```

## 📞 Common URLs

- **Python API:** http://localhost:8000 or https://yourdomain.com/api
- **API Docs:** http://localhost:8000/docs
- **Nuxt App:** http://localhost:3000 or https://yourdomain.com
- **Analytics:** http://localhost:3000/analytics
- **Predictions:** http://localhost:3000/predict

## 🆘 Support Resources

- **Deployment Guide:** [deployment/README.md](README.md)
- **Main README:** [../README.md](../README.md)
- **API Documentation:** [../python_api/README.md](../python_api/README.md)
- **Logs Location:** `/var/log/nginx/`, `journalctl -u <service>`
- **Backup Location:** `/var/backups/matlab-mobile-dataset/`
