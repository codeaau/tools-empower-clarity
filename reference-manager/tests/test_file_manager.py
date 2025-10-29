from src.file_manager import ensure_dir, create_file, append_file, read_file, list_dir

def test_create_and_read(tmp_path):
    d = tmp_path / "sub"
    ensure_dir(str(d))
    p = d / "f.txt"
    create_file(str(p), content="hello")
    assert read_file(str(p)) == "hello"


def test_append_and_list(tmp_path):
    d = tmp_path / "sub2"
    p = d / "a.txt"
    append_file(str(p), "one")
    append_file(str(p), "two")
    assert read_file(str(p)) == "onetwo"
    entries = list_dir(str(tmp_path))
    assert any(e.startswith("sub2") for e in entries)
