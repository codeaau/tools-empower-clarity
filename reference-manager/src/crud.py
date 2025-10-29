from typing import Optional
from .models import Reference

def add_ref(session, title: str, url: Optional[str] = None, tags: Optional[str] = None) -> Reference:
    """Insert a new Reference into the database and return it."""
    ref = Reference(title=title, url=url, tags=tags)
    session.add(ref)
    session.commit()
    session.refresh(ref)
    return ref

def get_ref(session, ref_id: int) -> Optional[Reference]:
    """
    Retrieve a single Reference by its primary key ID.

    Session-first style: the caller owns the session lifecycle.
    Returns the ORM instance if found, otherwise None.
    No commit is performed here; pure read operation.

    Args:
        session: An active SQLModel Session managed by the caller.
        ref_id: Primary key of the Reference to fetch.

    Returns:
        Reference instance if found, otherwise None.
    """
    return session.get(Reference, ref_id)

def update_ref(session, ref_id: int, title: Optional[str] = None, url: Optional[str] = None, tags: Optional[str] = None) -> Optional[Reference]:
    """Update fields of a Reference and return the updated object, or None if not found."""
    ref = session.get(Reference, ref_id)
    if not ref:
        return None
    if title is not None:
        ref.title = title
    if url is not None:
        ref.url = url
    if tags is not None:
        ref.tags = tags
    session.commit()
    session.refresh(ref)
    return ref

def delete_ref(session, ref_id: int) -> bool:
    """Delete a Reference by ID. Returns True if deleted, False if not found."""
    ref = session.get(Reference, ref_id)
    if not ref:
        return False
    session.delete(ref)
    session.commit()
    return True
