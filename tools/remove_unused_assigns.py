"""
Remove clearly-unused local assignments in python_api modules.
- Finds Assign nodes with a single Name target
- If the Name is not referenced elsewhere in the AST, removes the assignment line
- If the value is a Call, converts the assignment to an expression statement to preserve side-effects
- Makes backup (.bak) before writing changes
Caveat: This is conservative but automated editing may still require review.
"""
import ast
from pathlib import Path

ROOT = Path("python_api")


def process_file(path: Path):
    src = path.read_text(encoding='utf-8')
    tree = ast.parse(src)

    # Collect all assigned names and their Assign nodes
    assigns = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            # only handle single target that's a Name
            if len(node.targets) != 1:
                continue
            target = node.targets[0]
            if isinstance(target, ast.Name):
                assigns.append((node, target.id, node.lineno))

    # Collect Name usages
    used = []
    class NameVisitor(ast.NodeVisitor):
        def visit_Name(self, n):
            used.append((n.id, n.lineno))
    NameVisitor().visit(tree)

    used_names = {n for n, _ in used}

    # Determine unused assigns
    unused_assigns = [(node, name, lineno) for node, name, lineno in assigns if name not in used_names or sum(1 for n, _ in used if n == name) <= 1]

    if not unused_assigns:
        return False, []

    lines = src.splitlines()
    new_lines = list(lines)
    modified = False
    backups = []

    # Process from bottom to top
    for node, name, lineno in sorted(unused_assigns, key=lambda x: x[2], reverse=True):
        idx = lineno - 1
        if idx < 0 or idx >= len(new_lines):
            continue
        line = new_lines[idx]
        # Only handle simple assignments in one line
        # e.g., var = something
        # If RHS is a call (contains '(' and ')' heuristically), replace with RHS as expression
        rhs = line.split('=', 1)[1].strip() if '=' in line else ''
        if '(' in rhs and ')' in rhs and rhs.endswith(')'):
            # convert to expression statement
            new_lines[idx] = rhs
            modified = True
        else:
            # remove the line
            new_lines.pop(idx)
            modified = True

    if modified:
        bak = path.with_suffix(path.suffix + '.bak')
        path.replace(bak)
        path.write_text('\n'.join(new_lines) + '\n', encoding='utf-8')
        backups.append(str(bak))
        return True, backups
    return False, []


def main():
    changed = []
    for py in ROOT.rglob('*.py'):
        ok, bak = process_file(py)
        if ok:
            changed.append((str(py), bak))
    if changed:
        print('Modified files (assign removal):')
        for f, b in changed:
            print(f'- {f} (backup: {b})')
    else:
        print('No unused assigns found by tool.')

if __name__ == '__main__':
    main()
