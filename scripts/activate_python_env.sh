#!/bin/bash
# Activate Python Virtual Environment
# Quick script to activate the venv

if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found!"
    echo "Please run setup_python_env.sh first"
    exit 1
fi

source venv/bin/activate
echo "Python virtual environment activated!"
echo ""
echo "You can now use:"
echo "  python view_mat_file.py path/to/file.mat"
echo ""

# Keep shell open
# SECURITY: Validate SHELL to prevent command injection
if [ -z "$SHELL" ]; then
    # Default to bash if SHELL is not set
    exec /bin/bash
elif [ -x "$SHELL" ] && [ -f "$SHELL" ]; then
    # Only execute if SHELL is a valid executable file
    # Additional check: ensure it's in a trusted location
    case "$SHELL" in
        /bin/*|/usr/bin/*|/usr/local/bin/*)
            exec "$SHELL"
            ;;
        *)
            # Fallback to bash if SHELL is in an unexpected location
            echo "Warning: SHELL ($SHELL) is not in a trusted location, using /bin/bash"
            exec /bin/bash
            ;;
    esac
else
    # Fallback to bash if SHELL is invalid
    echo "Warning: Invalid SHELL ($SHELL), using /bin/bash"
    exec /bin/bash
fi
