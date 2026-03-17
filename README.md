# EduTest AI 🧠

Este es mi proyecto final de gestion de conocimiento. La idea surgió de un problema real que tenemos todos: los PDFs de estudio son interminables y aburridísimos de repasar antes de un examen.

## ¿De qué trata?

Básicamente es una app donde subes un documento (un PDF de apuntes, un capítulo de libro, lo que sea) y la IA te genera un cuestionario automáticamente a partir de ese contenido. .

La parte de IA la maneja **Gemini 1.5 Flash** (API de Google). El resto es un stack bastante estándar.

## Tecnologías utilizadas

- **React + Vite** — el frontend, lo que ve el usuario
- **FastAPI (Python)** — el backend, donde vive la lógica y la conexión con la IA
- **Supabase** — base de datos (PostgreSQL) y autenticación, todo en uno

## Cómo correrlo en local

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Abre http://localhost:5173
```

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
# Crea un .env con tus claves de Supabase (ver .env.example)
uvicorn app.main:app --reload
# Abre http://localhost:8000/docs para ver la API
```

## Estructura del proyecto

```
EduTest_AI/
├── frontend/    # React + Vite + Tailwind
└── backend/     # FastAPI en capas (api, services, schemas, models, core)
```

## Estado actual

El login ya funciona. El siguiente paso es la subida de PDFs y la generación de cuestionarios con IA — la parte más interesante del proyecto.
