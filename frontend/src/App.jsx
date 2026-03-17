/**
 * App.jsx – Navegación por estado entre Auth y Dashboard.
 * EduTest AI
 */

import { useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  // null = no hay sesión, objeto = usuario autenticado
  const [user, setUser] = useState(null)

  // Llamado por Auth.jsx tras login exitoso
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // Cierra la sesión en Supabase y vuelve a la pantalla de login
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Auth onLogin={handleLogin} />
}

export default App
