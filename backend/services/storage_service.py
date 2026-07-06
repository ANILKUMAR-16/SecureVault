import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException, status
from core.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".png", ".jpg", ".jpeg", ".zip", ".txt"}
BANNED_EXTENSIONS = {".exe", ".bat", ".sh", ".cmd", ".ps1"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

def validate_file(file: UploadFile):
    # Check extension
    filename = file.filename
    _, ext = os.path.splitext(filename)
    ext = ext.lower()

    if ext in BANNED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File type not allowed due to security policies.")
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File extension {ext} not allowed.")
    
    # We can check size by reading, but we don't want to load 100MB in memory all at once.
    # We will check size during chunked writing or rely on FastAPIs UploadFile size attribute.
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds the maximum allowed size of 100MB.")
    
    if not filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty filename is not allowed.")

    return ext

def save_upload_file(upload_file: UploadFile) -> str:
    """
    Saves the file to the local storage and returns the generated unique filename.
    """
    ext = validate_file(upload_file)
    
    # Generate unique stored filename
    stored_name = f"{uuid.uuid4()}{ext}"
    
    # Ensure directory exists
    os.makedirs(settings.STORAGE_PATH, exist_ok=True)
    
    file_path = os.path.join(settings.STORAGE_PATH, stored_name)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save file.")
    
    # Final check on physical size in case file.size was missing
    if os.path.getsize(file_path) > MAX_FILE_SIZE:
        os.remove(file_path)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds the maximum allowed size of 100MB.")

    return stored_name

def get_file_path(stored_name: str) -> str:
    return os.path.join(settings.STORAGE_PATH, stored_name)
