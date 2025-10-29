"""Simple file and folder manager utilities used by the reference-manager project.

Functions:
- ensure_dir(path)
- create_file(path, content=None, overwrite=False)
- append_file(path, content)
- read_file(path)
- list_dir(path, show_hidden=False)
"""
from pathlib import Path
from typing import List, Optional


def ensure_dir(path: str) -> Path:
    """Ensure a directory exists. Returns the Path object."""
    p = Path(path).expanduser()
    p.mkdir(parents=True, exist_ok=True)
    return p


def create_file(path: str, content: Optional[str] = None, overwrite: bool = False) -> Path:
    """Create a file. If content provided, write it. If overwrite=False and file exists, raises FileExistsError."""
    p = Path(path).expanduser()
    if p.exists() and not overwrite:
        raise FileExistsError(f"File already exists: {p}")
    ensure_dir(p.parent.as_posix())
    with p.open("w", encoding="utf-8") as f:
        if content:
            f.write(content)
    return p


def append_file(path: str, content: str) -> Path:
    """Append content to a file, creating parent directories if needed."""
    p = Path(path).expanduser()
    ensure_dir(p.parent.as_posix())
    with p.open("a", encoding="utf-8") as f:
        f.write(content)
    return p


def read_file(path: str) -> str:
    """Read and return the file content."""
    p = Path(path).expanduser()
    with p.open("r", encoding="utf-8") as f:
        return f.read()


def list_dir(path: str = ".", show_hidden: bool = False) -> List[str]:
    """Return a list of directory entries (names)."""
    p = Path(path).expanduser()
    if not p.exists():
        return []
    entries = []
    for child in sorted(p.iterdir()):
        name = child.name
        if not show_hidden and name.startswith("."):
            continue
        entries.append(name + ("/" if child.is_dir() else ""))
    return entries
