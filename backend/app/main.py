"""
main.py – Punto de entrada de la API de EduTest AI.

Inicializa la aplicación FastAPI, configura el middleware CORS,
expone los endpoints existentes y añade el endpoint de generación
de cuestionarios con IA (Historia de Usuario 04 - Tareas 1 y 2).
"""

import io
import json
import os
import urllib.request

from google import genai
import pypdf
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# 1. CONFIGURACIÓN BASE
# ---------------------------------------------------------------------------

# Carga las variables de entorno desde .env (solo en desarrollo local)
load_dotenv()

# Obtiene la API Key de Gemini y lanza un error explícito si no existe
GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError(
        "La variable de entorno GEMINI_API_KEY no está configurada. "
        "Por favor, agrégala al archivo .env del backend."
    )

# Inicializa el cliente del nuevo SDK google-genai
client = genai.Client(api_key=GEMINI_API_KEY)

# Nombre del modelo a utilizar
GEMINI_MODEL = "gemini-2.5-flash"

# ---------------------------------------------------------------------------
# Inicialización de la aplicación FastAPI
# ---------------------------------------------------------------------------
app = FastAPI(
    title="EduTest AI API",
    description="Backend API para la plataforma EduTest AI.",
    version="0.2.0",
)

# CORS: permite todos los orígenes para no bloquear el frontend en React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 2. MODELOS DE DATOS
# ---------------------------------------------------------------------------


class QuizRequest(BaseModel):
    """Cuerpo esperado en el endpoint POST /api/generate-quiz."""

    file_url: str  # URL pública del PDF que se usará para generar el quiz
    material_id: str
    title: str
    quiz_type: str
    user_id: str


class QuizAttemptRequest(BaseModel):
    """Cuerpo esperado en el endpoint POST /api/save-attempt."""
    user_id: str
    quiz_id: str
    quiz_data: list[dict]
    user_answers: dict



# ---------------------------------------------------------------------------
# 3. ENDPOINTS
# ---------------------------------------------------------------------------


@app.get("/", tags=["Health"])
def root():
    """Endpoint raíz para confirmar que la API está en línea."""
    return {"message": "EduTest AI API está en línea "}


@app.get("/api/test-db", tags=["Diagnostics"])
def test_db():
    """
    Verifica la conexión con Supabase realizando una consulta simple.

    Devuelve el primer registro de la tabla 'profiles' si la conexión
    es exitosa, o un error 500 si algo falla.
    """
    from app.core.database import supabase

    try:
        response = supabase.table("profiles").select("*").limit(1).execute()
        return {"status": "success", "data": response.data}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error al conectar con la base de datos: {str(exc)}",
        )


@app.post("/api/generate-quiz", tags=["Quiz"])
def generate_quiz(request: QuizRequest):
    """
    Genera un cuestionario de 5 preguntas a partir de un PDF público.

    Flujo:
        A) Descarga el PDF desde `file_url` a memoria RAM.
        B) Extrae el texto con PyPDF2.
        C) Envía el texto a Gemini con un prompt estricto.
        D) Parsea y devuelve el JSON generado por la IA.
    """

    # ------------------------------------------------------------------
    # Paso A – Descarga del PDF a memoria (BytesIO)
    # ------------------------------------------------------------------
    try:
        req = urllib.request.Request(
            request.file_url,
            headers={"User-Agent": "Mozilla/5.0 (EduTest AI Bot)"},
        )
        with urllib.request.urlopen(req) as response:
            pdf_bytes = io.BytesIO(response.read())
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo descargar el PDF desde la URL proporcionada: {exc}",
        )

    # ------------------------------------------------------------------
    # Paso B – Extracción de texto con pypdf
    # ------------------------------------------------------------------
    try:
        reader = pypdf.PdfReader(pdf_bytes)
        extracted_text = ""
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Error al leer el PDF: {exc}",
        )

    # Valida que el PDF contenga texto extraíble (no escaneado/imagen)
    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "No se pudo extraer texto del PDF. "
                "Es posible que el archivo sea un PDF escaneado o basado en imágenes."
            ),
        )

    # ------------------------------------------------------------------
    # Paso C – Construcción del prompt y llamada a Gemini
    # ------------------------------------------------------------------

    # Limita el texto a los primeros 15 000 caracteres para no exceder el contexto
    truncated_text = extracted_text[:15_000]

    prompt = f"""Eres un profesor experto en evaluación educativa.
A partir del siguiente texto académico, genera EXACTAMENTE 5 preguntas de selección múltiple.

Reglas estrictas que DEBES cumplir:
1. Cada pregunta debe tener exactamente 4 opciones de respuesta (A, B, C, D).
2. Exactamente 1 opción debe ser la respuesta correcta.
3. Las preguntas deben estar basadas únicamente en el texto proporcionado.
4. Devuelve ÚNICAMENTE un array de objetos JSON válido. NO incluyas texto adicional, ni explicaciones, ni formato markdown (sin bloques ```json).
5. PROHIBIDO usar comas al final de los objetos o listas (No trailing commas).

La estructura de CADA objeto dentro del array JSON debe tener EXACTAMENTE estas llaves en español:
- "pregunta": string con el enunciado de la pregunta.
- "opciones": object con las llaves "A", "B", "C" y "D", cada una con el texto de la opción.
- "respuesta_correcta": string con la letra de la respuesta correcta ("A", "B", "C" o "D").
- "justificacion": string con una breve explicación de por qué esa es la respuesta correcta.

Texto académico:
\"\"\"
{truncated_text}
\"\"\"

Responde SOLO con el JSON, nada más."""
    try:
        ai_response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        raw_text: str = ai_response.text
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Error al comunicarse con la API de Gemini: {exc}",
        )

    # ------------------------------------------------------------------
    # Paso D – Limpieza y parseo del JSON devuelto por la IA
    # ------------------------------------------------------------------

    # Elimina posibles bloques de código markdown que Gemini pueda incluir
    cleaned_text = (
        raw_text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:
        quiz_data: list[dict] = json.loads(cleaned_text)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"La IA no devolvió un JSON válido. Error de parseo: {exc}. "
                f"Respuesta recibida: {cleaned_text[:300]}"
            ),
        )

    # ------------------------------------------------------------------
    # Paso E - Guardar el quiz en Supabase
    # ------------------------------------------------------------------
    from app.core.database import supabase
    try:
        db_response = supabase.table("quizzes").insert({
            "material_id": request.material_id,
            "user_id": request.user_id,
            "title": request.title,
            "quiz_type": request.quiz_type
        }).execute()
        
        quiz_id = db_response.data[0]["id"] if db_response.data else None
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar el quiz en la base de datos: {exc}",
        )

    # Retorna la respuesta exitosa
    return {"success": True, "quiz_id": quiz_id, "data": quiz_data}


from fastapi import Header

@app.post("/api/save-attempt", tags=["Quiz"])
def save_attempt(request: QuizAttemptRequest, authorization: str | None = Header(default=None)):
    """Guarda la nota de un intento de cuestionario."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado o inválido")

    from app.services.quiz_service import calculate_grade
    from app.core.database import supabase
    
    try:
        # Calcular la calificación en el backend por seguridad
        score_data = calculate_grade(request.quiz_data, request.user_answers)
        
        db_response = supabase.table("quiz_attempts").insert({
            "user_id": request.user_id,
            "quiz_id": request.quiz_id,
            "score": score_data["correct"],
            "answers": score_data
        }).execute()
        return {"success": True, "data": db_response.data, "score_result": score_data}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar el intento: {exc}",
        )


@app.get("/api/quizzes/{user_id}", tags=["Quiz"])
def get_user_quizzes(user_id: str):
    """Devuelve la lista de cuestionarios de un usuario ordenados por el más reciente."""
    from app.core.database import supabase
    try:
        response = (
            supabase.table("quizzes")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return {"success": True, "data": response.data}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los cuestionarios: {exc}",
        )


@app.get("/api/quiz_attempt/{quiz_id}", tags=["Quiz"])
def get_quiz_attempt(quiz_id: str):
    """Devuelve el intento más reciente de un cuestionario."""
    from app.core.database import supabase
    try:
        response = (
            supabase.table("quiz_attempts")
            .select("*")
            .eq("quiz_id", quiz_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        data = response.data[0] if response.data else None
        return {"success": True, "data": data}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener el intento: {exc}",
        )
