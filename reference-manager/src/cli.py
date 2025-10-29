import os
import click
from pathlib import Path
import json
from tabulate import tabulate
from dotenv import load_dotenv
from .service import ReferenceService
from .repository import JsonRepository
from .postgres_repository import PostgresRepository
from .backend_loader import get_repository

# Initialize repository (interactive by default)
repo = get_repository(interactive=True)
service = ReferenceService(repo=repo)


@click.group()
def cli():
    """Reference Manager CLI — manage your references with clarity and confidence."""
    pass

# -------------------------
# Utility: Output formatting
# -------------------------
def output_references(refs, pretty: bool = False, as_json: bool = False):
    """Helper to format reference output according to flags."""
    if as_json:
        click.echo(json.dumps(refs, indent=2, ensure_ascii=False))
        return
    if pretty:
        headers = ["ID", "Title", "Authors", "Year", "Notes"]
        rows = [
            [r.get("id"), r.get("title",""), r.get("authors",""), r.get("year",""), r.get("notes","")]
            for r in refs
        ]
        click.echo(tabulate(rows, headers=headers, tablefmt="fancy_grid"))
        return
    # Default simple output
    for r in refs:
        click.echo(f"- {r['id']}: {r.get('title','<no title>')}")

# -------------------------
# LIST
# -------------------------
@cli.command("list")
@click.option("--pretty", is_flag=True, help="Show tabular output.")
@click.option("--json", "as_json", is_flag=True, help="Show raw JSON output.")
def cmd_list(pretty, as_json):
    """List all references."""
    refs = service.list_references()
    if not refs:
        click.echo("ℹ️  No references found in your library.")
        return
    click.echo(f"📚 {len(refs)} reference(s) in your library:")
    output_references(refs, pretty=pretty, as_json=as_json)

# -------------------------
# GET
# -------------------------
@cli.command("get")
@click.argument("ref_id")
@click.option("--json", "as_json", is_flag=True, help="Show raw JSON output.")
def cmd_get(ref_id, as_json):
    """Retrieve a reference by ID."""
    r = service.get_reference(ref_id)
    if not r:
        click.echo(f"❌ Reference with ID {ref_id} not found.")
        return
    if as_json:
        click.echo(json.dumps(r, indent=2, ensure_ascii=False))
        return
    click.echo("📖 Reference details:")
    click.echo(f"ID: {r['id']}")
    click.echo(f"Title: {r.get('title','')}")
    click.echo(f"Authors: {r.get('authors','')}")
    click.echo(f"Year: {r.get('year','')}")
    click.echo(f"Notes: {r.get('notes','')}")

# -------------------------
# ADD
# -------------------------
@cli.command("add")
@click.option("--title", prompt=True, help="Title of the reference")
@click.option("--authors", default="", help="Author(s) of the reference")
@click.option("--year", type=int, default=None, help="Year of publication")
@click.option("--notes", default="", help="Additional notes")
def cmd_add(title, authors, year, notes):
    """Add a new reference."""
    item = {"title": title, "authors": authors, "year": year, "notes": notes}
    created = service.add_reference(item)

    click.echo("✅ Reference added successfully")
    click.echo(f"ID: {created['id']}")
    click.echo(f"Title: \"{created.get('title','')}\"")
    if created.get("authors"):
        click.echo(f"Authors: {created['authors']}")
    if created.get("year"):
        click.echo(f"Year: {created['year']}")
    if created.get("notes"):
        click.echo(f"Notes: {created['notes']}")

# -------------------------
# UPDATE
# -------------------------
@cli.command("update")
@click.argument("ref_id")
@click.option("--title", default=None, help="New title")
@click.option("--authors", default=None, help="New author(s)")
@click.option("--year", type=int, default=None, help="New year")
@click.option("--notes", default=None, help="New notes")
def cmd_update(ref_id, title, authors, year, notes):
    """Update an existing reference by ID."""
    changes = {}
    if title is not None:
        changes["title"] = title
    if authors is not None:
        changes["authors"] = authors
    if year is not None:
        changes["year"] = year
    if notes is not None:
        changes["notes"] = notes

    updated = service.update_reference(ref_id, changes)
    if not updated:
        click.echo(f"❌ Reference with ID {ref_id} not found.")
        return

    click.echo("🔄 Reference updated successfully")
    click.echo(f"ID: {updated['id']}")
    for field, new_value in changes.items():
        old_value = updated.get(f"_old_{field}")
        if old_value is not None:
            click.echo(f"{field.capitalize()}: \"{old_value}\" → \"{new_value}\"")
        else:
            click.echo(f"{field.capitalize()}: set to \"{new_value}\"")

# -------------------------
# DELETE
# -------------------------
@cli.command("delete")
@click.argument("ref_id")
def cmd_delete(ref_id):
    """Delete a reference by ID."""
    ok = service.delete_reference(ref_id)
    if not ok:
        click.echo(f"❌ Reference with ID {ref_id} not found.")
        return
    click.echo(f"🗑️ Reference {ref_id} deleted successfully.")

# -------------------------
# SEARCH
# -------------------------
@cli.command("search")
@click.argument("query")
@click.option("--pretty", is_flag=True, help="Show tabular output.")
@click.option("--json", "as_json", is_flag=True, help="Show raw JSON output.")
def cmd_search(query, pretty, as_json):
    """Search references by keyword."""
    results = service.search(query)
    if not results:
        click.echo(f"ℹ️  No matches found for \"{query}\".")
        return
    click.echo(f"🔍 Found {len(results)} match(es) for \"{query}\":")
    output_references(results, pretty=pretty, as_json=as_json)

# -------------------------
# EXPORT
# -------------------------
@cli.command("export")
@click.argument("dest_path", type=click.Path())
def cmd_export(dest_path):
    """Export all references to a JSON file."""
    count = service.export_to_file(dest_path)
    click.echo(f"📤 Exported {count} reference(s) to {dest_path}")

# -------------------------
# IMPORT
# -------------------------
@cli.command("import")
@click.argument("filepath")
@click.option("--merge", is_flag=True, help="Merge references from file into current library.")
@click.option("--overwrite", is_flag=True, help="Replace current library with references from file.")
def cmd_import(filepath, merge, overwrite):
    """Import references from a JSON file."""
    if merge and overwrite:
        click.echo("❌ Error: Use either --merge or --overwrite, not both.")
        return

    if not Path(filepath).exists():
        click.echo(f"❌ Error: File '{filepath}' not found.")
        return

    if overwrite:
        count = service.import_references(filepath, overwrite=True)
        click.echo(f"📥 Imported {count} reference(s) from {filepath}.")
        click.echo("⚠️  Note: Your previous library was replaced entirely with this backup.")
        return

    if merge:
        added, skipped = service.import_references(filepath, overwrite=False, return_skipped=True)
        click.echo(f"📥 Imported {added} new reference(s) from {filepath}.")
        if skipped > 0:
            click.echo(f"⏭️  Skipped {skipped} reference(s) because they already exist (matched by ID).")
            click.echo("Tip: Use --overwrite if you want to replace your current library with the backup.")
        return

    click.echo("❌ Error: Please specify either --merge or --overwrite.")

# -------------------------
# HELP
# -------------------------
@cli.command("help")
def cmd_help():
    """Show this help message."""
    click.echo(cli.get_help(click.Context(cli)))

if __name__ == "__main__":
    cli()