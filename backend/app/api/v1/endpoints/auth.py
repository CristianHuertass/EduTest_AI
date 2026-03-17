"""
Auth endpoints – login and token refresh.
"""
from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
def login():
    """Authenticate a user and return a JWT access token."""
    # TODO: implement authentication logic
    return {"access_token": "placeholder", "token_type": "bearer"}
