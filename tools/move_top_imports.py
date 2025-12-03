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


def move_imports_in_file(path: Path, apply: bool, backup: bool) -> str:
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
            bak = path.with_suffix(path.suffix + ".bak")
            shutil.copy2(path, bak)
        path.write_text(new_src, encoding="utf-8")
        return f"moved-{len(to_insert)}"
    else:
        return f"would-move-{len(to_insert)}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--files", nargs="+", help="Files to process", required=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--backup", action="store_true")
    args = parser.parse_args()

    for f in args.files:
        p = Path(f)
        if not p.exists():
            print(f"{f}: not-found")
            continue
        try:
            res = move_imports_in_file(p, apply=args.apply, backup=args.backup)
            print(f"{f}: {res}")
        except Exception as e:
            print(f"{f}: error: {e}")


if __name__ == "__main__":
    main()
