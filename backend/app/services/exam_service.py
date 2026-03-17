"""
ExamService – business logic for AI-assisted exam generation.
"""


class ExamService:
    """Encapsulates business logic for exam creation and AI question generation."""

    @staticmethod
    def list_exams():
        """Return all exams from the database."""
        # TODO: inject a DB session and query Exam model
        return []

    @staticmethod
    def get_exam(exam_id: int):
        """Return a single exam by primary key."""
        # TODO: inject a DB session and query Exam model
        return None

    @staticmethod
    def create_exam(title: str, topic: str, num_questions: int = 10):
        """
        Create a new exam and delegate question generation to an AI service.
        """
        # TODO: call an AI provider (e.g. Gemini) to generate questions
        return None
