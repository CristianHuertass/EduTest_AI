# EduTest AI — Monorepo

> **EduTest AI** es una plataforma inteligente de evaluación que utiliza IA generativa para crear, administrar y evaluar exámenes educativos.

---

## 📂 Estructura del Proyecto

```
edutest-ai/
├── frontend/          # SPA con React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── index.css  # Directivas de Tailwind
│   │   └── App.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── backend/           # API REST con FastAPI
    ├── app/
    │   ├── main.py            # Punto de entrada de la aplicación
    │   ├── api/               # Capa HTTP (routers)
    │   │   └── v1/
    │   │       └── endpoints/ # auth.py · users.py · exams.py
    │   ├── services/          # Lógica de negocio
    │   │   ├── user_service.py
    │   │   └── exam_service.py
    │   ├── schemas/           # Modelos Pydantic de petición/respuesta
    │   │   ├── user.py
    │   │   └── exam.py
    │   ├── models/            # Modelos ORM de SQLAlchemy
    │   │   ├── user.py
    │   │   └── exam.py
    │   └── core/              # Configuración y utilidades de seguridad
    │       ├── config.py
    │       └── security.py
    ├── requirements.txt
    └── .env.example
```

---

## 🚀 Primeros Pasos

### Requisitos Previos

| Herramienta | Versión |
|-------------|---------|
| Node.js | ≥ 18 |
| Python | ≥ 3.11 |
| pip | última versión |

---

### 1 · Frontend (React + Vite + Tailwind CSS)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo (http://localhost:5173)
npm run dev
```

Para compilar en producción:

```bash
npm run build
```

---

### 2 · Backend (FastAPI)

```bash
cd backend

# Crear y activar un entorno virtual
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Instalar dependencias de Python
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env   # Windows

# Iniciar el servidor de desarrollo (http://localhost:8000)
uvicorn app.main:app --reload
```

La documentación interactiva de la API está disponible en:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🏗️ Arquitectura

```
Navegador → React SPA (Vite, puerto 5173)
               │
               │ HTTP / REST (JSON)
               ▼
         Aplicación FastAPI (Uvicorn, puerto 8000)
               │
     ┌─────────┴──────────┐
     │  Routers (/api/v1) │
     └─────────┬──────────┘
               │
     ┌─────────┴──────────┐
     │      Servicios      │  ← lógica de negocio, llamadas a IA
     └─────────┬──────────┘
               │
     ┌─────────┴──────────┐
     │  Modelos SQLAlchemy │  ← acceso a base de datos
     └────────────────────┘
```

---

## 🛣️ Hoja de Ruta

- [ ] Implementar el flujo de autenticación con JWT
- [ ] Conectar a una base de datos relacional (PostgreSQL recomendado para producción)
- [ ] Integrar un proveedor de IA (p. ej. Google Gemini) para la generación de preguntas
- [ ] Añadir migraciones de base de datos con Alembic
- [ ] Dockerizar ambos servicios con `docker-compose`

---

## 📄 Licencia

MIT © Contribuidores de EduTest AI
