# 🚀 Deployment Quick Reference (moved to docs/deployment)

Use these commands with the `infrastructure/` path where applicable.

## Systemd Services

```bash
sudo systemctl start python-api
sudo systemctl start nuxt-app
sudo systemctl restart python-api nuxt-app
sudo systemctl status python-api nuxt-app
sudo journalctl -u python-api -f
```

## Health & Monitoring

```bash
./infrastructure/scripts/health_check.sh
sudo journalctl -u python-api -u nuxt-app -f
df -h
free -h
```

## Backups

```bash
./infrastructure/scripts/backup.sh --full
```
