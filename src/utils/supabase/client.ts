import { createBrowserClient } from '@supabase/ssr'

// Verificar que las variables de entorno estén definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL no está definida')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida')
}

// Crear el cliente de Supabase
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

// Verificar que el cliente se creó correctamente
if (!supabase) {
  console.error('Error al crear el cliente de Supabase')
}