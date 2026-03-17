"""
main.py – Punto de entrada de la API de EduTest AI.

Inicializa la aplicación FastAPI, configura el middleware CORS
y expone los endpoints principales, incluyendo una ruta de
diagnóstico para verificar la conexión con Supabase.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Carga las variables de entorno desde .env (solo en desarrollo)
load_dotenv()

# ---------------------------------------------------------------------------
# Configuración CORS
# ---------------------------------------------------------------------------
# Lee ALLOWED_ORIGINS desde .env. El valor esperado es una lista de strings
# serializada como JSON, por ejemplo: ["http://localhost:5173"]
# Si la variable no existe, usa el origen del frontend de desarrollo por defecto.

_raw_origins = os.getenv("ALLOWED_ORIGINS", '["http://localhost:5173"]')

# Limpieza robusta: acepta tanto formato JSON como strings separados por coma
try:
    import json
    allowed_origins: list[str] = json.loads(_raw_origins)
except (json.JSONDecodeError, TypeError):
    # Fallback: trata el valor como string separado por comas
    allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# ---------------------------------------------------------------------------
# Inicialización de la aplicación
# ---------------------------------------------------------------------------
app = FastAPI(
    title="EduTest AI API",
    description="Backend API para la plataforma de evaluaciones educativas EduTest AI.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Endpoints
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
