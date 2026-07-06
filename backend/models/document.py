from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from database.database import Base
import uuid
from datetime import datetime, timezone

def generate_uuid():
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    stored_name = Column(String, nullable=False, unique=True)
    mime_type = Column(String, nullable=False)
    extension = Column(String, nullable=False)
    size = Column(Integer, nullable=False) # in bytes
    downloads = Column(Integer, default=0)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
