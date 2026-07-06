from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from models.document import Document
from typing import Optional

def create_document(db: Session, owner_id: str, filename: str, stored_name: str, mime_type: str, extension: str, size: int):
    db_document = Document(
        owner_id=owner_id,
        filename=filename,
        stored_name=stored_name,
        mime_type=mime_type,
        extension=extension,
        size=size
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_document(db: Session, doc_id: str):
    return db.query(Document).filter(Document.id == doc_id).first()

def increment_download(db: Session, doc_id: str):
    doc = get_document(db, doc_id)
    if doc:
        doc.downloads += 1
        db.commit()
        db.refresh(doc)
    return doc

def update_delete_status(db: Session, doc_id: str, is_deleted: bool):
    doc = get_document(db, doc_id)
    if doc:
        doc.is_deleted = is_deleted
        db.commit()
        db.refresh(doc)
    return doc

def get_documents(db: Session, user_id: str, page: int = 1, limit: int = 10, search: Optional[str] = None, sort_by: str = "newest", include_deleted: bool = False):
    query = db.query(Document).filter(Document.owner_id == user_id)
    
    if not include_deleted:
        query = query.filter(Document.is_deleted == False)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Document.filename.ilike(search_pattern)) | 
            (Document.extension.ilike(search_pattern))
        )
    
    # Sorting logic
    if sort_by == "newest":
        query = query.order_by(desc(Document.created_at))
    elif sort_by == "oldest":
        query = query.order_by(asc(Document.created_at))
    elif sort_by == "a-z":
        query = query.order_by(asc(Document.filename))
    elif sort_by == "z-a":
        query = query.order_by(desc(Document.filename))
    elif sort_by == "largest":
        query = query.order_by(desc(Document.size))
    elif sort_by == "smallest":
        query = query.order_by(asc(Document.size))
    else:
        query = query.order_by(desc(Document.created_at))

    # Pagination
    offset = (page - 1) * limit
    total = query.count()
    documents = query.offset(offset).limit(limit).all()
    
    return documents, total
