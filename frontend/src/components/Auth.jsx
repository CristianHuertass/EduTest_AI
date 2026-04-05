/**
 * Auth.jsx – Pantalla de acceso. Dark Mode con acento cian.
 * EduTest AI
 *
 * Modo único controlado por `isLogin`:
 *   true  → Inicio de Sesión  (signInWithPassword)
 *   false → Registro          (signUp)
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  // ── Función unificada de autenticación ────────────────────────────────────
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert(` Error al iniciar sesión: ${error.message}`)
        setLoading(false)
      } else {
        alert('¡Bienvenido! ')
        onLogin(data.user)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('user already registered')) {
          alert(' Este correo ya está registrado. Por favor inicia sesión en su lugar.')
          setIsLogin(true)
        } else {
          alert(` Error al registrarse: ${error.message}`)
        }
      } else if (data?.user?.identities?.length === 0) {
        alert(' Este correo ya está registrado. Por favor inicia sesión en su lugar.')
        setIsLogin(true)
      } else {
        alert('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.')
      }
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="auth-bg min-h-screen w-full flex flex-col items-center justify-center px-4 font-sans">

      {/* Brillo central decorativo */}
      <div className="auth-glow" />

      {/* ── Encabezado sobre el fondo ─────────────────────────── */}
      <div className="text-center mb-8 relative z-10">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#00E5FF]/70 border border-[#00E5FF]/30 rounded-full px-3 py-1 mb-5">
          ✦ Powered by Gemini AI
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Edu<span className="text-[#00E5FF]">Test</span> AI
        </h1>
        <p className="mt-3 text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          Transforma tus documentos de estudio en evaluaciones inteligentes en segundos.
        </p>
      </div>

      {/* ── Tarjeta del formulario ────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm bg-[#111111] rounded-xl p-7 shadow-2xl">

        {/* Título y descripción dinámicos */}
        <h2 className="text-white font-bold text-xl mb-1">
          {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isLogin ? 'Ingresa tus datos para continuar.' : 'Regístrate gratis y empieza a estudiar mejor.'}
        </p>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">

          {/* Campo: Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
            />
          </div>

          {/* Campo: Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
            />
          </div>

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-2.5 rounded-lg bg-[#00E5FF] text-black font-bold text-sm hover:bg-cyan-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>

          {/* Botón para cambiar de modo */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="text-gray-500 text-xs text-center hover:text-[#00E5FF] transition-colors disabled:opacity-40"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>

        </form>
      </div>
    </div>
  )
}
