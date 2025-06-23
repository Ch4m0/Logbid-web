"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseClient } from "../utils/supabase/server"
import { redirect } from "next/navigation"

export async function login(email: string, password: string) {
    
    try {
        const supabase = await createSupabaseClient()

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError) {
            console.error('❌ Supabase login error:', authError)
            return { data: null, error: authError.message }
        }

        if (!authData.user) {
            console.error('👤 No user in auth response')
            return { data: null, error: 'No se pudo obtener la información del usuario' }
        }

        

        // Combinar datos de auth (sin perfil por ahora, se obtendrá en el cliente)
        const userData = {
            ...authData.user,
            profile: null // Se obtendrá en el cliente
        }

        revalidatePath('/', "layout")
        return { 
            data: { 
                user: userData,
                session: authData.session 
            }, 
            error: null 
        }
    } catch (error) {
        console.error('💥 Unexpected error during login:', error)
        return { data: null, error: 'Error inesperado durante el inicio de sesión' }
    }
}

export async function logout() {
    
    try {
        const supabase = await createSupabaseClient()
        
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('❌ Logout error:', error)
            return { error: error.message }
        }


        revalidatePath('/', "layout")
        return { error: null }
    } catch (error) {
        console.error('💥 Unexpected error during logout:', error)
        return { error: 'Error inesperado al cerrar sesión' }
    }
}