"""
Endpoints de usuarios – operaciones CRUD para los usuarios de la plataforma.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_users():
    """Retorna una lista paginada de usuarios."""
    return []


@router.get("/{user_id}")
def get_user(user_id: int):
    """Retorna un único usuario por su ID."""
    return {"id": user_id}
