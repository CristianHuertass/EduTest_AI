"""
Exams endpoints – manage AI-generated assessments.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_exams():
    """Return all available exams."""
    return []


@router.post("/")
def create_exam():
    """Create a new AI-generated exam."""
    # TODO: delegate to ExamService
    return {"message": "Exam created"}


@router.get("/{exam_id}")
def get_exam(exam_id: int):
    """Return a single exam by ID."""
    return {"id": exam_id}
