"""
Safe Model Loading Utilities
Provides robust pickle loading with clear diagnostics for CI/CD environments
"""

import binascii
import os
import pickle
from pathlib import Path


def safe_load_model(path, head_bytes=64):
    """
    Load a pickle file with diagnostics.
    Raises FileNotFoundError, RuntimeError with clear messages on error.

    Args:
        path: Path to the pickle file
        head_bytes: Number of bytes to read for diagnostics

    Returns:
        Loaded model object

    Raises:
        FileNotFoundError: If file doesn't exist
        RuntimeError: If file is corrupted, not a pickle, or unreadable
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")

    size = os.path.getsize(path)
    if size == 0:
        raise RuntimeError(f"Model file is empty: {path}")

    # Read the header for diagnostics
    with open(path, "rb") as f:
        head = f.read(head_bytes)

    # Quick heuristic: if the head is mostly printable text, show snippet
    printable = all(32 <= b < 127 or b in (9, 10, 13) for b in head)
    if printable:
        try:
            text_snippet = head.decode("utf-8", errors="replace")
        except Exception:
            text_snippet = repr(head)
        raise RuntimeError(
            f"Model file '{path}' looks like text (first {head_bytes} bytes):\n"
            f"{text_snippet}\n"
            "Likely causes: wrong file/path, file overwritten with logs/JSON/HTML, or upload error."
        )

    # SECURITY: Strictly validate path is within expected model directory
    # Only load pickle files from trusted locations
    abs_path = os.path.abspath(path)
    models_base = Path(__file__).parent / "trained_models"
    models_base_abs = models_base.resolve()

    # Resolve the path and ensure it's within the trusted directory
    try:
        path_resolved = Path(abs_path).resolve()
        # Check that the resolved path is within the models directory
        if not str(path_resolved).startswith(str(models_base_abs)):
            raise RuntimeError(f"Model file path outside trusted directory: {path}")
        # Additional check: ensure no path traversal
        if '..' in path or path_resolved != Path(abs_path).resolve():
            raise RuntimeError(f"Path traversal detected: {path}")
    except (OSError, ValueError) as e:
        raise RuntimeError(f"Invalid model file path: {path}") from e

    # SECURITY: Use centralized safe_load_pickle utility for secure deserialization
    try:
        from .pickle_security import safe_load_pickle
        # Use safe loading utility with 500MB limit
        return safe_load_pickle(Path(path), models_base_abs, max_size=500 * 1024 * 1024)
    except pickle.UnpicklingError as e:
        head_hex = binascii.hexlify(head).decode("ascii")
        raise RuntimeError(
            f"Failed to unpickle '{path}': {e}\n"
            f"First {head_bytes} bytes (hex): {head_hex}\n"
            "Possible causes: file is not a pickle, was overwritten with text, or is corrupted."
        ) from e


def validate_model_file(path):
    """
    Validate a model file without loading it completely.
    Returns True if file appears to be a valid pickle, False otherwise.

    Args:
        path: Path to the pickle file

    Returns:
        bool: True if file appears valid, False otherwise
    """
    try:
        safe_load_model(path, head_bytes=16)  # Just check header
        return True
    except Exception:
        return False


def get_model_info(path):
    """
    Get basic information about a model file without loading it.

    Args:
        path: Path to the model file

    Returns:
        dict: File information or error details
    """
    if not os.path.exists(path):
        return {"error": "File not found", "path": path}

    try:
        size = os.path.getsize(path)
        with open(path, "rb") as f:
            header = f.read(4)

        is_pickle = len(header) >= 2 and header[0] == 0x80

        return {
            "path": path,
            "size_bytes": size,
            "size_mb": round(size / (1024 * 1024), 2),
            "appears_valid_pickle": is_pickle,
            "header_bytes": header.hex() if header else None,
            "pickle_protocol": header[1] if is_pickle and len(header) > 1 else None,
        }
    except Exception as e:
        return {"error": str(e), "path": path}
