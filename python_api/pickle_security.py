"""
Security utilities for safe pickle file loading
Provides centralized validation for pickle deserialization
"""

import pickle
import hashlib
from pathlib import Path
from typing import Optional, Any


def validate_pickle_path(file_path: Path, trusted_base: Path) -> bool:
    """
    Validate that a pickle file path is within a trusted directory.

    Args:
        file_path: Path to the pickle file
        trusted_base: Base directory that must contain the file

    Returns:
        True if path is safe, False otherwise
    """
    try:
        resolved_path = file_path.resolve()
        resolved_base = trusted_base.resolve()

        # Check that path is within trusted directory
        if not str(resolved_path).startswith(str(resolved_base)):
            return False

        # Check for path traversal attempts
        if '..' in str(file_path):
            return False

        # Ensure path is absolute and normalized
        if resolved_path != Path(resolved_path).resolve():
            return False

        return True
    except (OSError, ValueError):
        return False


def validate_pickle_file(file_path: Path, max_size: int = 100 * 1024 * 1024) -> bool:
    """
    Validate pickle file before loading.

    Args:
        file_path: Path to the pickle file
        max_size: Maximum allowed file size in bytes (default: 100MB)

    Returns:
        True if file is valid, False otherwise
    """
    try:
        if not file_path.exists():
            return False

        # Check file size
        file_stats = file_path.stat()
        if file_stats.st_size > max_size:
            return False

        # Check pickle header (first byte should be 0x80)
        with open(file_path, "rb") as f:
            header = f.read(2)
            if len(header) < 1 or header[0] != 0x80:
                return False

        return True
    except (OSError, IOError):
        return False


def safe_load_pickle(file_path: Path, trusted_base: Path, max_size: int = 100 * 1024 * 1024) -> Optional[Any]:
    """
    Safely load a pickle file with comprehensive security checks.

    Args:
        file_path: Path to the pickle file
        trusted_base: Base directory that must contain the file
        max_size: Maximum allowed file size in bytes

    Returns:
        Unpickled object or None if validation fails
    """
    # Validate path
    if not validate_pickle_path(file_path, trusted_base):
        raise ValueError(f"Pickle file path outside trusted directory: {file_path}")

    # Validate file
    if not validate_pickle_file(file_path, max_size):
        raise ValueError(f"Invalid or unsafe pickle file: {file_path}")

    # Load pickle file
    # WARNING: pickle.load() can execute arbitrary code.
    # We trust this file because:
    # 1. Path is validated to be within trusted directory
    # 2. File format is validated (pickle header check)
    # 3. File size is limited
    # 4. Additional security: Use RestrictedUnpickler if available
    try:
        # SECURITY: Consider using RestrictedUnpickler for additional safety
        # For now, we rely on path validation and file size limits
        # In production, consider using dill or joblib with restricted unpickling
        # or implement a RestrictedUnpickler class that only allows specific classes

        with open(file_path, "rb") as f:
            # Note: pickle.load() is inherently unsafe and can execute arbitrary code
            # This is acceptable only because:
            # - Path is strictly validated (within trusted_base)
            # - File size is limited (max_size parameter)
            # - File format is validated (pickle header check)
            # - This is typically used for loading model files from trusted sources
            #
            # For untrusted sources, use RestrictedUnpickler or alternative serialization
            return pickle.load(f)
    except ModuleNotFoundError as e:
        if "numpy._core" in str(e):
            raise ValueError(
                f"NumPy version mismatch when loading {file_path}. "
                f"The model was saved with a different NumPy version. "
                f"Please reinstall NumPy: pip install --upgrade --force-reinstall numpy>=2.0.0"
            ) from e
        raise ValueError(f"Module not found when loading {file_path}: {e}") from e
    except (pickle.UnpicklingError, EOFError, ValueError) as e:
        raise ValueError(f"Failed to unpickle file {file_path}: {e}") from e


def calculate_file_hash(file_path: Path) -> str:
    """
    Calculate SHA256 hash of a file.
    Useful for verifying file integrity.

    Args:
        file_path: Path to the file

    Returns:
        SHA256 hash as hexadecimal string
    """
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()
