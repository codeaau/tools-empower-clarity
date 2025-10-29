from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, func
from typing import Optional
from datetime import datetime

class Reference(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    url: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
