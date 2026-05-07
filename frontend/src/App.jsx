/**
 * App.jsx – Navegación por estado entre Auth y Dashboard.
 * EduTest AI
 */

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  // null = no hay sesión, objeto = usuario autenticado
  const [user, setUser] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    // 1. Revisar si ya hay una sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoadingSession(false)
    })

    // 2. Escuchar cambios de estado de autenticación (login, logout, token expirado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Limpiar el listener al desmontar
    return () => subscription.unsubscribe()
  }, [])

  // Llamado por Auth.jsx tras login exitoso
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // Cierra la sesión en Supabase y vuelve a la pantalla de login
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">
        <p className="text-[#00E5FF] font-bold text-xl animate-pulse">Verificando sesión...</p>
      </div>
    )
  }

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Auth onLogin={handleLogin} />
}

export default App
