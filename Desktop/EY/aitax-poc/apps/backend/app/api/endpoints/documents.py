import os
import shutil
from datetime import datetime
from typing import Annotated, List

from fastapi import (
    APIRouter, 
    Depends, 
    File, 
    Form, 
    HTTPException, 
    UploadFile, 
    status
)
from sqlmodel import Session, select

from app.core.auth import get_current_active_user
from app.core.config import settings
from app.core.database import get_session
from app.models.document import Document, DocumentRead, DocumentType, DocumentUpdate
from app.models.user import User
from app.services.document_processor import process_document

router = APIRouter()


@router.get("", response_model=List[DocumentRead])
async def get_all_documents(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)],
    skip: int = 0,
    limit: int = 10
):
    """Get all documents for the current user with pagination"""
    documents = db.exec(
        select(Document)
        .where(Document.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    ).all()
    return documents


@router.get("/{document_id}", response_model=DocumentRead)
async def get_document(
    document_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Get a specific document by ID"""
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if document belongs to current user
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document"
        )
    
    return document


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: Annotated[str, Form()],
    description: Annotated[str, Form()] = None,
    file: Annotated[UploadFile, File()],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Upload a new document"""
    # Check file size
    file_size = 0
    file_contents = await file.read()
    file_size = len(file_contents)
    await file.seek(0)  # Reset file pointer
    
    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024  # Convert to bytes
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB} MB"
        )
    
    # Check file extension
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Create upload directory if it doesn't exist
    upload_dir = f"/data/uploads/{current_user.id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    file_path = f"{upload_dir}/{timestamp}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        buffer.write(file_contents)
    
    # Create document record
    db_document = Document(
        title=title,
        description=description,
        file_path=file_path,
        file_type=DocumentType(file_ext),
        file_size=file_size,
        user_id=current_user.id
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Process document in background
    await process_document(db_document.id)
    
    return db_document


@router.put("/{document_id}", response_model=DocumentRead)
async def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Update document metadata"""
    # Get existing document
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if document belongs to current user
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this document"
        )
    
    # Update document with non-None values
    document_data = document_update.model_dump(exclude_unset=True)
    for key, value in document_data.items():
        setattr(document, key, value)
    
    document.updated_at = document.updated_at  # Trigger update of updated_at field
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Delete a document"""
    # Get existing document
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if document belongs to current user
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document"
        )
    
    # Delete file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete document
    db.delete(document)
    db.commit()
    
    return None
