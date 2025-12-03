"""
Safe removal of clearly-unused imports in python_api modules.
- Parses each .py file under python_api
- Uses AST to find import nodes and usage of imported names
- Removes unused names from "from x import a, b" lines or drops whole import
- Makes a backup copy (filename + .bak) before overwriting
Note: This only edits import statements; it does not touch assigned-but-unused locals.
"""
import ast
import os
from pathlib import Path

ROOT = Path("python_api")

def find_unused_imports_in_file(path: Path):
    src = path.read_text(encoding="utf-8")
    tree = ast.parse(src)

    # Map import node -> list of (alias_name, original_name, lineno)
    imports = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                asname = alias.asname or alias.name.split(".")[0]
                imports.append((node, alias.name, asname, node.lineno))
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                if alias.name == "*":
                    # skip star imports
                    continue
                asname = alias.asname or alias.name
                full = f"{module}.{alias.name}" if module else alias.name
                imports.append((node, full, asname, node.lineno))

    # Collect all Name usages in file
    used_names = set()
    class NameVisitor(ast.NodeVisitor):
        def visit_Name(self, n):
            used_names.add(n.id)
    NameVisitor().visit(tree)

    # Decide which imported aliases are unused
    unused = []
    for node, original, asname, lineno in imports:
        if asname not in used_names:
            unused.append((node, original, asname, lineno))
    return unused, src


def process_file(path: Path):
    unused, src = find_unused_imports_in_file(path)
    if not unused:
        return False, []

    # Read lines
    lines = src.splitlines()
    # Group by lineno
    lineno_to_unused = {}
    for node, original, asname, lineno in unused:
        lineno_to_unused.setdefault(lineno, []).append((original, asname))

    modified = False
    new_lines = list(lines)

    # Process from bottom to top so line numbers remain valid
    for lineno in sorted(lineno_to_unused.keys(), reverse=True):
        idx = lineno - 1
        if idx < 0 or idx >= len(new_lines):
            continue
        line = new_lines[idx]
        unused_list = lineno_to_unused[lineno]
        # Simple heuristics:
        # - If line starts with 'from ' and contains ',', remove unused names from the import list
        # - If line starts with 'import ' and contains ',', remove unused names
        # - Otherwise, if the entire import's asname is unused, remove the whole line
        stripped = line.strip()
        if stripped.startswith('from '):
            # e.g. from x import a, b as c
            try:
                prefix, rest = line.split(' import ', 1)
            except ValueError:
                # odd formatting, skip
                continue
            parts = [p.strip() for p in rest.split(',')]
            new_parts = []
            for part in parts:
                # get the asname or name
                if ' as ' in part:
                    name = part.split(' as ')[1].strip()
                else:
                    name = part.split()[0]
                if not any(name == asname for _, asname in unused_list):
                    new_parts.append(part)
            if new_parts:
                new_line = prefix + ' import ' + ', '.join(new_parts)
                new_lines[idx] = new_line
                modified = True
            else:
                # remove whole line
                new_lines.pop(idx)
                modified = True
        elif stripped.startswith('import '):
            # e.g. import a, b as c
            rest = line.split('import ', 1)[1]
            parts = [p.strip() for p in rest.split(',')]
            new_parts = []
            for part in parts:
                if ' as ' in part:
                    asname = part.split(' as ')[1].strip()
                else:
                    asname = part.split('.')[0]
                if not any(asname == un_as for _, un_as in unused_list):
                    new_parts.append(part)
            if new_parts:
                new_line = 'import ' + ', '.join(new_parts)
                new_lines[idx] = new_line
                modified = True
            else:
                new_lines.pop(idx)
                modified = True
        else:
            # Unknown format, remove whole line if the single imported alias is unused
            # Only if all imports on this lineno are unused
            all_unused = True
            for orig, asname in lineno_to_unused[lineno]:
                # check if this asname matches something in the line
                if asname in line:
                    continue
                else:
                    all_unused = False
                    break
            if all_unused:
                new_lines.pop(idx)
                modified = True

    if modified:
        # backup file
        bak = path.with_suffix(path.suffix + '.bak')
        path.replace(bak)
        # write new file
        path.write_text('\n'.join(new_lines) + '\n', encoding='utf-8')
        return True, [str(bak)]
    return False, []


def main():
    changed = []
    for py in ROOT.rglob('*.py'):
        ok, bak_files = process_file(py)
        if ok:
            changed.append((str(py), bak_files))
    if changed:
        print('Modified files:')
        for f, bak in changed:
            print(f'- {f} (backup: {bak})')
    else:
        print('No unused imports found by tool.')

if __name__ == '__main__':
    main()
