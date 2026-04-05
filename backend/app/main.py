"""
main.py – Punto de entrada de la API de EduTest AI.

Inicializa la aplicación FastAPI, configura el middleware CORS,
expone los endpoints existentes y añade el endpoint de generación
de cuestionarios con IA (Historia de Usuario 04 – Tareas 1 y 2).
"""

import io
import json
import os
import urllib.request

from google import genai
import PyPDF2
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


# ---------------------------------------------------------------------------
# 3. ENDPOINTS
# ---------------------------------------------------------------------------


@app.get("/", tags=["Health"])
def root():
    """Endpoint raíz para confirmar que la API está en línea."""
    return {"message": "EduTest AI API está en línea ✅"}


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
    # Paso B – Extracción de texto con PyPDF2
    # ------------------------------------------------------------------
    try:
        reader = PyPDF2.PdfReader(pdf_bytes)
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
4. Devuelve ÚNICAMENTE un JSON válido, sin texto adicional, sin explicaciones y sin formato markdown (sin bloques ```json```).

La estructura del JSON debe ser un array de objetos con las siguientes llaves:
- "question": string con el enunciado de la pregunta.
- "options": object con las llaves "A", "B", "C" y "D", cada una con el texto de la opción.
- "correct_answer": string con la letra de la respuesta correcta ("A", "B", "C" o "D").

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

    # Retorna la respuesta exitosa
    return {"success": True, "data": quiz_data}
