import importlib
import os
import sys

print("CWD:", os.getcwd())
print("PYTHONPATH includes:")
for p in sys.path[:5]:
    print("-", p)

# Ensure project root is in sys.path so 'python_api' can imported as package
project_root = os.path.abspath(os.path.join(os.getcwd(), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
try:
    m = importlib.import_module("python_api.lancedb_endpoints")
except Exception:
    m = importlib.import_module("lancedb_endpoints")
print("Imported", m.__name__)
import pkgutil

print("python-multipart installed:", pkgutil.find_loader("multipart") is not None)
try:
    print("lancedb installed:", True)
except Exception:
    print("lancedb installed:", False)
print("Routes:")
for r in m.router.routes:
    print("-", r.path)
