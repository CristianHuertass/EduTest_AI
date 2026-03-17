"""
Users endpoints – CRUD operations for platform users.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_users():
    """Return a paginated list of users."""
    return []


@router.get("/{user_id}")
def get_user(user_id: int):
    """Return a single user by ID."""
    return {"id": user_id}
