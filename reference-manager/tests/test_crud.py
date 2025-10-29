import pytest

def test_add_get_update_delete(service):
    # Add
    created = service.add_reference({"title": "Test Title", "authors": "A", "year": 2023, "notes": "n"})
    assert "id" in created
    ref_id = created["id"]

    # Get
    got = service.get_reference(ref_id)
    assert got["title"] == "Test Title"

    # Update
    updated = service.update_reference(ref_id, {"title": "Updated"})
    assert updated["title"] == "Updated"

    # List
    all_items = service.list_references()
    assert any(it["id"] == ref_id for it in all_items)

    # Delete
    ok = service.delete_reference(ref_id)
    assert ok
    assert service.get_reference(ref_id) is None

def test_import_export(service, tmp_path):
    # Export empty
    out = tmp_path / "out.json"
    count = service.export_to_file(str(out))
    assert count == 0

    # Import a sample list
    sample = [
        {"title": "S1", "authors": "X"},
        {"title": "S2", "authors": "Y"}
    ]
    src = tmp_path / "in.json"
    src.write_text(__import__("json").dumps(sample))
    added = service.import_from_file(str(src))
    assert added == 2
    assert len(service.list_references()) == 2
