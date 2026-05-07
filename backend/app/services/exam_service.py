"""
ExamService – lógica de negocio para la generación de exámenes asistida por IA.
"""


class ExamService:
    """Encapsula la lógica de negocio para la creación de exámenes y generación de preguntas con IA."""

    @staticmethod
    def list_exams():
        """Retorna todos los exámenes desde la base de datos."""
        # TODO: inyectar una sesión de BD y consultar el modelo Exam
        return []

    @staticmethod
    def get_exam(exam_id: int):
        """Retorna un único examen por su clave primaria."""
        # TODO: inyectar una sesión de BD y consultar el modelo Exam
        return None

    @staticmethod
    def create_exam(title: str, topic: str, num_questions: int = 10):
        """
        Crea un nuevo examen y delega la generación de preguntas a un servicio de IA.
        """
        # TODO: llamar a un proveedor de IA (e.g. Gemini) para generar las preguntas
        return None
