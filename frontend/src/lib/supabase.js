/**
 * supabase.js – Cliente de Supabase para EduTest AI (Frontend).
 *
 * Lee las credenciales desde las variables de entorno de Vite (.env.local)
 * e inicializa el cliente oficial. Expórtalo e impórtalo donde lo necesites.
 *
 * Uso:
 *   import { supabase } from '@/lib/supabase'
 *   const { data, error } = await supabase.from('profiles').select('*')
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Faltan las variables de entorno de Supabase. ' +
    'Asegúrate de rellenar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
