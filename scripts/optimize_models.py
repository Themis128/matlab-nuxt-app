"""
Optimize trained ML model files by compressing and removing unnecessary data.
Reduces file size while maintaining model performance.
"""
import pickle
import joblib
import gzip
import os
from pathlib import Path

def optimize_sklearn_model(model_path: str, output_path: str | None = None) -> dict:
    """
    Optimize a scikit-learn pickle file by:
    1. Loading and re-saving with highest compression
    2. Using joblib with compression
    3. Optionally removing training metadata
    
    Returns dict with original_size, optimized_size, reduction_percent
    """
    if output_path is None:
        output_path = model_path.replace('.pkl', '_optimized.pkl')
    
    original_size = os.path.getsize(model_path)
    
    # Load model
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    # Save with joblib compression (more efficient than pickle)
    joblib.dump(model, output_path, compress=9)
    
    optimized_size = os.path.getsize(output_path)
    reduction = ((original_size - optimized_size) / original_size) * 100
    
    return {
        'original_size': original_size,
        'optimized_size': optimized_size,
        'reduction_percent': reduction,
        'original_mb': round(original_size / 1_048_576, 2),
        'optimized_mb': round(optimized_size / 1_048_576, 2)
    }

def optimize_all_models(models_dir: str = 'python_api/trained_models'):
    """Optimize all .pkl files in the models directory"""
    models_path = Path(models_dir)
    
    if not models_path.exists():
        print(f"❌ Directory not found: {models_dir}")
        return
    
    pkl_files = list(models_path.glob('*.pkl'))
    
    if not pkl_files:
        print(f"ℹ️  No .pkl files found in {models_dir}")
        return
    
    print(f"🔍 Found {len(pkl_files)} model files to optimize\n")
    
    results = []
    for pkl_file in pkl_files:
        print(f"Processing: {pkl_file.name}...")
        
        try:
            # Create optimized filename
            optimized_path = str(pkl_file).replace('.pkl', '_optimized.joblib')
            
            result = optimize_sklearn_model(str(pkl_file), optimized_path)
            result['filename'] = pkl_file.name
            result['optimized_filename'] = Path(optimized_path).name
            results.append(result)
            
            print(f"  ✓ {result['original_mb']} MB → {result['optimized_mb']} MB "
                  f"({result['reduction_percent']:.1f}% reduction)")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("OPTIMIZATION SUMMARY")
    print("="*60)
    
    total_original = sum(r['original_size'] for r in results)
    total_optimized = sum(r['optimized_size'] for r in results)
    total_reduction = ((total_original - total_optimized) / total_original) * 100
    
    print(f"Total original size:   {total_original / 1_048_576:.2f} MB")
    print(f"Total optimized size:  {total_optimized / 1_048_576:.2f} MB")
    print(f"Total space saved:     {(total_original - total_optimized) / 1_048_576:.2f} MB")
    print(f"Overall reduction:     {total_reduction:.1f}%")
    print("\n📝 Optimized files saved as *_optimized.joblib")
    print("💡 Test the optimized models, then replace originals if working correctly")

def replace_with_optimized(models_dir: str = 'python_api/trained_models', backup: bool = True):
    """
    Replace original .pkl files with optimized .joblib versions
    Creates backups before replacing
    """
    models_path = Path(models_dir)
    optimized_files = list(models_path.glob('*_optimized.joblib'))
    
    if not optimized_files:
        print("❌ No optimized files found. Run optimize_all_models() first.")
        return
    
    print(f"🔄 Replacing {len(optimized_files)} model files...\n")
    
    for optimized_file in optimized_files:
        # Get original filename
        original_name = optimized_file.name.replace('_optimized.joblib', '.pkl')
        original_path = models_path / original_name
        
        if not original_path.exists():
            print(f"⚠️  Original not found: {original_name}")
            continue
        
        # Create backup
        if backup:
            backup_path = models_path / f"{original_name}.backup"
            os.rename(original_path, backup_path)
            print(f"  📦 Backed up: {original_name} → {original_name}.backup")
        
        # Rename optimized to original name (keep .joblib extension for efficiency)
        new_path = models_path / original_name.replace('.pkl', '.joblib')
        os.rename(optimized_file, new_path)
        print(f"  ✓ Replaced: {original_name} → {new_path.name}")
    
    print("\n✅ Done! Original files backed up with .backup extension")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--replace':
        print("⚠️  REPLACE MODE - This will replace original files!\n")
        confirm = input("Continue? (yes/no): ")
        if confirm.lower() == 'yes':
            optimize_all_models()
            print("\n")
            replace_with_optimized()
        else:
            print("Cancelled.")
    else:
        print("🔧 OPTIMIZATION MODE (safe - creates new files)\n")
        optimize_all_models()
        print("\n💡 To replace originals, run: python optimize_models.py --replace")
