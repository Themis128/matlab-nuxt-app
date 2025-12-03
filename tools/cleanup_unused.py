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

    # Process imports: build replacement lines
    import_replacements: Dict[int, List[str]] = {}

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
                bak = p.with_suffix(p.suffix + ".bak")
                shutil.copy2(p, bak)
            changed, msg = apply_changes(p)
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

    root = Path(args.dir)
    if not root.exists():
        print(f"Directory not found: {root}")
        return

    results = process_directory(root, apply=args.apply, backup=args.backup)

    for p, msg in results:
        print(f"{p}: {msg}")


if __name__ == "__main__":
    main()
