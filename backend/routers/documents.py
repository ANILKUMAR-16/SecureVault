from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from database.database import get_db
from models.user import User
from api.deps import get_current_user
from crud import crud_document
from services import storage_service
from schemas.document import DocumentResponse

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a new document securely.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty upload provided")
        
    stored_name = storage_service.save_upload_file(file)
    
    _, ext = os.path.splitext(file.filename)
    
    # Size from file object or physical file
    file_path = storage_service.get_file_path(stored_name)
    size = os.path.getsize(file_path)
    
    doc = crud_document.create_document(
        db=db,
        owner_id=current_user.id,
        filename=file.filename,
        stored_name=stored_name,
        mime_type=file.content_type or "application/octet-stream",
        extension=ext.lower(),
        size=size
    )
    return doc

@router.get("/", response_model=dict)
def get_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: str = Query("newest", regex="^(newest|oldest|a-z|z-a|largest|smallest)$"),
    deleted_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user documents with pagination, sorting, and search.
    """
    # Quick inline modification for deleted_only support
    query = db.query(crud_document.Document).filter(crud_document.Document.owner_id == current_user.id)
    
    if deleted_only:
        query = query.filter(crud_document.Document.is_deleted == True)
    else:
        query = query.filter(crud_document.Document.is_deleted == False)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (crud_document.Document.filename.ilike(search_pattern)) | 
            (crud_document.Document.extension.ilike(search_pattern))
        )
    
    from sqlalchemy import desc, asc
    # Sorting logic
    if sort_by == "newest":
        query = query.order_by(desc(crud_document.Document.created_at))
    elif sort_by == "oldest":
        query = query.order_by(asc(crud_document.Document.created_at))
    elif sort_by == "a-z":
        query = query.order_by(asc(crud_document.Document.filename))
    elif sort_by == "z-a":
        query = query.order_by(desc(crud_document.Document.filename))
    elif sort_by == "largest":
        query = query.order_by(desc(crud_document.Document.size))
    elif sort_by == "smallest":
        query = query.order_by(asc(crud_document.Document.size))
    else:
        query = query.order_by(desc(crud_document.Document.created_at))

    offset = (page - 1) * limit
    total = query.count()
    docs = query.offset(offset).limit(limit).all()
    
    # Return custom paginated response
    return {
        "items": [DocumentResponse.model_validate(d) for d in docs],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/download/{doc_id}")
def download_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Download a document and increment the download counter.
    """
    doc = crud_document.get_document(db, doc_id)
    if not doc or doc.owner_id != current_user.id or doc.is_deleted:
        raise HTTPException(status_code=404, detail="Document not found")
        
    crud_document.increment_download(db, doc_id)
    file_path = storage_service.get_file_path(doc.stored_name)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File physical not found on server")
        
    return FileResponse(path=file_path, filename=doc.filename, media_type=doc.mime_type)

@router.get("/preview/{doc_id}")
def preview_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Preview a document (PDF, PNG, JPG) inline without downloading.
    """
    doc = crud_document.get_document(db, doc_id)
    if not doc or doc.owner_id != current_user.id or doc.is_deleted:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.extension not in [".pdf", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Preview not available for this file type")
        
    file_path = storage_service.get_file_path(doc.stored_name)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File physical not found on server")
        
    return FileResponse(path=file_path, media_type=doc.mime_type, headers={"Content-Disposition": "inline"})

@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete a document (moves to Recycle Bin).
    """
    doc = crud_document.get_document(db, doc_id)
    if not doc or doc.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
        
    crud_document.update_delete_status(db, doc_id, True)
    return {"detail": "Document moved to Recycle Bin"}

@router.post("/restore/{doc_id}")
def restore_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Restore a soft-deleted document.
    """
    doc = crud_document.get_document(db, doc_id)
    if not doc or doc.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
        
    crud_document.update_delete_status(db, doc_id, False)
    return {"detail": "Document restored"}
