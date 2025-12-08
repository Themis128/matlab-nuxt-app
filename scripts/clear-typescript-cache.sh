#!/bin/bash
# Clear TypeScript Language Server Cache
# This script clears TypeScript-related caches to fix server crashes

echo "🧹 Clearing TypeScript Language Server Cache..."

CLEARED=false

# 1. Clear .vscode/.typescript if it exists
if [ -d ".vscode/.typescript" ]; then
    rm -rf ".vscode/.typescript"
    echo "✅ Deleted .vscode/.typescript folder"
    CLEARED=true
fi

# 2. Clear .nuxt cache (Nuxt TypeScript cache)
if [ -d ".nuxt" ]; then
    echo "⚠️  Found .nuxt folder. This contains Nuxt's TypeScript cache."
    echo "   Run 'npm run prepare' to regenerate it after clearing."
    read -p "   Delete .nuxt folder? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf ".nuxt"
        echo "✅ Deleted .nuxt folder"
        CLEARED=true
    fi
fi

# 3. Clear node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
    rm -rf "node_modules/.cache"
    echo "✅ Deleted node_modules/.cache folder"
    CLEARED=true
fi

# 4. Information about VS Code workspace storage
echo ""
echo "📋 Additional Cache Locations:"
echo "   VS Code stores TypeScript cache in workspace storage."
echo "   Location: ~/.config/Code/User/workspaceStorage/ (Linux/Mac)"
echo "   Location: %APPDATA%\Code\User\workspaceStorage\ (Windows)"
echo "   To clear: Close VS Code, then delete workspace storage folders"

if [ "$CLEARED" = false ]; then
    echo ""
    echo "ℹ️  No TypeScript cache folders found in workspace (this is normal)"
    echo "   The TypeScript server cache is managed by VS Code internally."
else
    echo ""
    echo "✅ Cache clearing complete!"
fi

echo ""
echo "💡 Next Steps:"
echo "   1. Restart VS Code"
echo "   2. Or run: TypeScript: Restart TS Server (Ctrl+Shift+P)"
if [ "$CLEARED" = true ] && [ ! -d ".nuxt" ]; then
    echo "   3. Run: npm run prepare (to regenerate .nuxt)"
fi
