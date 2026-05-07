import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_supabase():
    with patch("app.core.database.supabase") as mock_db:
        # Configurar el mock para db_response.data
        mock_table = MagicMock()
        mock_insert = MagicMock()
        mock_execute = MagicMock()
        
        mock_db.table.return_value = mock_table
        mock_table.insert.return_value = mock_insert
        mock_execute.return_value.data = [{"id": "mocked_id"}]
        mock_insert.execute = mock_execute
        
        yield mock_db

def test_save_attempt_success(mock_supabase):
    payload = {
        "user_id": "user_123",
        "quiz_id": "quiz_456",
        "quiz_data": [
            {
                "pregunta": "Q1",
                "respuesta_correcta": "A",
                "justificacion": "J1"
            }
        ],
        "user_answers": {"0": "A"}
    }
    
    headers = {"Authorization": "Bearer fake_token"}
    
    response = client.post("/api/save-attempt", json=payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "score_result" in data
    assert data["score_result"]["percentage"] == 100

def test_save_attempt_no_token():
    payload = {
        "user_id": "user_123",
        "quiz_id": "quiz_456",
        "quiz_data": [{"pregunta": "Q1", "respuesta_correcta": "A", "justificacion": "J1"}],
        "user_answers": {"0": "A"}
    }
    
    # Sin headers de autorización
    response = client.post("/api/save-attempt", json=payload)
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Token no proporcionado o inválido"
