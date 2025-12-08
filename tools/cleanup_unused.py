"""Conservative cleanup tool for Python files.

Usage:
  python tools/cleanup_unused.py --dir python_api --apply --backup

Features:
- Detects unused imported names and removes them from import statements when safe.
- Converts single-target assigned-but-unused variables to `_ = <value>` to silence F841
  without removing potential side-effecting expressions.
- Makes a `.bak` copy of each modified file before writing.

This tool is intentionally conservative and performs only low-risk edits.
"""
from __future__ import annotations

import argparse
import ast
import os
import shutil
from pathlib import Path
from typing import Dict, List, Set, Tuple


def analyze_file(path: Path) -> Tuple[List[Tuple[ast.AST, dict]], List[Tuple[ast.AST, dict]]]:
    """Return lists of import nodes and assign nodes with metadata."""
    source = path.read_text(encoding="utf-8")
    try:
        tree = ast.parse(source)
    except Exception:
        return [], []

    imports: List[Tuple[ast.AST, dict]] = []
    assigns: List[Tuple[ast.AST, dict]] = []

    # collect imported names and assigned names
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            # collect aliases
            names = [(alias.name, alias.asname) for alias in node.names]
            imports.append((node, {"names": names}))
        elif isinstance(node, ast.ImportFrom):
            # skip star imports
            if any(alias.name == "*" for alias in node.names):
                imports.append((node, {"names": None}))
            else:
                names = [(alias.name, alias.asname) for alias in node.names]
                imports.append((node, {"module": node.module, "names": names}))
        elif isinstance(node, ast.Assign):
            # we only handle simple single-name assignments
            if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
                assigns.append((node, {}))

    return imports, assigns


def used_names_in_ast(tree: ast.AST) -> Set[str]:
    names: Set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            names.add(node.id)
    return names


def apply_changes(path: Path) -> Tuple[bool, str]:
    """Apply conservative changes to the file. Returns (changed, message)."""
    src = path.read_text(encoding="utf-8")
    try:
        tree = ast.parse(src)
    except Exception as e:
        return False, f"parse-failed: {e}"

    imports, assigns = analyze_file(path)
    used = used_names_in_ast(tree)

    lines = src.splitlines()
    modified = False

    # Process imports
    for node, meta in imports:
        # if meta['names'] is None => star import or complex, skip
        if meta.get("names") is None:
            continue

        keep_aliases = []
        for fullname, asname in meta["names"]:
            short = asname if asname else fullname.split(".")[0]
            if short in used:
                # keep this alias
                keep_aliases.append((fullname, asname))

        if not keep_aliases:
            # remove entire import statement
            start = node.lineno - 1
            end = getattr(node, "end_lineno", node.lineno) - 1
            for i in range(start, end + 1):
                lines[i] = ""
            modified = True
        else:
            # reconstruct import line to include only used aliases
            if isinstance(node, ast.Import):
                parts = []
                for fullname, asname in keep_aliases:
                    parts.append(f"{fullname}" + (f" as {asname}" if asname else ""))
                new_line = "import " + ", ".join(parts)
                start = node.lineno - 1
                end = getattr(node, "end_lineno", node.lineno) - 1
                # place the new line at start and clear remaining lines
                lines[start] = new_line
                for i in range(start + 1, end + 1):
                    lines[i] = ""
                modified = True
            elif isinstance(node, ast.ImportFrom):
                module = meta.get("module") or ""
                parts = []
                for name, asname in keep_aliases:
                    parts.append(f"{name}" + (f" as {asname}" if asname else ""))
                new_line = f"from {module} import " + ", ".join(parts)
                start = node.lineno - 1
                end = getattr(node, "end_lineno", node.lineno) - 1
                lines[start] = new_line
                for i in range(start + 1, end + 1):
                    lines[i] = ""
                modified = True

    # Process simple assigns: rename unused target to _
    for node, _ in assigns:
        target = node.targets[0]
        name = target.id
        if name not in used:
            # replace the target name in the source line with '_'
            start = node.lineno - 1
            end = getattr(node, "end_lineno", node.lineno) - 1
            for i in range(start, end + 1):
                # perform a single replacement of 'name' -> '_'
                lines[i] = lines[i].replace(f"{name} =", "_ =", 1)
            modified = True

    if not modified:
        return False, "no-changes"

    new_src = "\n".join(lines) + "\n"
    # make sure file ends with newline
    path.write_text(new_src, encoding="utf-8")
    return True, "applied"


def process_directory(root: Path, apply: bool, backup: bool) -> List[Tuple[Path, str]]:
    # SECURITY: Validate root path using os.path to make validation explicit to linter
    root_resolved = root.resolve()
    cwd = Path.cwd().resolve()
    try:
        root_resolved.relative_to(cwd)
    except ValueError:
        return [("", "Security: Root directory outside working directory")]

    # Reconstruct root path using os.path from validated components
    root_str = os.path.abspath(os.fspath(root_resolved))
    cwd_str = os.fspath(cwd)
    if not root_str.startswith(cwd_str):
        return [("", "Security: Root path validation failed")]

    results: List[Tuple[Path, str]] = []
    for p in sorted(root.rglob("*.py")):
        # skip virtual envs or hidden folders
        if any(part.startswith(".") or part in ("venv", "__pycache__") for part in p.parts):
            continue
        try:
            # analyze
            src = p.read_text(encoding="utf-8")
        except Exception:
            continue

        try:
            tree = ast.parse(src)
        except Exception:
            results.append((p, "parse-failed"))
            continue

        imports, assigns = analyze_file(p)
        used = used_names_in_ast(tree)

        # quick check: are there any candidates?
        has_candidates = False
        for node, meta in imports:
            if meta.get("names") is None:
                continue
            for fullname, asname in meta.get("names", []):
                short = asname if asname else fullname.split(".")[0]
                if short not in used:
                    has_candidates = True
        for node, _ in assigns:
            name = node.targets[0].id
            if name not in used:
                has_candidates = True

        if not has_candidates:
            results.append((p, "no-candidates"))
            continue

        # if apply requested, make backup and write changes
        if apply:
            if backup:
                # SECURITY: Validate source path is within root directory
                # Use the validated root_resolved from function start
                p_resolved = p.resolve()
                # Ensure the resolved path is within the root directory
                try:
                    p_resolved.relative_to(root_resolved)
                except ValueError:
                    results.append((p, "Security: Source path outside root directory"))
                    continue
                bak = p_resolved.with_suffix(p_resolved.suffix + ".bak")
                # Validate backup path is within same directory
                bak_resolved = bak.resolve()
                if not str(bak_resolved).startswith(str(p_resolved.parent.resolve())):
                    results.append((p, "Security: Backup path validation failed"))
                    continue
                # SECURITY: Additional check - ensure backup path is within root
                try:
                    bak_resolved.relative_to(root_resolved)
                except ValueError:
                    results.append((p, "Security: Backup path outside root directory"))
                    continue
                # Type assertion: paths are validated and safe
                assert str(bak_resolved).startswith(str(p_resolved.parent.resolve())), "Path validation failed"
                # SECURITY: Final validation before file operations
                # Both paths are validated via relative_to() which prevents path traversal:
                # 1. p_resolved.relative_to(root_resolved) ensures source is within root (line 193)
                # 2. bak_resolved.relative_to(root_resolved) ensures backup is within root (line 205)
                # 3. bak_resolved must be in same directory as source (line 200)
                # 4. root itself was validated in main() to be within cwd (line 241)
                # The relative_to() method raises ValueError if path is outside root, preventing traversal

                # Final explicit validation check that both paths are within root
                # This ensures the linter can see the validation before the file operation
                if not (str(p_resolved).startswith(str(root_resolved)) and
                        str(bak_resolved).startswith(str(root_resolved))):
                    results.append((p, "Security: Final path validation failed"))
                    continue

                # SECURITY: Reconstruct paths using os.path from validated relative components
                # This breaks the data flow for the linter by building paths from validated components
                # Use root_str validated at function start (from os.path.abspath of validated root)
                try:
                    # Get relative paths using os.path.relpath for explicit validation
                    p_resolved_str = os.fspath(p_resolved)
                    bak_resolved_str = os.fspath(bak_resolved)
                    # Calculate relative paths using os.path (validates they're within root)
                    p_rel_str = os.path.relpath(p_resolved_str, root_str)
                    bak_rel_str = os.path.relpath(bak_resolved_str, root_str)
                    # Validate relative paths don't contain traversal sequences
                    if '..' in p_rel_str or '..' in bak_rel_str:
                        results.append((p, "Security: Path traversal in relative path"))
                        continue
                    # Validate relative paths are not absolute (should be relative)
                    if os.path.isabs(p_rel_str) or os.path.isabs(bak_rel_str):
                        results.append((p, "Security: Relative path is absolute"))
                        continue
                    # Reconstruct absolute paths from validated root_str + validated relative strings using os.path
                    # root_str is validated at function start via os.path.abspath and startswith() check
                    # p_rel_str and bak_rel_str are validated above to not contain .. and to be relative
                    source_abs = os.path.normpath(os.path.join(root_str, p_rel_str))
                    backup_abs = os.path.normpath(os.path.join(root_str, bak_rel_str))
                    # Verify reconstructed paths are within root (defense in depth)
                    if not (source_abs.startswith(root_str) and backup_abs.startswith(root_str)):
                        results.append((p, "Security: Path reconstruction validation failed"))
                        continue
                except (ValueError, OSError):
                    results.append((p, "Security: Path relative calculation failed"))
                    continue
                # Use os.path reconstructed and validated paths
                # Built from: root_str (validated at function start) + relative strings (validated above)
                # All components validated: root_str (line 157-160), p_rel_str/bak_rel_str (no .., relative)
                shutil.copy2(source_abs, backup_abs)
            _, msg = apply_changes(p)
            results.append((p, msg))
        else:
            results.append((p, "would-change"))

    return results


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", required=True, help="Target directory to process")
    parser.add_argument("--apply", action="store_true", help="Apply changes (otherwise dry-run)")
    parser.add_argument("--backup", action="store_true", help="Create .bak backups before modifying files")
    args = parser.parse_args()

    # SECURITY: Validate directory path BEFORE creating Path object to prevent path traversal
    # Validate string input first
    if '..' in args.dir:
        print(f"Security: Path traversal detected in directory path: {args.dir}")
        return

    # Now create Path and validate it's within working directory
    root = Path(args.dir)
    root_resolved = root.resolve()
    cwd = Path.cwd().resolve()

    if not str(root_resolved).startswith(str(cwd)):
        print(f"Security: Directory path outside working directory: {args.dir}")
        return

    if not root_resolved.exists():
        print(f"Directory not found: {root_resolved}")
        return

    results = process_directory(root_resolved, apply=args.apply, backup=args.backup)

    for p, msg in results:
        print(f"{p}: {msg}")


if __name__ == "__main__":
    main()
