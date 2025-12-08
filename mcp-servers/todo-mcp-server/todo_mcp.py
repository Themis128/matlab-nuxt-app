"""
Todo MCP Server - Model Context Protocol server for managing TODOs in codebases.

This server provides tools to search, list, filter, and manage TODO comments
in your codebase, similar to the todo-tree VS Code extension.
"""

import os
import re
import json
import subprocess
from pathlib import Path
from typing import List, Optional, Dict, Any, Union
from dataclasses import dataclass, asdict
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("todo-tree")


@dataclass
class TodoItem:
    """Represents a single TODO item found in the codebase."""
    file: str
    line: int
    column: int
    tag: str
    text: str
    before: str = ""
    after: str = ""


def find_ripgrep() -> Optional[str]:
    """Find ripgrep executable in the system."""
    # Check common locations
    possible_paths = [
        "rg",
        "ripgrep",
        "/usr/bin/rg",
        "/usr/local/bin/rg",
        "C:\\Program Files\\ripgrep\\rg.exe",
    ]

    for path in possible_paths:
        try:
            result = subprocess.run(
                [path, "--version"],
                capture_output=True,
                text=True,
                timeout=2
            )
            if result.returncode == 0:
                return path
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue

    return None


def parse_todo_line(line: str, file_path: str) -> Optional[TodoItem]:
    """
    Parse a line from ripgrep output into a TodoItem.

    Expected format: file_path:line_number:column_number:content
    """
    # Split by colon, but be careful with Windows paths and content
    parts = line.split(":", 3)
    if len(parts) < 4:
        return None

    try:
        file = parts[0]
        line_num = int(parts[1])
        col_num = int(parts[2])
        content = parts[3].strip()

        # Extract tag and text from content
        # Common patterns: // TODO: text, # FIXME text, <!-- TODO text -->
        tag_pattern = r'\b(TODO|FIXME|BUG|HACK|XXX|NOTE|OPTIMIZE|REFACTOR|REVIEW|WARNING|DEPRECATED)\b'
        match = re.search(tag_pattern, content, re.IGNORECASE)

        if not match:
            return None

        tag = match.group(1).upper()
        tag_start = match.start()
        tag_end = match.end()

        before = content[:tag_start].strip()
        after = content[tag_end:].strip()

        # Remove comment markers from 'after'
        after = re.sub(r'^[:\-\s]*', '', after)

        return TodoItem(
            file=file,
            line=line_num,
            column=col_num,
            tag=tag,
            text=content,
            before=before,
            after=after
        )
    except (ValueError, IndexError):
        return None


def search_todos(
    workspace_path: str,
    tags: Optional[List[str]] = None,
    exclude_patterns: Optional[List[str]] = None,
    include_patterns: Optional[List[str]] = None
) -> List[TodoItem]:
    """
    Search for TODOs in the workspace using ripgrep.

    Args:
        workspace_path: Root directory to search
        tags: List of tags to search for (default: TODO, FIXME, BUG)
        exclude_patterns: Glob patterns to exclude
        include_patterns: Glob patterns to include

    Returns:
        List of TodoItem objects
    """
    if tags is None:
        tags = ["TODO", "FIXME", "BUG", "HACK", "XXX", "NOTE"]

    rg_path = find_ripgrep()
    if not rg_path:
        # Fallback to Python-based search if ripgrep not available
        return search_todos_python(workspace_path, tags, exclude_patterns, include_patterns)

    # Build ripgrep command
    cmd = [rg_path, "--line-number", "--column", "--no-heading", "--color=never"]

    # Add exclude patterns - sanitize to prevent injection
    if exclude_patterns:
        for pattern in exclude_patterns:
            if isinstance(pattern, str) and re.match(r'^[A-Za-z0-9_*?/.\-\[\]]+$', pattern):
                cmd.extend(["--glob", f"!{pattern}"])
            else:
                print(f"Warning: Invalid exclude pattern '{pattern}' ignored")

    # Add include patterns - sanitize to prevent injection
    if include_patterns:
        for pattern in include_patterns:
            if isinstance(pattern, str) and re.match(r'^[A-Za-z0-9_*?/.\-\[\]]+$', pattern):
                cmd.extend(["--glob", pattern])
            else:
                print(f"Warning: Invalid include pattern '{pattern}' ignored")
    else:
        # Default excludes
        default_excludes = [
            "**/node_modules/**",
            "**/venv/**",
            "**/.venv/**",
            "**/__pycache__/**",
            "**/.git/**",
            "**/.nuxt/**",
            "**/.output/**",
            "**/dist/**",
            "**/build/**",
        ]
        for pattern in default_excludes:
            cmd.extend(["--glob", f"!{pattern}"])

    # Build regex pattern for tags - sanitize to prevent injection
    # Only allow alphanumeric characters and common tag names
    sanitized_tags = []
    for tag in tags:
        if not isinstance(tag, str):
            continue
        # Only allow alphanumeric and common tag characters
        if re.match(r'^[A-Za-z0-9_]+$', tag):
            sanitized_tags.append(tag)
        else:
            print(f"Warning: Invalid tag '{tag}' ignored (only alphanumeric and underscore allowed)")

    if not sanitized_tags:
        return []

    tag_pattern = "|".join(re.escape(tag) for tag in sanitized_tags)
    regex = f"\\b({tag_pattern})\\b"

    # Sanitize workspace_path to prevent path traversal
    workspace_path_resolved = Path(workspace_path).resolve()
    if not workspace_path_resolved.exists() or not workspace_path_resolved.is_dir():
        return []

    cmd.extend([regex, str(workspace_path_resolved)])

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=workspace_path
        )

        todos = []
        for line in result.stdout.splitlines():
            todo = parse_todo_line(line, workspace_path)
            if todo:
                todos.append(todo)

        return todos
    except subprocess.TimeoutExpired:
        return []
    except Exception as e:
        print(f"Error running ripgrep: {e}")
        return search_todos_python(workspace_path, tags, exclude_patterns, include_patterns)


def search_todos_python(
    workspace_path: str,
    tags: Optional[List[str]] = None,
    exclude_patterns: Optional[List[str]] = None,
    include_patterns: Optional[List[str]] = None
) -> List[TodoItem]:
    """
    Fallback Python-based TODO search if ripgrep is not available.
    """
    if tags is None:
        tags = ["TODO", "FIXME", "BUG", "HACK", "XXX", "NOTE"]

    todos = []
    workspace = Path(workspace_path)

    # Default exclude patterns
    default_excludes = {
        "node_modules", "venv", ".venv", "__pycache__", ".git",
        ".nuxt", ".output", "dist", "build", ".cache"
    }

    if exclude_patterns:
        default_excludes.update(exclude_patterns)

    # File extensions to search
    code_extensions = {
        ".py", ".js", ".ts", ".jsx", ".tsx", ".vue", ".java", ".cpp", ".c",
        ".h", ".hpp", ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt",
        ".md", ".html", ".css", ".scss", ".sass", ".less", ".json", ".yaml",
        ".yml", ".xml", ".sh", ".bash", ".ps1", ".m", ".r"
    }

    tag_pattern = re.compile(
        r'\b(' + '|'.join(re.escape(tag) for tag in tags) + r')\b',
        re.IGNORECASE
    )

    for file_path in workspace.rglob("*"):
        # Skip excluded directories
        if any(exclude in str(file_path) for exclude in default_excludes):
            continue

        # Check include patterns
        if include_patterns:
            if not any(file_path.match(pattern) for pattern in include_patterns):
                continue

        # Only process code files
        if file_path.is_file() and file_path.suffix in code_extensions:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line_num, line in enumerate(f, 1):
                        match = tag_pattern.search(line)
                        if match:
                            tag = match.group(1).upper()
                            col_num = match.start() + 1

                            before = line[:match.start()].strip()
                            after = line[match.end():].strip()
                            after = re.sub(r'^[:\-\s]*', '', after)

                            todos.append(TodoItem(
                                file=str(file_path.relative_to(workspace)),
                                line=line_num,
                                column=col_num,
                                tag=tag,
                                text=line.strip(),
                                before=before,
                                after=after
                            ))
            except Exception:
                continue

    return todos


@mcp.tool()
def search_todos_tool(
    workspace_path: Optional[str] = None,
    tags: Optional[List[str]] = None,
    exclude_patterns: Optional[List[str]] = None,
    include_patterns: Optional[List[str]] = None,
    file_filter: Optional[str] = None,
    tag_filter: Optional[str] = None
) -> str:
    """
    Search for TODO comments in the codebase.

    Args:
        workspace_path: Root directory to search (defaults to current directory)
        tags: List of tags to search for (e.g., ["TODO", "FIXME"])
        exclude_patterns: Glob patterns to exclude (e.g., ["**/node_modules/**"])
        include_patterns: Glob patterns to include
        file_filter: Filter results by file path (substring match)
        tag_filter: Filter results by tag name

    Returns:
        JSON string with list of TODO items
    """
    if workspace_path is None:
        workspace_path = os.getcwd()

    todos = search_todos(workspace_path, tags, exclude_patterns, include_patterns)

    # Apply filters
    if file_filter:
        todos = [t for t in todos if file_filter.lower() in t.file.lower()]

    if tag_filter:
        todos = [t for t in todos if t.tag.upper() == tag_filter.upper()]

    # Convert to dict for JSON serialization
    result = {
        "count": len(todos),
        "todos": [asdict(todo) for todo in todos]
    }

    return json.dumps(result, indent=2)


@mcp.tool()
def list_todos_by_tag(
    workspace_path: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> str:
    """
    List all TODOs grouped by tag.

    Args:
        workspace_path: Root directory to search
        tags: List of tags to search for

    Returns:
        JSON string with TODOs grouped by tag
    """
    if workspace_path is None:
        workspace_path = os.getcwd()

    todos = search_todos(workspace_path, tags)

    # Group by tag
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for todo in todos:
        if todo.tag not in grouped:
            grouped[todo.tag] = []
        grouped[todo.tag].append(asdict(todo))

    result = {
        "total": len(todos),
        "by_tag": grouped
    }

    return json.dumps(result, indent=2)


@mcp.tool()
def get_todo_statistics(
    workspace_path: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> str:
    """
    Get statistics about TODOs in the codebase.

    Args:
        workspace_path: Root directory to search
        tags: List of tags to search for

    Returns:
        JSON string with TODO statistics
    """
    if workspace_path is None:
        workspace_path = os.getcwd()

    todos = search_todos(workspace_path, tags)

    # Count by tag
    tag_counts: Dict[str, int] = {}
    file_counts: Dict[str, int] = {}

    for todo in todos:
        tag_counts[todo.tag] = tag_counts.get(todo.tag, 0) + 1
        file_counts[todo.file] = file_counts.get(todo.file, 0) + 1

    # Find files with most TODOs
    top_files = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    result = {
        "total": len(todos),
        "by_tag": tag_counts,
        "files_with_todos": len(file_counts),
        "top_files": [{"file": f, "count": c} for f, c in top_files]
    }

    return json.dumps(result, indent=2)


@mcp.tool()
def export_todos(
    workspace_path: Optional[str] = None,
    output_file: Optional[str] = None,
    format: str = "json",
    tags: Optional[List[str]] = None
) -> str:
    """
    Export TODOs to a file.

    Args:
        workspace_path: Root directory to search
        output_file: Path to output file (defaults to todos.json in workspace)
        format: Output format - "json" or "markdown"
        tags: List of tags to search for

    Returns:
        Success message with file path
    """
    if workspace_path is None:
        workspace_path = os.getcwd()

    todos = search_todos(workspace_path, tags)

    if output_file is None:
        output_file = os.path.join(workspace_path, "todos.json")

    # Validate output path to prevent arbitrary file write
    output_path = Path(output_file)

    # Resolve paths to prevent directory traversal
    workspace_resolved = Path(workspace_path).resolve()
    output_resolved = output_path.resolve()

    # Ensure output is within workspace or a safe subdirectory
    try:
        # Check if output is within workspace
        if not str(output_resolved).startswith(str(workspace_resolved)):
            # Allow writing to current directory if workspace is current directory
            cwd_resolved = Path.cwd().resolve()
            if not str(output_resolved).startswith(str(cwd_resolved)):
                raise ValueError(f"Output path must be within workspace: {output_file}")
    except (OSError, ValueError) as e:
        raise ValueError(f"Invalid output path: {output_file} - {e}")

    # Prevent writing to sensitive locations
    sensitive_paths = ['/etc', '/usr', '/bin', '/sbin', '/var', '/sys', '/proc']
    output_str = str(output_resolved)
    if any(output_str.startswith(sp) for sp in sensitive_paths):
        raise ValueError(f"Output path in restricted location: {output_file}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    if format.lower() == "markdown":
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("# TODO List\n\n")
            f.write(f"Total: {len(todos)} TODOs\n\n")

            # Group by tag
            grouped: Dict[str, List[TodoItem]] = {}
            for todo in todos:
                if todo.tag not in grouped:
                    grouped[todo.tag] = []
                grouped[todo.tag].append(todo)

            for tag, items in sorted(grouped.items()):
                f.write(f"## {tag} ({len(items)})\n\n")
                for todo in items:
                    f.write(f"- **{todo.file}:{todo.line}** - {todo.after or '(no description)'}\n")
                f.write("\n")

        return f"Exported {len(todos)} TODOs to {output_file} in Markdown format"
    else:
        # JSON format
        data = {
            "total": len(todos),
            "todos": [asdict(todo) for todo in todos]
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        return f"Exported {len(todos)} TODOs to {output_file} in JSON format"


if __name__ == "__main__":
    mcp.run()
