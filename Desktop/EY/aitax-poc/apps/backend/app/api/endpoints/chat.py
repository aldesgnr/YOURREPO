from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.auth import get_current_active_user
from app.core.database import get_session
from app.models.chat import ChatMessage, ChatMessageCreate, ChatMessageRead, MessageRole
from app.models.document import Document
from app.models.user import User
from app.services.ai import generate_document_answer

router = APIRouter()


@router.get("/document/{document_id}", response_model=List[ChatMessageRead])
async def get_chat_history(
    document_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Get chat history for a specific document"""
    # Check if document exists and belongs to user
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document"
        )
    
    # Get chat messages
    messages = db.exec(
        select(ChatMessage)
        .where(ChatMessage.document_id == document_id)
        .order_by(ChatMessage.created_at)
    ).all()
    
    return messages


@router.post("/document/{document_id}", response_model=ChatMessageRead)
async def ask_question(
    document_id: int,
    message: ChatMessageCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Ask a question about a document and get an AI-generated answer"""
    # Check if document exists and belongs to user
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document"
        )
    
    # Validate message
    if message.role != MessageRole.USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only user messages can be sent"
        )
    
    # Save user message
    user_message = ChatMessage(
        content=message.content,
        role=MessageRole.USER,
        document_id=document_id,
        user_id=current_user.id
    )
    
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Generate AI answer
    answer = await generate_document_answer(document, message.content)
    
    # Save AI response
    ai_message = ChatMessage(
        content=answer,
        role=MessageRole.ASSISTANT,
        document_id=document_id,
        user_id=current_user.id
    )
    
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    return ai_message
