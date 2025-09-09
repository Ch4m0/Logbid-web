import { supabase } from './supabase/client'

// Función para obtener el perfil del usuario desde el cliente
export async function getUserProfileClient(userId: string) {
    try {
        console.log('🔍 Fetching user profile for:', userId)
        
        // Primero obtener los datos básicos del usuario
        const { data: profile, error: profileError } = await supabase
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

        console.log('✅ Profile found:', profile.id)

        // Obtener los markets del usuario
        let userMarkets: any[] = []
        if (profile) {
            console.log('📊 Fetching user markets for profile:', profile.id)
            const { data: marketsData, error: marketsError } = await supabase
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
                console.log('✅ Markets loaded:', userMarkets.length)
            } else {
                console.warn('⚠️ Could not fetch markets:', marketsError)
            }
        }

        // Obtener información de la empresa si tiene company_id
        let companyInfo = null
        if (profile?.company_id) {
            const { data: company, error: companyError } = await supabase
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

        console.log('✅ Enhanced profile prepared with', userMarkets.length, 'markets')
        return { profile: enhancedProfile, error: null }
    } catch (error) {
        console.error('💥 Unexpected error fetching profile:', error)
        return { profile: null, error: 'Error inesperado al obtener el perfil' }
    }
}

// Función para actualizar el perfil del usuario
export async function updateUserProfile(userId: string, updates: any) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
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