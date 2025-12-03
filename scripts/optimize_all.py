"""
Master optimization script - runs all optimizations at once.
"""
import os
import subprocess
import sys
from pathlib import Path

# Ensure UTF-8 encoding for emoji support
os.environ['PYTHONIOENCODING'] = 'utf-8'

def run_script(script_name: str, args: list[str] = []) -> bool:
    """Run a Python script and return success status"""
    try:
        # Use venv Python if available
        venv_python = Path('venv/Scripts/python.exe')
        python_exe = str(venv_python) if venv_python.exists() else sys.executable

        result = subprocess.run(
            [python_exe, f'scripts/{script_name}'] + args,
            env={**os.environ, 'PYTHONIOENCODING': 'utf-8'},
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running {script_name}: {e}")
        return False

def main():
    print("="*70)
    print(" 🚀 MASTER OPTIMIZATION TOOL")
    print("="*70)
    print("\nThis will optimize:")
    print("  1. ML Models (.pkl files)")
    print("  2. Images (.png, .jpg files)")
    print("  3. CSV Data files")
    print("\n" + "="*70 + "\n")

    # Check if scripts exist
    scripts_dir = Path('scripts')
    if not scripts_dir.exists():
        print("❌ Scripts directory not found!")
        return

    # Step 1: Optimize ML models
    print("\n" + "🤖 STEP 1: OPTIMIZING ML MODELS")
    print("-" * 70)
    success = run_script('optimize_models.py')
    if not success:
        print("⚠️  Model optimization had issues, continuing...\n")

    # Step 2: Optimize images
    print("\n" + "🖼️  STEP 2: OPTIMIZING IMAGES")
    print("-" * 70)
    success = run_script('optimize_images.py')
    if not success:
        print("⚠️  Image optimization had issues, continuing...\n")

    # Step 3: Optimize CSV files
    print("\n" + "📊 STEP 3: OPTIMIZING CSV DATA")
    print("-" * 70)
    success = run_script('optimize_csv.py')
    if not success:
        print("⚠️  CSV optimization had issues, continuing...\n")

    # Final summary
    print("\n" + "="*70)
    print("✅ OPTIMIZATION COMPLETE!")
    print("="*70)
    print("\n📝 Next Steps:")
    print("  1. Review optimized files (*_optimized.*, *.webp, *.csv.gz)")
    print("  2. Test that everything still works")
    print("  3. Replace original files if satisfied")
    print("  4. Update code to use .webp images and .csv.gz files")
    print("\n💡 To replace models: python scripts/optimize_models.py --replace")

if __name__ == '__main__':
    main()
