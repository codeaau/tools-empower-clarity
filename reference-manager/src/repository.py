import json
from pathlib import Path
from typing import List, Dict, Optional, Protocol
from uuid import uuid4

# Default data directory and file for JSON storage
# Now points to ~/Documents/RefMan/references.json
DATA_DIR = Path.home() / "Documents" / "RefMan"
DATA_PATH = DATA_DIR / "references.json"


class BaseRepository(Protocol):
    """
    Abstract repository interface.
    Both JsonRepository and future backends (e.g., PostgresRepository)
    must implement these methods.
    """

    def list_all(self) -> List[Dict]:
        ...

    def get(self, ref_id: str) -> Optional[Dict]:
        ...

    def add(self, item: Dict) -> Dict:
        ...

    def update(self, ref_id: str, changes: Dict) -> Optional[Dict]:
        ...

    def delete(self, ref_id: str) -> bool:
        ...

    def import_json(self, source_path: Path, merge: bool = True) -> int:
        ...

    def export_json(self, dest_path: Path) -> int:
        ...


class JsonRepository:
    """
    JSON-based repository implementation.
    Stores references in a local JSON file and implements BaseRepository.
    """

    def __init__(self, path: Optional[Path] = None):
        self.path = Path(path) if path else DATA_PATH
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self._write([])

    # -------------------------
    # Internal helpers
    # -------------------------
    def _read(self) -> List[Dict]:
        """Read all references from the JSON file."""
        with self.path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, items: List[Dict]):
        """Write all references to the JSON file."""
        with self.path.open("w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)

    # -------------------------
    # Public API
    # -------------------------
    def list_all(self) -> List[Dict]:
        """Return all references."""
        return self._read()

    def get(self, ref_id: str) -> Optional[Dict]:
        """Retrieve a reference by ID."""
        items = self._read()
        for it in items:
            if it.get("id") == ref_id:
                return it
        return None

    def add(self, item: Dict) -> Dict:
        """Add a new reference. Generates an ID if missing."""
        items = self._read()
        item = dict(item)
        item.setdefault("id", str(uuid4()))
        items.append(item)
        self._write(items)
        return item

    def update(self, ref_id: str, changes: Dict) -> Optional[Dict]:
        """Update an existing reference by ID. Returns updated record or None."""
        items = self._read()
        for i, it in enumerate(items):
            if it.get("id") == ref_id:
                updated = dict(it)
                updated.update(changes)
                updated["id"] = ref_id
                items[i] = updated
                self._write(items)
                return updated
        return None

    def delete(self, ref_id: str) -> bool:
        """Delete a reference by ID. Returns True if deleted, False if not found."""
        items = self._read()
        new_items = [it for it in items if it.get("id") != ref_id]
        if len(new_items) == len(items):
            return False
        self._write(new_items)
        return True

    def import_json(self, source_path: Path, merge: bool = True) -> int:
        """
        Import references from a JSON file.
        If merge=True, keep existing references and add new ones.
        If merge=False, replace the library entirely.
        """
        with Path(source_path).open("r", encoding="utf-8") as f:
            imported = json.load(f)
        assert isinstance(imported, list)

        items = self._read() if merge else []
        existing_ids = {it.get("id") for it in items}
        added = 0

        for it in imported:
            if it.get("id") and it["id"] in existing_ids:
                continue
            if not it.get("id"):
                it["id"] = str(uuid4())
            items.append(it)
            added += 1

        self._write(items)
        return added

    def export_json(self, dest_path: Path) -> int:
        """Export all references to a JSON file. Returns number of references exported."""
        items = self._read()
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with dest_path.open("w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        return len(items)
