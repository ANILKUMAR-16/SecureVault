from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ActivityResponse(BaseModel):
    id: str
    user_id: str
    action: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
