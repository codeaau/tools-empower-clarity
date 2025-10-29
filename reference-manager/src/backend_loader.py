import os
from pathlib import Path
import click
from dotenv import load_dotenv
from .repository import JsonRepository
from .postgres_repository import PostgresRepository

load_dotenv()  # Load environment variables from .env if present


def get_repository(interactive: bool = True):
    """
    Decide which repository backend to use.
    Falls back to interactive prompts if variables are missing (unless interactive=False).
    """
    backend = os.getenv("REFMAN_BACKEND", "json").lower()

    if backend == "postgres":
        dsn = os.getenv("REFMAN_DSN")
        if not dsn:
            if not interactive:
                raise RuntimeError("REFMAN_BACKEND=postgres but REFMAN_DSN is not set.")
            dsn = click.prompt("Enter your PostgreSQL DSN", type=str)
            _persist_env("REFMAN_DSN", dsn)
        return PostgresRepository(dsn=dsn)

    # JSON backend
    custom_json_path = os.getenv("REFMAN_JSON_PATH")
    if custom_json_path:
        json_path = Path(custom_json_path).expanduser()
        json_path.parent.mkdir(parents=True, exist_ok=True)
        return JsonRepository(path=json_path)

    # Default: let JsonRepository handle its own default (~/Documents/RefMan/references.json)
    return JsonRepository()


def _persist_env(key: str, value: str):
    """
    Append or update a key=value pair in the .env file.
    """
    env_path = Path(".env")
    lines = []
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines()

    updated = False
    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[i] = f"{key}={value}"
            updated = True
            break
    if not updated:
        lines.append(f"{key}={value}")

    env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
