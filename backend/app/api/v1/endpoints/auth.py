"""
Endpoints de autenticación – inicio de sesión y renovación de token.
"""
from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
def login():
    """Autentica a un usuario y retorna un token de acceso JWT."""
    # TODO: implementar la lógica de autenticación
    return {"access_token": "placeholder", "token_type": "bearer"}
