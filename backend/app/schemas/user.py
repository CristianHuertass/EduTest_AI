"""
Esquemas Pydantic para el dominio User (Usuario).
"""
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    is_active: bool = True

    model_config = {"from_attributes": True}
