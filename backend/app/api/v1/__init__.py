"""
v1 router – registers all domain-specific endpoints.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, exams, users

router = APIRouter()
router.include_router(auth.router,  prefix="/auth",  tags=["Auth"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(exams.router, prefix="/exams", tags=["Exams"])
