#!/bin/bash
# Replit Disk Cleanup Script
# Run this manually if you encounter "disk quota exceeded" errors

echo "🧹 Starting Replit disk cleanup..."
echo ""

# Function to show disk usage
show_disk_usage() {
    echo "📊 Current disk usage:"
    du -sh . 2>/dev/null
    echo ""
}

# Show initial disk usage
show_disk_usage

# 1. Clean npm cache
echo "1️⃣  Cleaning npm cache..."
rm -rf /tmp/npm-cache/* 2>/dev/null
rm -rf ~/.npm 2>/dev/null
npm cache clean --force 2>/dev/null
echo "   ✅ npm cache cleaned"
echo ""

# 2. Clean Nuxt build artifacts
echo "2️⃣  Cleaning Nuxt build artifacts..."
rm -rf .nuxt 2>/dev/null
rm -rf .output 2>/dev/null
rm -rf .nitro 2>/dev/null
rm -rf .cache 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "   ✅ Nuxt artifacts cleaned"
echo ""

# 3. Clean Python cache
echo "3️⃣  Cleaning Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
find . -type f -name "*.pyo" -delete 2>/dev/null
rm -rf .pytest_cache 2>/dev/null
rm -rf .mypy_cache 2>/dev/null
python3 -m pip cache purge 2>/dev/null
echo "   ✅ Python cache cleaned"
echo ""

# 4. Clean test artifacts
echo "4️⃣  Cleaning test artifacts..."
rm -rf test-results 2>/dev/null
rm -rf playwright-report 2>/dev/null
rm -rf coverage 2>/dev/null
rm -rf .nyc_output 2>/dev/null
echo "   ✅ Test artifacts cleaned"
echo ""

# 5. Clean logs
echo "5️⃣  Cleaning logs..."
find . -type f -name "*.log" -delete 2>/dev/null
rm -rf logs 2>/dev/null
echo "   ✅ Logs cleaned"
echo ""

# 6. Clean temporary files
echo "6️⃣  Cleaning temporary files..."
rm -rf tmp 2>/dev/null
rm -rf temp 2>/dev/null
find . -type f -name "*.tmp" -delete 2>/dev/null
find . -type f -name "*.bak" -delete 2>/dev/null
echo "   ✅ Temporary files cleaned"
echo ""

# Show final disk usage
show_disk_usage

echo "✨ Cleanup complete!"
echo ""
echo "💡 If you still have issues:"
echo "   1. Run: rm -rf node_modules && npm install"
echo "   2. Restart the Repl"
echo "   3. Check REPLIT_GUIDE.md for more tips"
