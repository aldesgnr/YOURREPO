from fastapi import APIRouter

from app.api.endpoints import auth, profile, news, documents, chat, notes

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(news.router, prefix="/news", tags=["News"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])
