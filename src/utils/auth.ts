import { createSupabaseClient } from './supabase/server'

// Función para obtener el perfil del usuario desde el servidor
export async function getUserProfile(userId: string) {
    try {
      
        
        const supabaseClient = await createSupabaseClient()
        
        // Primero obtener los datos básicos del usuario
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                phone,
                company_name,
                role,
                language,
                company_id,
                created_at,
                updated_at,
                auth_id
            `)
            .eq('auth_id', userId)
            .single()

        if (profileError) {
            console.error('❌ Error fetching user profile:', profileError)
            return { profile: null, error: profileError.message }
        }

        // Obtener los markets del usuario
        let userMarkets: any[] = []
        if (profile) {
            const { data: marketsData, error: marketsError } = await supabaseClient
                .from('user_markets')
                .select(`
                    market_id,
                    markets (
                        id,
                        name,
                        created_at,
                        updated_at
                    )
                `)
                .eq('user_id', profile.id)

            if (!marketsError && marketsData) {
                userMarkets = marketsData.map((um: any) => um.markets).filter(Boolean)
            }
        }

        // Obtener información de la empresa si tiene company_id
        let companyInfo = null
        if (profile?.company_id) {
            const { data: company, error: companyError } = await supabaseClient
                .from('companies')
                .select(`
                    id,
                    name,
                    created_at,
                    updated_at
                `)
                .eq('id', profile.company_id)
                .single()

            if (!companyError && company) {
                companyInfo = company
            }
        }

        // Combinar toda la información
        const enhancedProfile = {
            ...profile,
            all_markets: userMarkets,
            company: companyInfo
        }

    
        return { profile: enhancedProfile, error: null }
    } catch (error) {
        console.error('💥 Unexpected error fetching profile:', error)
        return { profile: null, error: 'Error inesperado al obtener el perfil' }
    }
}

// Función para actualizar el perfil del usuario desde el servidor
export async function updateUserProfile(userId: string, updates: any) {
    try {
      
        
        const supabaseClient = await createSupabaseClient()
        
        const { data: profile, error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('auth_id', userId)
            .select()
            .single()

        if (error) {
            console.error('❌ Error updating user profile:', error)
            return { profile: null, error: error.message }
        }

    
        return { profile, error: null }
    } catch (error) {
        console.error('💥 Unexpected error updating profile:', error)
        return { profile: null, error: 'Error inesperado al actualizar el perfil' }
    }
}

 