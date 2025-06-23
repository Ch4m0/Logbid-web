import { useInfiniteQuery } from '@tanstack/react-query'
import { createSupabaseClient } from '@/src/utils/supabase/client'

export interface Airport {
  id: number
  airport_name: string
  name: string
  country: string
  city?: string
  code?: string
  iata?: string
  icao?: string
}

export const useGetAirportList = (searchQuery = '', enabled = true) => {
  const supabase = createSupabaseClient()

  return useInfiniteQuery({
    queryKey: ['airports', searchQuery],
    queryFn: async ({ pageParam = 0 }): Promise<{ data: Airport[], hasMore: boolean }> => {
      const limit = 50
      const offset = pageParam * limit

      let query = supabase
        .from('airports')
        .select('id, airport_name, country, country_code, airport_code, un_code')
        .order('airport_name')
        .range(offset, offset + limit - 1)

      // Si hay un filtro de búsqueda, aplicarlo
      if (searchQuery.trim()) {
        query = query.or(
          `airport_name.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`
        )
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching airports:', error)
        throw new Error(`Error al obtener aeropuertos: ${error.message}`)
      }

      // Mapear los datos para que coincidan con la interfaz esperada
      const mappedData = data?.map((airport: any) => ({
        id: airport.id,
        airport_name: airport.airport_name,
        name: airport.airport_name,
        country: airport.country,
        code: airport.airport_code,
        iata: airport.airport_code,
        icao: airport.un_code,
      })) || []

      return {
        data: mappedData,
        hasMore: data?.length === limit
      }
    },
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { data: Airport[], hasMore: boolean }, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
