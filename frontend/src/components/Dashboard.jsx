/**
 * Dashboard.jsx – Pantalla principal tras iniciar sesión.
 * EduTest AI
 */

import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          Edu<span>Test</span> AI
        </div>
        <div className="dashboard-user">
          <span>{user?.email}</span>
          <button className="btn-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <h1>¡Bienvenido de vuelta! </h1>
          <p>Estás en tu panel de control. Aquí podrás subir tus materiales de estudio y generar evaluaciones inteligentes.</p>
        </div>

        {/* Tarjetas de acciones futuras */}
        <div className="dashboard-cards">
          <div className="dash-card">
            <div className="dash-card-icon">📄</div>
            <h3>Subir Material</h3>
            <p>Carga un PDF o documento de estudio para generar preguntas automáticamente.</p>
            <button className="btn btn-primary" disabled>Próximamente</button>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">🧪</div>
            <h3>Mis Evaluaciones</h3>
            <p>Revisa, edita y comparte los cuestionarios que ya has generado.</p>
            <button className="btn btn-primary" disabled>Próximamente</button>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">📊</div>
            <h3>Resultados</h3>
            <p>Analiza el rendimiento de tus estudiantes en cada evaluación.</p>
            <button className="btn btn-primary" disabled>Próximamente</button>
          </div>
        </div>
      </main>
    </div>
  )
}
