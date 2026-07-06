from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import List

from database.database import get_db
from models.user import User
from models.document import Document
from api.deps import get_current_admin
from crud import crud_activity, crud_user
from schemas.activity import ActivityResponse
from schemas.user import UserResponse

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    Get system-wide analytics for the Admin Dashboard.
    """
    total_users = db.query(User).count()
    total_documents = db.query(Document).filter(Document.is_deleted == False).count()
    
    # Calculate storage used
    storage_result = db.query(func.sum(Document.size)).filter(Document.is_deleted == False).scalar()
    storage_used = storage_result or 0
    
    # Today's uploads
    today = datetime.now(timezone.utc).date()
    today_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    todays_uploads = db.query(Document).filter(Document.created_at >= today_start).count()
    
    # Total Downloads
    downloads_result = db.query(func.sum(Document.downloads)).scalar()
    total_downloads = downloads_result or 0
    
    # Recycle Bin count
    recycle_bin_count = db.query(Document).filter(Document.is_deleted == True).count()
    
    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "storage_used_bytes": storage_used,
        "todays_uploads": todays_uploads,
        "total_downloads": total_downloads,
        "recycle_bin_count": recycle_bin_count
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    Get list of all users.
    """
    users = db.query(User).all()
    return users

@router.get("/logs", response_model=List[ActivityResponse])
def get_audit_logs(limit: int = 100, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    Get system audit logs.
    """
    logs = crud_activity.get_recent_activities(db, limit=limit)
    return logs
