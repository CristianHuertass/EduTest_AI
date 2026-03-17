"""
Pydantic schemas for Exam domain.
"""
from pydantic import BaseModel


class ExamBase(BaseModel):
    title: str
    description: str | None = None
    topic: str


class ExamCreate(ExamBase):
    num_questions: int = 10


class ExamRead(ExamBase):
    id: int

    model_config = {"from_attributes": True}
