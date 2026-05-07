import pytest
from app.services.quiz_service import calculate_grade

@pytest.fixture
def sample_quiz_data():
    return [
        {
            "pregunta": "¿Cuál es la capital de Francia?",
            "respuesta_correcta": "A",
            "justificacion": "París es la capital."
        },
        {
            "pregunta": "¿Cuánto es 2+2?",
            "respuesta_correcta": "B",
            "justificacion": "4 es el resultado."
        },
        {
            "pregunta": "¿Color del cielo despejado?",
            "respuesta_correcta": "C",
            "justificacion": "Es azul por la dispersión."
        }
    ]

def test_calculate_grade_100_percent(sample_quiz_data):
    user_answers = {"0": "A", "1": "B", "2": "C"}
    result = calculate_grade(sample_quiz_data, user_answers)
    
    assert result["correct"] == 3
    assert result["total"] == 3
    assert result["percentage"] == 100
    assert result["detail"][0]["acertada"] is True
    assert result["detail"][1]["acertada"] is True
    assert result["detail"][2]["acertada"] is True

def test_calculate_grade_0_percent(sample_quiz_data):
    user_answers = {"0": "B", "1": "A", "2": "A"}
    result = calculate_grade(sample_quiz_data, user_answers)
    
    assert result["correct"] == 0
    assert result["total"] == 3
    assert result["percentage"] == 0
    assert result["detail"][0]["acertada"] is False

def test_calculate_grade_partial(sample_quiz_data):
    # 1 correcta, 2 incorrectas = 33%
    user_answers = {"0": "A", "1": "C", "2": "A"}
    result = calculate_grade(sample_quiz_data, user_answers)
    
    assert result["correct"] == 1
    assert result["total"] == 3
    assert result["percentage"] == 33
    assert result["detail"][0]["acertada"] is True
    assert result["detail"][1]["acertada"] is False
    assert result["detail"][2]["acertada"] is False

def test_calculate_grade_malformed_input():
    # Debería lanzar ValueError si no hay quiz_data
    with pytest.raises(ValueError):
        calculate_grade([], {"0": "A"})
        
    with pytest.raises(ValueError):
        calculate_grade(None, {"0": "A"})
