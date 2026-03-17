/**
 * Auth.jsx – Pantalla de acceso full-screen con gradiente AI.
 * EduTest AI
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Registro ──────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      alert(`❌ Error al registrarse: ${error.message}`)
    } else {
      alert('📧 Revisa tu correo para confirmar tu cuenta.')
    }

    setLoading(false)
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(`❌ Error al iniciar sesión: ${error.message}`)
      setLoading(false)
    } else {
      alert(`¡Bienvenido! 👋`)
      onLogin(data.user) // Notifica a App.jsx para navegar al dashboard
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="auth-screen">
      {/* Fondo decorativo */}
      <div className="auth-dots" />

      {/* Título y subtítulo integrados en el fondo */}
      <div className="auth-header">
        <span className="auth-badge">✦ Powered by Gemini AI</span>
        <h1>Edu<span>Test</span> AI</h1>
        <p>Transforma tus documentos de estudio en evaluaciones inteligentes en segundos.</p>
      </div>

      {/* Tarjeta de login centrada */}
      <div className="auth-card">
        <h2>Accede a tu cuenta</h2>
        <p className="auth-desc">Ingresa tus datos para continuar.</p>

        <form>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-buttons">
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>

            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Cargando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
