"""
Endpoints de exámenes – gestiona las evaluaciones generadas por IA.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_exams():
    """Retorna todos los exámenes disponibles."""
    return []


@router.post("/")
def create_exam():
    """Crea un nuevo examen generado por IA."""
    # TODO: delegar a ExamService
    return {"message": "Examen creado"}


@router.get("/{exam_id}")
def get_exam(exam_id: int):
    """Retorna un único examen por su ID."""
    return {"id": exam_id}
