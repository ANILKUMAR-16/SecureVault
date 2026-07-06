from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Shared properties
class DocumentBase(BaseModel):
    filename: str

# Properties to return to client
class DocumentResponse(DocumentBase):
    id: str
    owner_id: str
    stored_name: str
    mime_type: str
    extension: str
    size: int
    downloads: int
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True
