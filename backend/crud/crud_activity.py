from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.activity import Activity
import logging

logger = logging.getLogger("securevault")

def log_activity(db: Session, user_id: str, action: str, details: str = None):
    db_activity = Activity(
        user_id=user_id,
        action=action,
        details=details
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    # Also log to file
    logger.info(f"User={user_id} Action={action} Details={details}")
    
    return db_activity

def get_recent_activities(db: Session, limit: int = 50):
    return db.query(Activity).order_by(desc(Activity.timestamp)).limit(limit).all()
