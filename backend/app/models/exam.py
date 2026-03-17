"""
SQLAlchemy ORM model for Exam.
"""
from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.user import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    topic = Column(String, nullable=False)
    num_questions = Column(Integer, default=10)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    creator = relationship("User", backref="exams")
