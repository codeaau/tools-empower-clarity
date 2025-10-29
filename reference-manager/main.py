#!/usr/bin/env python3
from __future__ import annotations
from src.crud import add_ref, list_refs, delete_ref, search_refs
from src.file_manager import ensure_dir, create_file, append_file, read_file, list_dir
import argparse
import sys
from pathlib import Path

# Option: operate relative to project root (this file's parent)
PROJECT_ROOT = Path(__file__).resolve().parent

# Command implementations, using functions from crud.py and file_manager.py
def add_ref_cmd(args: any):
    ref = add_ref(title=args.title, url=args.url, tags=args.tags)
    print(f"Added reference: [id={ref.id}], [title={ref.title}]")

def list_refs_cmd(args: any):
    refs = list_refs()
    if not refs:
        print("No references found.")  # fixed typo
        return
    for ref in refs:
        print(f"[ id = {ref.id} ]\n"
              f"[ title = {ref.title} ]\n"
              f"[ url = {ref.url or 'N/A'} ]\n"
              f"[ tags = {ref.tags or 'N/A'} ]\n"
              f"[ created_at = {ref.created_at} ]\n---")

def delete_ref_cmd(args: any):
    success = delete_ref(args.id)
    if success:
        print(f"Deleted reference {args.id}")
    else:
        print(f"No reference found with id {args.id}")

def search_refs_cmd(args: any):
    results = search_refs(args.keyword)
    if not results:
        print("No matches found.")
        return
    for ref in results:
        print(f"[ id = {ref.id} ]\n"
              f"[ title = {ref.title} ]\n"
              f"[ url = {ref.url or 'N/A'} ]\n"
              f"[ tags = {ref.tags or 'N/A'} ]\n"
              f"[ created_at = {ref.created_at} ]\n---")

def _resolve_path(p: str) -> Path:
    """Resolve user's path relative to project root unless absolute."""
    path = Path(p)
    return (PROJECT_ROOT / path) if not path.is_absolute() else path

def _confirm(prompt: str, default: bool = False) -> bool:
    """Return True if user confirms. Default is False (so Enter = no)."""
    ans = input(f"${prompt} [{'y/n' if default else 'y/n'}]: ").strip().lower()
    if not ans:
        return default
    return ans in ("y", "yes")

def mkdir_cmd(args: any):
    p = _resolve_path(args.path)
    ensure_dir(p)
    print(p)

def touch_cmd(args: any):
    # Resolve the target path (relative to project root unless absolute)
    p = _resolve_path(args.path)

    # Determine whether this would overwrite an existing file
    will_overwrite = p.exists()
    action = f"Overwrite file {p}" if will_overwrite else f"Create file {p}"

    # If a dry-run flag exists and is set, only print would happen
    if getattr(args, "dry_run", False):
        print("DRY-RUN:", action)
        return
    
    # If file exists and user didn't explicitly request overwrite, confirm
    if will_overwrite and not getattr(args, "overwrite", False):
        if not getattr(args, "yes", False):
            if not _confirm(f"{p} exists. Overwrite?", default=False):
                print("Canceled")
                sys.exit(2)
    
    # Create the file (create_file will create parents). Use content if provided.
    create_file(p, content=(args.content or ""), overwrite=bool(getattr(args, "overwrite", False)))

    # Print the created/updated path as minimal CLI output
    print(p)


def write_cmd(args: any):
    p = _resolve_path(args.path)
    create_file(p, content=args.content or "", overwrite=True)
    print(p)

def append_cmd(args: any):
    p = _resolve_path(args.path)
    append_file(p, args.content or "")
    print(p)

def read_cmd(args: any):
    p = _resolve_path(args.path)
    try:
        print(read_file(p))
    except FileNotFoundError:
        print(f"File not found: {p}", file=sys.stderr)
        sys.exit(2)

def ls_cmd(args: any):
    p = _resolve_path(args.path or ".")
    entries = list_dir(p, show_hidden=args.all)
    for e in entries:
        print(e)

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="reference-manager")
    sub = p.add_subparsers(dest="cmd")

    sp = sub.add_parser("mkdir")
    sp.add_argument("path")
    sp.set_defaults(func=mkdir_cmd)

    sp = sub.add_parser("touch")
    sp.add_argument("path")
    sp.add_argument("--content", default=None)
    sp.add_argument("--overwrite", action="store_true")
    sp.set_defaults(func=touch_cmd)

    sp = sub.add_parser("write")
    sp.add_argument("path")
    sp.add_argument("content", nargs="?", default="")
    sp.set_defaults(func=write_cmd)

    sp = sub.add_parser("append")
    sp.add_argument("path")
    sp.add_argument("content", nargs="?", default="")
    sp.set_defaults(func=append_cmd)

    sp = sub.add_parser("read")
    sp.add_argument("path")
    sp.set_defaults(func=read_cmd)

    sp = sub.add_parser("ls")
    sp.add_argument("path", nargs="?", default=".")
    sp.add_argument("-a", "--all", action="store_true", dest="all")
    sp.set_defaults(func=ls_cmd)

    sp = sub.add_parser("add-ref")
    sp.add_argument("title")
    sp.add_argument("--url", default=None)
    sp.add_argument("--tags", default=None)
    sp.set_defaults(func=add_ref_cmd)
    
    sp = sub.add_parser("list-refs")
    sp.set_defaults(func=list_refs_cmd)
    
    sp = sub.add_parser("delete-ref")
    sp.add_argument("id", type=int)
    sp.set_defaults(func=delete_ref_cmd)

    sp = sub.add_parser("search-refs")
    sp.add_argument("keyword")
    sp.set_defaults(func=search_refs_cmd)

    return p

def main(argv=None):
    argv = argv or sys.argv[1:]
    parser = build_parser()
    args = parser.parse_args(argv)
    if not hasattr(args, "func"):
        parser.print_help()
        return 1
    args.func(args)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())