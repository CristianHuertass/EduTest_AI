# ROADMAP — EduTest AI

> Mi lista de tareas del proyecto. La actualizo cada vez que termino algo.

---

## Ya hecho

**Fase 1 y 2 — Configurar todo el backend y la base de datos**
- Monorepo inicializado con `/frontend` y `/backend`
- Entorno virtual Python creado, dependencias instaladas
- Tablas creadas en Supabase: `profiles`, `study_materials`, `quizzes`, `questions`
- RLS configurado en Supabase
- Cliente de Supabase conectado al backend (`database.py`)
- Endpoint `/api/test-db` respondiendo 200 OK ✔

**Fase 3 — Módulo de Login funcionando**
- Cliente de Supabase instalado en el frontend
- Pantalla de login con diseño full-screen (gradiente AI)
- Registro e inicio de sesión con Supabase Auth funcionando
- Navegación por estado: login → dashboard → cerrar sesión

---

## Lo que sigue

**Fase 4 — Dashboard y subida de PDFs**
- [ ] Hacer el dashboard de verdad (con contenido real, no solo tarjetas vacías)
- [ ] Implementar la subida de archivos PDF a Supabase Storage
- [ ] Conectar con la API de Gemini para procesar el texto del PDF
- [ ] Generar preguntas automáticamente y guardarlas en la base de datos
- [ ] Mostrar el cuestionario generado al usuario



