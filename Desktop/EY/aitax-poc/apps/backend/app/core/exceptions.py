from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from typing import Any, Dict, Optional, Union

from app.core.config import settings


class AppException(HTTPException):
    """Base application exception class"""
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class DatabaseException(AppException):
    """Database-related exception"""
    def __init__(
        self,
        detail: Any = "Database error occurred",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "DB_ERROR",
    ):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class NotFoundException(AppException):
    """Resource not found exception"""
    def __init__(
        self,
        detail: Any = "Resource not found",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "NOT_FOUND",
    ):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class UnauthorizedException(AppException):
    """Unauthorized access exception"""
    def __init__(
        self,
        detail: Any = "Not authorized",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "UNAUTHORIZED",
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class ForbiddenException(AppException):
    """Forbidden access exception"""
    def __init__(
        self,
        detail: Any = "Access forbidden",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "FORBIDDEN",
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class BadRequestException(AppException):
    """Bad request exception"""
    def __init__(
        self,
        detail: Any = "Bad request",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "BAD_REQUEST",
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class ValidationException(AppException):
    """Validation error exception"""
    def __init__(
        self,
        detail: Any = "Validation error",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "VALIDATION_ERROR",
    ):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handler for application exceptions"""
    content = {"detail": exc.detail}
    if exc.error_code:
        content["error_code"] = exc.error_code
    
    if settings.DEBUG:
        content["path"] = request.url.path
        
    return JSONResponse(
        status_code=exc.status_code,
        content=content,
        headers=exc.headers,
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler for validation exceptions"""
    errors = exc.errors()
    detail = []
    
    for error in errors:
        error_detail = {
            "loc": error.get("loc", []),
            "msg": error.get("msg", ""),
            "type": error.get("type", ""),
        }
        detail.append(error_detail)
    
    content = {
        "detail": detail,
        "error_code": "VALIDATION_ERROR",
    }
    
    if settings.DEBUG:
        content["path"] = request.url.path
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=content,
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handler for SQLAlchemy exceptions"""
    content = {
        "detail": "Database error occurred",
        "error_code": "DB_ERROR",
    }
    
    if settings.DEBUG:
        content["detail"] = str(exc)
        content["path"] = request.url.path
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=content,
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handler for HTTP exceptions"""
    content = {"detail": exc.detail}
    
    if settings.DEBUG:
        content["path"] = request.url.path
    
    return JSONResponse(
        status_code=exc.status_code,
        content=content,
        headers=exc.headers,
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handler for unhandled exceptions"""
    content = {"detail": "Internal server error"}
    
    if settings.DEBUG:
        content["detail"] = str(exc)
        content["path"] = request.url.path
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=content,
    )
