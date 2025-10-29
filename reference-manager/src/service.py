from dataclasses import dataclass
from typing import List, Optional, Dict, Union, Tuple
from pathlib import Path
from .repository import BaseRepository, JsonRepository
import json

@dataclass
class Reference:
    """Dataclass representing a single reference entry."""
    id: str
    title: str
    authors: str = ""
    year: Optional[int] = None
    notes: str = ""


class ReferenceService:
    """
    Service layer for managing references.
    Provides a stable API for the CLI and abstracts away repository details.
    """

    def __init__(self, repo: Optional[BaseRepository] = None):
        # Default to JSON repository, but can be swapped (e.g., PostgreSQL later).
        self.repo: BaseRepository = repo or JsonRepository()

    # -------------------------
    # CRUD
    # -------------------------
    def list_references(self) -> List[Dict]:
        """Return all references in the repository."""
        return self.repo.list_all()

    def get_reference(self, ref_id: str) -> Optional[Dict]:
        """Retrieve a single reference by ID."""
        return self.repo.get(ref_id)

    def add_reference(self, data: Dict) -> Dict:
        """Add a new reference and return the created record."""
        return self.repo.add(data)

    def update_reference(self, ref_id: str, changes: Dict) -> Optional[Dict]:
        """
        Update a reference and return the updated record.
        Includes old values for changed fields (prefixed with '_old_')
        so the CLI can display descriptive CLARITY-style output.
        """
        current = self.repo.get(ref_id)
        if not current:
            return None

        # Track old values for fields being changed
        old_values = {}
        for field, new_value in changes.items():
            if field in current:
                old_values[f"_old_{field}"] = current.get(field)

        updated = self.repo.update(ref_id, changes)
        if not updated:
            return None

        # Merge old values into the returned dict
        return {**updated, **old_values}

    def delete_reference(self, ref_id: str) -> bool:
        """Delete a reference by ID. Returns True if deleted, False if not found."""
        return self.repo.delete(ref_id)

    # -------------------------
    # Import / Export
    # -------------------------
    def import_from_file(self, path: str, merge: bool = True) -> int:
        """
        Import references from a JSON file (simple mode).
        If merge=True, keep existing references and add new ones.
        If merge=False, replace the library entirely.
        """
        return self.repo.import_json(Path(path), merge=merge)

    def export_to_file(self, path: str) -> int:
        """Export all references to a JSON file."""
        return self.repo.export_json(Path(path))

    def import_references(
        self, filepath: str, overwrite: bool = False, return_skipped: bool = False
    ) -> Union[int, Tuple[int, int]]:
        """
        Import references from a JSON file with overwrite/merge options.

        Args:
            filepath: Path to the JSON file.
            overwrite: If True, replace the current library entirely.
            return_skipped: If True, return a tuple (added_count, skipped_count).

        Returns:
            int or tuple: Number of references imported,
                          or (added, skipped) if return_skipped=True.
        """
        with open(filepath, "r", encoding="utf-8") as f:
            incoming = json.load(f)

        if overwrite:
            # Replace entire library
            return self.repo.import_json(Path(filepath), merge=False)

        # Merge mode with optional skipped count
        current_ids = {ref["id"] for ref in self.repo.list_all()}
        added, skipped = 0, 0

        for ref in incoming:
            if ref["id"] in current_ids:
                skipped += 1
            else:
                self.repo.add(ref)
                added += 1

        if return_skipped:
            return added, skipped
        return added

    # -------------------------
    # Search
    # -------------------------
    def search(self, query: str) -> List[Dict]:
        """
        Search references by keyword across title, authors, and notes.
        Returns a list of matching references.
        """
        q = query.lower().strip()
        results = []
        for it in self.repo.list_all():
            text = " ".join(
                str(v) for v in (
                    it.get("title", ""),
                    it.get("authors", ""),
                    it.get("notes", "")
                )
            )
            if q in text.lower():
                results.append(it)
        return results
