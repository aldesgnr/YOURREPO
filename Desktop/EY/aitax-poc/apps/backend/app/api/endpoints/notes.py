from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.auth import get_current_active_user
from app.core.database import get_session
from app.models.document import Document
from app.models.news import News
from app.models.note import Note, NoteCreate, NoteRead, NoteUpdate
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[NoteRead])
async def get_all_notes(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)],
    news_id: Optional[int] = None,
    document_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 10
):
    """Get all notes for the current user with optional filtering"""
    query = select(Note).where(Note.user_id == current_user.id)
    
    if news_id:
        query = query.where(Note.news_id == news_id)
    
    if document_id:
        query = query.where(Note.document_id == document_id)
    
    notes = db.exec(query.offset(skip).limit(limit)).all()
    return notes


@router.get("/{note_id}", response_model=NoteRead)
async def get_note(
    note_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Get a specific note by ID"""
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check if note belongs to current user
    if note.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this note"
        )
    
    return note


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_create: NoteCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Create a new note"""
    # Validate references
    if note_create.news_id:
        news = db.get(News, note_create.news_id)
        if not news:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced news item not found"
            )
    
    if note_create.document_id:
        document = db.get(Document, note_create.document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced document not found"
            )
        
        # Check if document belongs to current user
        if document.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to reference this document"
            )
    
    # Create new note
    db_note = Note(**note_create.model_dump(), user_id=current_user.id)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note


@router.put("/{note_id}", response_model=NoteRead)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Update a note"""
    # Get existing note
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check if note belongs to current user
    if note.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this note"
        )
    
    # Update note with non-None values
    note_data = note_update.model_dump(exclude_unset=True)
    for key, value in note_data.items():
        setattr(note, key, value)
    
    note.updated_at = note.updated_at  # Trigger update of updated_at field
    
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Delete a note"""
    # Get existing note
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check if note belongs to current user
    if note.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this note"
        )
    
    # Delete note
    db.delete(note)
    db.commit()
    
    return None
