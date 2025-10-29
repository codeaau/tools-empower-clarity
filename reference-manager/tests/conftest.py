import pytest
from pathlib import Path
import shutil
from src.repository import JsonRepository
from src.service import ReferenceService

@pytest.fixture
def tmp_repo(tmp_path):
    repo_path = tmp_path / "data" / "references.json"
    repo = JsonRepository(path=repo_path)
    yield repo
    # explicit cleanup if any
    if repo_path.exists():
        repo_path.unlink()

@pytest.fixture
def service(tmp_repo):
    return ReferenceService(repo=tmp_repo)
