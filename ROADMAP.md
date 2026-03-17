# Estado del Proyecto: EduTest AI 🧠

## Contexto
Plataforma para subir PDFs de estudio y generar cuestionarios automáticos usando IA.
* **Stack:** React (Vite), FastAPI (Python), Supabase (PostgreSQL + Auth), Gemini 1.5 Flash.
* **Arquitectura:** Monorepo con backend en capas.

## ✅ Lo que ya está hecho (Fase 1 y 2 completadas)
1. **Scaffolding:** Estructura monorepo inicializada (`/frontend` y `/backend`).
2. **Entorno Python:** Entorno virtual (`.venv`) creado y activado. Dependencias base instaladas (`fastapi`, `uvicorn`, `supabase`, `python-dotenv`, `pydantic`).
3. **Base de Datos (Supabase):** * Tablas creadas: `profiles`, `study_materials`, `quizzes`, `questions`.
   * Row Level Security (RLS) configurado.
4. **Conexión Backend-DB:** * Variables de entorno configuradas en `/backend/.env`.
   * Cliente Supabase inicializado en `/backend/app/core/database.py`.
   * Endpoint de prueba (`GET /api/test-db`) retorna código `200 OK` exitosamente.

## 🚀 Próximo Paso (Fase 3: Autenticación)
* **Objetivo inmediato:** Conectar el frontend (React) con Supabase para manejar el inicio de sesión.
* **Acción pendiente:** Instalar `@supabase/supabase-js` en el frontend, configurar el `.env.local` y crear el archivo cliente `supabase.js`.

## ✅ Lo que ya está hecho (Fase 1, 2 y 3 completadas)
1. **Scaffolding:** Monorepo (`/frontend` y `/backend`).
2. **Backend & DB:** FastAPI conectado a Supabase PostgreSQL.
3. **Módulo de Autenticación (Frontend):** * Interfaz UI/UX moderna (Split Screen) en React.
   * Conexión con Supabase Auth (`@supabase/supabase-js`).
   * Flujo de Registro con confirmación de correo y Login funcional.

## 🚀 Próximo Paso (Fase 4: El Dashboard y Carga de PDFs)
* **Objetivo inmediato:** Crear una ruta protegida `/dashboard` a la que solo puedan entrar los usuarios logueados.
* **Acción pendiente:** Construir el componente para arrastrar y soltar (Drag & Drop) los PDFs de estudio y conectarlo con el backend para extraer el texto.