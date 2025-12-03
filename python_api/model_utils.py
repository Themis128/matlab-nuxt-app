"""
Safe Model Loading Utilities
Provides robust pickle loading with clear diagnostics for CI/CD environments
"""

import binascii
import os
import pickle


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

    # Attempt to unpickle
    try:
        with open(path, "rb") as f:
            return pickle.load(f)
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
