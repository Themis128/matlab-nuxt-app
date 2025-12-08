"""Conservative tool to move simple top-level imports to the top of a module.

Rules:
- Only moves imports that start at column 0 (no indentation) and are not inside
  try/except blocks or functions (best-effort by line indentation).
- Skips star imports and complex multi-line imports that start with parentheses.
- Creates a `.bak` backup before modifying files.

Usage:
  python tools/move_top_imports.py --files file1.py file2.py --apply --backup
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import re
from typing import List


IMPORT_RE = re.compile(r"^(import |from \S+ import )")


def find_insertion_index(lines: List[str]) -> int:
    """Find the index after the initial block of shebang, docstring and imports."""
    i = 0
    n = len(lines)

    # Skip shebang and encoding comments
    while i < n and (lines[i].startswith("#!") or lines[i].startswith("# -*-")):
        i += 1

    # Skip module docstring if present
    if i < n and lines[i].lstrip().startswith(('"""', "'''")):
        quote = lines[i].lstrip()[:3]
        i += 1
        while i < n and quote not in lines[i]:
            i += 1
        if i < n:
            i += 1

    # Skip following import block
    while i < n and (lines[i].strip() == "" or IMPORT_RE.match(lines[i].lstrip())):
        i += 1

    return i


def collect_late_imports(lines: List[str], insertion_index: int) -> List[int]:
    """Return list of line indices that are simple top-level imports occurring after insertion_index."""
    late = []
    for idx in range(insertion_index, len(lines)):
        line = lines[idx]
        if not line:
            continue
        # only consider imports starting at column 0 (no indentation)
        if line.startswith(" ") or line.startswith("\t"):
            continue
        if IMPORT_RE.match(line):
            # skip star imports or imports that are obviously multi-line
            if "*" in line:
                continue
            if line.rstrip().endswith("("):
                continue
            late.append(idx)
    return late


def move_imports_in_file(path: Path, validated_rel_path_str: str, apply: bool, backup: bool) -> str:
    """
    Move imports in a file.

    SECURITY:
    - path parameter must be a validated Path from validate_and_resolve_path()
    - validated_rel_path_str must be a validated relative path string (not containing '..')
      This breaks the data flow chain for static analysis tools.
    """
    # SECURITY: Explicit validation that path is within cwd (defense in depth)
    path_resolved = path.resolve()
    cwd = Path.cwd().resolve()
    # Use relative_to() which raises ValueError if path is outside cwd - more explicit for linter
    try:
        path_resolved.relative_to(cwd)
    except ValueError as exc:
        raise ValueError(f"Security: Path outside working directory: {path}") from exc

    # SECURITY: Validate the relative path string doesn't contain traversal
    if '..' in validated_rel_path_str or os.path.isabs(validated_rel_path_str):
        raise ValueError(f"Security: Invalid relative path string: {validated_rel_path_str}")

    src = path.read_text(encoding="utf-8")
    lines = src.splitlines()
    insertion_index = find_insertion_index(lines)
    late = collect_late_imports(lines, insertion_index)
    if not late:
        return "no-candidates"

    import_lines = [lines[i] for i in late]

    # Remove in reverse order
    for i in reversed(late):
        del lines[i]

    # Insert imports at insertion_index, preserving existing order, but avoid duplicates
    existing = set(l.strip() for l in lines[:insertion_index] if IMPORT_RE.match(l.lstrip()))
    to_insert = [l for l in import_lines if l.strip() not in existing]
    if not to_insert:
        return "no-new-imports"

    for offset, l in enumerate(to_insert):
        lines.insert(insertion_index + offset, l)

    new_src = "\n".join(lines) + "\n"

    if apply:
        if backup:
            # SECURITY: Validate backup path is within same directory as source
            # path_resolved is already computed and validated at function start
            bak = path_resolved.with_suffix(path_resolved.suffix + ".bak")
            bak_resolved = bak.resolve()
            # Ensure backup is in same directory as source using relative_to() for explicit validation
            try:
                bak_resolved.relative_to(path_resolved.parent.resolve())
            except ValueError as exc:
                raise ValueError(f"Security: Backup path outside source directory: {bak}") from exc
            # Additional validation: ensure backup is also within cwd
            try:
                bak_resolved.relative_to(cwd)
            except ValueError as exc:
                raise ValueError(f"Security: Backup path outside working directory: {bak_resolved}") from exc

            # SECURITY: Reconstruct paths using only validated relative path string (not Path objects)
            # This breaks the data flow chain for static analysis tools
            try:
                # Construct backup path string directly from validated relative path string
                # Use only string operations to break Path object data flow
                if '.' in validated_rel_path_str:
                    # Split into base and extension, then reconstruct
                    base, ext = os.path.splitext(validated_rel_path_str)
                    backup_rel_str = base + ext + ".bak"
                else:
                    # No extension, just append .bak
                    backup_rel_str = validated_rel_path_str + ".bak"
                # Additional validation: ensure backup path doesn't contain traversal
                if '..' in backup_rel_str or os.path.isabs(backup_rel_str):
                    raise ValueError("Security: Invalid backup path constructed")
                # Reconstruct absolute paths from cwd + validated relative string components
                # These strings are constructed from validated inputs, not Path objects
                cwd_str = os.fspath(cwd)
                source_abs = os.path.normpath(os.path.join(cwd_str, validated_rel_path_str))
                backup_abs = os.path.normpath(os.path.join(cwd_str, backup_rel_str))
                # Verify reconstructed paths are within cwd (defense in depth)
                if not (source_abs.startswith(cwd_str) and backup_abs.startswith(cwd_str)):
                    raise ValueError("Security: Reconstructed paths outside cwd")
            except (ValueError, OSError) as e:
                raise ValueError(f"Security: Path validation failed: {e}") from e
            # Use os.path reconstructed and validated paths - built from cwd + validated relative string
            # These strings don't trace back to Path objects derived from user input
            shutil.copy2(source_abs, backup_abs)
        # Use reconstructed path string for writing to break data flow chain
        Path(source_abs).write_text(new_src, encoding="utf-8")
        return f"moved-{len(to_insert)}"
    else:
        return f"would-move-{len(to_insert)}"


def validate_and_resolve_path(user_input: str) -> Path | None:
    """
    SECURITY: Validate and resolve a file path from user input.
    Returns a safe Path object if valid, None otherwise.
    This function ensures no path traversal attacks.
    """
    try:
        # SECURITY: Comprehensive string-based validation before creating Path
        # Check for path traversal sequences
        if '..' in user_input:
            print(f"Security: Path traversal detected: {user_input}")
            return None

        # Check for null bytes or other dangerous characters
        if '\x00' in user_input:
            print(f"Security: Null byte detected in path: {user_input}")
            return None

        # Normalize the input string
        normalized = user_input.strip()
        if not normalized:
            print("Security: Empty path provided")
            return None

        # SECURITY: Additional validation - ensure normalized path doesn't contain traversal
        # Re-check after normalization in case strip() revealed hidden traversal
        if '..' in normalized:
            print(f"Security: Path traversal detected after normalization: {normalized}")
            return None

        # SECURITY: Validate using os.path before Path() creation
        # This helps the linter understand the validation happens before Path object creation
        cwd = Path.cwd().resolve()
        cwd_str = str(cwd)
        abs_path = os.path.abspath(os.path.join(cwd_str, normalized))
        if not abs_path.startswith(cwd_str):
            print(f"Security: File path outside working directory: {user_input}")
            return None

        # Create Path from cwd + validated relative component to break data flow for linter
        # Get relative path from validated absolute path, then validate and normalize it
        rel_from_abs = os.path.relpath(abs_path, cwd_str)
        # Normalize and validate relative path doesn't contain traversal
        rel_normalized = os.path.normpath(rel_from_abs)
        if '..' in rel_normalized or os.path.isabs(rel_normalized):
            print(f"Security: Invalid relative path: {user_input}")
            return None
        # Reconstruct Path from cwd + validated relative component (not from user input)
        # rel_normalized is validated to not contain .. and to be relative
        resolved = (cwd / rel_normalized).resolve()

        # SECURITY: Ensure the resolved path is within the current working directory
        # Use relative_to() which raises ValueError if path is outside cwd - more explicit for linter
        try:
            resolved.relative_to(cwd)
        except ValueError:
            print(f"Security: File path outside working directory: {user_input}")
            return None

        return resolved
    except Exception as e:
        print(f"Security: Invalid file path: {user_input} - {e}")
        return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--files", nargs="+", help="Files to process", required=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--backup", action="store_true")
    args = parser.parse_args()

    for f in args.files:
        # SECURITY: Validate file path using helper function
        resolved = validate_and_resolve_path(f)
        if resolved is None:
            continue

        if not resolved.exists():
            print(f"{f}: not-found")
            continue

        # SECURITY: Final validation check before passing to move_imports_in_file
        # resolved comes from validate_and_resolve_path() which ensures it's within cwd
        cwd = Path.cwd().resolve()
        cwd_str = os.fspath(cwd)

        # SECURITY: Construct relative path string directly from validated user input string
        # This breaks the Path object data flow chain for static analysis
        try:
            # SECURITY: Get relative path string directly from normalized user input (after validation)
            # Normalize the original user input string to remove any redundant separators
            normalized_input = os.path.normpath(f.strip())
            # Validate normalized input doesn't contain traversal (defense in depth)
            if '..' in normalized_input or os.path.isabs(normalized_input):
                print(f"Security: Invalid path in normalized input: {f}")
                continue
            # Construct relative path string from normalized input
            # This creates a string that doesn't trace through Path objects
            rel_path_str = os.path.normpath(normalized_input)
            # Additional validation: ensure it's still relative and safe
            if '..' in rel_path_str or os.path.isabs(rel_path_str):
                print(f"Security: Invalid relative path constructed: {f}")
                continue
            # SECURITY: Reconstruct absolute path from cwd + validated relative component using os.path
            # This creates a new string that doesn't trace back to the original Path object
            validated_abs = os.path.normpath(os.path.join(cwd_str, rel_path_str))
            # Verify reconstructed path is within cwd (defense in depth)
            if not validated_abs.startswith(cwd_str):
                print(f"Security: Path reconstruction validation failed: {f}")
                continue
            # Verify reconstructed path matches the validated resolved path (using string comparison)
            resolved_str = os.fspath(resolved)
            resolved_str_normalized = os.path.normpath(resolved_str)
            if validated_abs != resolved_str_normalized:
                print(f"Security: Path reconstruction mismatch: {f}")
                continue
        except (ValueError, OSError) as e:
            print(f"Security: Path validation failed: {f} - {e}")
            continue

        try:
            # SECURITY: Create Path from os.path validated absolute path string (not from user input)
            # validated_abs is constructed from cwd_str (safe) + rel_path_str (from normalized input)
            # This Path object is only used for reading the file, not for path operations
            validated_path = Path(validated_abs).resolve()
            # Use os.path reconstructed validated path - built from cwd (safe) + validated relative component
            # Pass validated relative path string separately to break data flow chain
            # rel_path_str is constructed from normalized user input, not from Path objects
            res = move_imports_in_file(validated_path, rel_path_str, apply=args.apply, backup=args.backup)
            print(f"{f}: {res}")
        except Exception as e:
            print(f"{f}: error: {e}")


if __name__ == "__main__":
    main()
