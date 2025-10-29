from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
from contextlib import contextmanager
from sqlalchemy import text
import os

# Load environment variables
load_dotenv(override=True, verbose=True)
PG_URL = os.getenv("PG_URL")

# Create engine
engine = create_engine(PG_URL, echo=True)

# Session factory
@contextmanager
def get_session(engine=None):
    if engine is None:
        from .db import engine as default_engine
        engine = default_engine
    with Session(engine) as session:
        yield session

def get_engine(url: str | None = None, echo: bool = False):
    db_url = url or PG_URL
    return create_engine(db_url, echo=echo)

# Optional: init function for migrations or test harness
def init_db():
    SQLModel.metadata.create_all(engine)

# Optional: test connection
if __name__ == "__main__":
    with get_session() as session:
        result = session.exec(text("SELECT 1")).one()
        print("DB connection test:", result)
