# 🚀 Running on Replit

This guide helps you deploy and run the Mobile Finder App on Replit successfully.

## 🎯 Quick Start

1. **Fork this Repl** or import from GitHub
2. **Click "Run"** - The app will automatically:
   - Install Node.js dependencies
   - Install Python dependencies
   - Start the Python API (port 8000)
   - Start the Nuxt dev server (port 3000)
3. **Access the app** via the Webview tab

## ⚠️ Troubleshooting Disk Quota Issues

If you encounter **"disk quota exceeded"** errors, follow these steps:

### Immediate Fix

1. **Stop the Repl** (click Stop button)
2. **Open Shell** and run cleanup commands:
   ```bash
   # Remove node_modules and reinstall
   rm -rf node_modules
   rm -rf .nuxt .output .nitro .cache
   npm cache clean --force
   npm install --prefer-offline --no-audit --no-fund
   ```

3. **Clear Python cache**:
   ```bash
   rm -rf __pycache__
   find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
   python3 -m pip cache purge
   ```

4. **Click "Run"** again

### Prevention

The following files have been configured to prevent disk quota issues:

- **`.replitignore`** - Excludes large files/folders from Replit workspace
- **`.npmrc`** - Optimizes npm to use `/tmp` for cache
- **`.replit`** - Configures environment for minimal disk usage
- **`start.sh`** - Auto-cleans temporary files on startup

### What's Excluded

The following are automatically excluded from Replit workspace:
- `node_modules/` (except during runtime)
- `.nuxt/`, `.output/`, `.nitro/`, `.cache/` (build artifacts)
- `venv/`, `__pycache__/` (Python cache)
- Test artifacts, screenshots, logs
- Large data files and MATLAB files

## 🔧 Manual Disk Cleanup

If you still have disk space issues, run these commands in Shell:

```bash
# Ultimate cleanup script
echo "🧹 Starting deep cleanup..."

# Remove all caches
rm -rf /tmp/npm-cache/*
rm -rf node_modules/.cache
rm -rf .nuxt/cache
rm -rf .output/cache
npm cache clean --force

# Remove build artifacts
rm -rf .nuxt .output .nitro dist build .cache

# Remove test artifacts
rm -rf test-results playwright-report .pytest_cache

# Remove Python caches
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete

# Check remaining disk usage
du -sh . 2>/dev/null

echo "✅ Cleanup complete!"
```

## 📊 Disk Usage Tips

1. **Monitor disk usage**:
   ```bash
   du -sh . 2>/dev/null
   du -sh */ 2>/dev/null | sort -hr | head -10
   ```

2. **Find large files**:
   ```bash
   find . -type f -size +10M 2>/dev/null
   ```

3. **Regular cleanup**: Run cleanup before long coding sessions

## 🔄 Replit Configuration

### `.replit` File

The `.replit` file is configured with:
- Node.js memory optimization (`NODE_OPTIONS`)
- NPM cache in `/tmp` (temporary, auto-cleaned)
- Nuxt telemetry disabled
- Auto-cleanup after package installs

### `.replitignore` File

Excludes large folders:
- All `node_modules/` (installed fresh each time)
- Build artifacts (`.nuxt/`, `.output/`, etc.)
- Python virtual environments
- Test reports and screenshots
- Large data files

### `.npmrc` File

Optimizes npm behavior:
- Cache in `/tmp` instead of workspace
- Prefer offline mode
- No package-lock auto-save
- Minimal logging

## 🐛 Common Issues

### Issue: "Cannot create temp file: disk quota exceeded"

**Solution**: This means the workspace is full. Run the cleanup script above.

### Issue: "npm install" fails with ENOSPC

**Solution**: 
```bash
npm cache clean --force
rm -rf node_modules
npm install --prefer-offline --no-audit --no-fund
```

### Issue: Python API won't start

**Solution**:
```bash
cd python_api
python3 -m pip install --user --no-cache-dir -r ../requirements.txt
python3 api.py
```

### Issue: Port already in use

**Solution**:
```bash
# Kill existing processes
pkill -f "python3 api.py"
pkill -f "nuxt"
# Then click Run again
```

## 📝 Notes

- **Replit Free Tier**: ~500MB workspace limit
- **Always-On**: Enabled for this Repl (stays running)
- **Auto-Sleep**: Repl may sleep after inactivity
- **Cold Start**: First run may take 2-3 minutes

## 🆘 Need Help?

1. Check the [main README](README.md) for general documentation
2. Review [deployment docs](deployment/) for advanced setup
3. Open an issue on GitHub if problems persist

---

**Last Updated**: December 2024
