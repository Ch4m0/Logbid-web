import { createBrowserClient } from '@supabase/ssr'

// Verificar que las variables de entorno estén definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL no está definida')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida')
}

// Función para crear un cliente de Supabase
export function createSupabaseClient() {
  console.log('🔧 SUPABASE CLIENT: Creando cliente con:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        },
        heartbeatIntervalMs: 30000,
        reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000)
      }
    }
  )

  console.log('✅ SUPABASE CLIENT: Cliente creado exitosamente')
  return client
}

// Crear el cliente de Supabase exportado por defecto
export const supabase = createSupabaseClient()

// Verificar que el cliente se creó correctamente
if (!supabase) {
  console.error('Error al crear el cliente de Supabase')
}