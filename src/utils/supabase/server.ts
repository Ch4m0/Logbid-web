import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseClient() {
    console.log('🔧 Creating Supabase server client...')
    console.log('🌐 SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const cookieStore = cookies()

    const client = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    } catch (error) {
                        console.error('🍪 Cookie error:', error)
                    }
                }
            },
            global: {
                fetch: (url, options = {}) => {
                    // En desarrollo, usar configuración más permisiva para SSL
                    if (process.env.NODE_ENV === 'development') {
                        return fetch(url, {
                            ...options,
                            // Agregar headers para manejar SSL en desarrollo
                            headers: {
                                ...options.headers,
                                'User-Agent': 'Supabase-JS-Client'
                            }
                        })
                    }
                    return fetch(url, options)
                }
            }
        }
    )
    
    console.log('✅ Supabase server client created')
    return client
}