"""
Security utilities for path validation and sanitization.

This module provides shared security functions to prevent path traversal
and file system security vulnerabilities across Python scripts.
"""

import os
import re
from pathlib import Path
from typing import Optional


def validate_and_resolve_path(user_input: str, base_dir: Optional[Path] = None) -> Optional[Path]:
    """
    SECURITY: Validate and resolve a file path from user input.
    Returns a safe Path object if valid, None otherwise.
    This function ensures no path traversal attacks.

    Args:
        user_input: User-provided path string
        base_dir: Base directory to validate against (defaults to current working directory)

    Returns:
        Resolved Path object if valid, None otherwise

    Example:
        >>> safe_path = validate_and_resolve_path('subfolder/file.txt')
        >>> if safe_path:
        ...     with open(safe_path) as f:
        ...         content = f.read()
    """
    if not user_input or not isinstance(user_input, str):
        return None

    try:
        # Step 1: Check for path traversal sequences before creating Path
        if '..' in user_input:
            return None

        # Step 2: Determine base directory
        if base_dir is None:
            base_dir = Path.cwd()
        else:
            base_dir = Path(base_dir).resolve()

        # Step 3: Validate using os.path before Path() creation
        abs_path = os.path.abspath(os.path.join(str(base_dir), user_input))
        if not abs_path.startswith(str(base_dir.resolve())):
            return None

        # Step 4: Now safe to create Path object
        path_obj = Path(user_input)
        resolved = (base_dir / path_obj).resolve()

        # Step 5: Final validation: ensure within base directory
        if not str(resolved).startswith(str(base_dir.resolve())):
            return None

        return resolved
    except (OSError, ValueError, TypeError):
        return None


def sanitize_filename(filename: str, max_length: int = 100) -> str:
    """
    Sanitize filename to prevent path traversal and injection attacks.

    Args:
        filename: Original filename to sanitize
        max_length: Maximum length for sanitized filename (default: 100)

    Returns:
        Sanitized filename safe for use in file operations

    Example:
        >>> safe_name = sanitize_filename('../../../etc/passwd')
        >>> # Returns: 'unknown_file'
    """
    if not filename or not isinstance(filename, str):
        return 'unknown_file'

    # Step 1: Remove path traversal attempts and dangerous characters
    clean = filename.replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')

    # Step 2: Remove any remaining path separators and dangerous characters
    clean = re.sub(r'[<>:"|?*\x00-\x1f]', '', clean)

    # Step 3: Remove any remaining path traversal attempts
    clean = clean.replace('..', '').replace('/', '').replace('\\', '')

    # Step 4: Limit length to prevent issues
    clean = clean[:max_length]

    # Step 5: Ensure only alphanumeric and safe characters remain
    clean = re.sub(r'[^a-zA-Z0-9_\-.]', '', clean)

    # Step 6: Ensure it's not empty after sanitization
    if not clean:
        clean = 'unknown_file'

    return clean


def validate_file_path(file_path: Path, trusted_base: Path) -> bool:
    """
    Validate that a file path is within a trusted base directory.

    Args:
        file_path: Path to validate
        trusted_base: Trusted base directory

    Returns:
        True if path is safe, False otherwise

    Example:
        >>> is_safe = validate_file_path(Path('data/file.txt'), Path('/app/data'))
        >>> if is_safe:
        ...     # Safe to use file_path
    """
    try:
        resolved_path = file_path.resolve()
        resolved_base = trusted_base.resolve()

        # Ensure the resolved path is within the base directory
        if not str(resolved_path).startswith(str(resolved_base)):
            return False

        # Additional check: ensure no path traversal in original path
        if '..' in str(file_path):
            return False

        return True
    except (OSError, ValueError):
        return False


def safe_path_join(*parts: str, base_dir: Optional[Path] = None) -> Optional[Path]:
    """
    Safely join path parts and validate the result.

    Args:
        *parts: Path parts to join
        base_dir: Base directory to validate against

    Returns:
        Validated Path object if safe, None otherwise

    Example:
        >>> safe_path = safe_path_join('subfolder', 'file.txt', base_dir=Path('/app'))
        >>> if safe_path:
        ...     # Safe to use
    """
    try:
        # Join parts
        joined = os.path.join(*parts)

        # Validate the joined path
        if base_dir is None:
            base_dir = Path.cwd()

        return validate_and_resolve_path(joined, base_dir)
    except (OSError, ValueError, TypeError):
        return None


def is_safe_file_extension(filename: str, allowed_extensions: list[str]) -> bool:
    """
    Check if a filename has a safe file extension.

    Args:
        filename: Filename to check
        allowed_extensions: List of allowed extensions (e.g., ['.txt', '.json'])

    Returns:
        True if extension is allowed, False otherwise

    Example:
        >>> is_safe = is_safe_file_extension('data.json', ['.json', '.txt'])
        >>> # Returns: True
    """
    if not filename:
        return False

    # Normalize extensions (ensure they start with .)
    normalized_allowed = [ext if ext.startswith('.') else f'.{ext}' for ext in allowed_extensions]

    # Get file extension
    _, ext = os.path.splitext(filename)

    return ext.lower() in [e.lower() for e in normalized_allowed]


def create_safe_directory(dir_name: str, base_dir: Path) -> Optional[Path]:
    """
    Create a directory with a sanitized name within a base directory.

    Args:
        dir_name: Directory name to create
        base_dir: Base directory

    Returns:
        Created Path object if successful, None otherwise

    Example:
        >>> safe_dir = create_safe_directory('user_data', Path('/app/data'))
        >>> if safe_dir:
        ...     # Directory created safely
    """
    try:
        # Sanitize directory name
        sanitized = sanitize_filename(dir_name)

        # Create path
        target = base_dir / sanitized
        resolved = target.resolve()

        # Validate it's within base directory
        if not str(resolved).startswith(str(base_dir.resolve())):
            return None

        # Create directory
        resolved.mkdir(parents=True, exist_ok=True)
        return resolved
    except (OSError, ValueError, TypeError):
        return None
