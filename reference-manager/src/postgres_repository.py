import psycopg2
from psycopg2.extras import RealDictCursor
from pathlib import Path
from typing import List, Dict, Optional
from uuid import uuid4
import json

from .repository import BaseRepository


class PostgresRepository(BaseRepository):
    """
    PostgreSQL-based repository implementation.
    Implements the BaseRepository contract.
    """

    def __init__(self, dsn: str):
        """
        Args:
            dsn: PostgreSQL connection string, e.g.
                 "dbname=refman user=postgres password=secret host=localhost port=5432"
        """
        self.dsn = dsn
        self._ensure_schema()

    def _connect(self):
        return psycopg2.connect(self.dsn, cursor_factory=RealDictCursor)

    def _ensure_schema(self):
        """Ensure the refs table exists."""
        with self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS refs (
                    id UUID PRIMARY KEY,
                    title TEXT NOT NULL,
                    authors TEXT,
                    year INT,
                    notes TEXT
                )
                """
            )
            conn.commit()

    # -------------------------
    # CRUD
    # -------------------------
    def list_all(self) -> List[Dict]:
        with self._connect() as conn, conn.cursor() as cur:
            cur.execute("SELECT * FROM refs ORDER BY title")
            return cur.fetchall()

    def get(self, ref_id: str) -> Optional[Dict]:
        with self._connect() as conn, conn.cursor() as cur:
            cur.execute("SELECT * FROM refs WHERE id = %s", (ref_id,))
            row = cur.fetchone()
            return row if row else None

    def add(self, item: Dict) -> Dict:
        ref_id = item.get("id") or str(uuid4())
        with self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO refs (id, title, authors, year, notes)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    ref_id,
                    item.get("title"),
                    item.get("authors"),
                    item.get("year"),
                    item.get("notes"),
                ),
            )
            created = cur.fetchone()
            conn.commit()
            return created

    def update(self, ref_id: str, changes: Dict) -> Optional[Dict]:
        if not changes:
            return self.get(ref_id)

        fields = []
        values = []
        for k, v in changes.items():
            fields.append(f"{k} = %s")
            values.append(v)
        values.append(ref_id)

        with self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                f"UPDATE refs SET {', '.join(fields)} WHERE id = %s RETURNING *",
                tuple(values),
            )
            updated = cur.fetchone()
            conn.commit()
            return updated

    def delete(self, ref_id: str) -> bool:
        with self._connect() as conn, conn.cursor() as cur:
            cur.execute("DELETE FROM refs WHERE id = %s RETURNING id", (ref_id,))
            deleted = cur.fetchone()
            conn.commit()
            return bool(deleted)

    # -------------------------
    # Import / Export
    # -------------------------
    def import_json(self, source_path: Path, merge: bool = True) -> int:
        with open(source_path, "r", encoding="utf-8") as f:
            incoming = json.load(f)
        assert isinstance(incoming, list)

        added = 0
        with self._connect() as conn, conn.cursor() as cur:
            if not merge:
                cur.execute("TRUNCATE refs")

            for ref in incoming:
                ref_id = ref.get("id") or str(uuid4())
                cur.execute(
                    """
                    INSERT INTO refs (id, title, authors, year, notes)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        ref_id,
                        ref.get("title"),
                        ref.get("authors"),
                        ref.get("year"),
                        ref.get("notes"),
                    ),
                )
                if cur.rowcount > 0:
                    added += 1
            conn.commit()
        return added

    def export_json(self, dest_path: Path) -> int:
        refs = self.list_all()
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dest_path, "w", encoding="utf-8") as f:
            json.dump(refs, f, ensure_ascii=False, indent=2)
        return len(refs)
