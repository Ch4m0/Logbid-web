import { useInfiniteQuery } from '@tanstack/react-query'
import { createSupabaseClient } from '@/src/utils/supabase/client'

export interface MaritimePort {
  id: number
  port_name: string
  name: string
  country: string
  city?: string
  code?: string
  country_code?: string
  port_code?: string
  un_code?: string
}

export const useGetMaritimeList = (searchQuery = '', enabled = true) => {
  const supabase = createSupabaseClient()

  return useInfiniteQuery({
    queryKey: ['maritime_ports', searchQuery],
    queryFn: async ({ pageParam = 0 }): Promise<{ data: MaritimePort[], hasMore: boolean }> => {
      const limit = 50
      const offset = pageParam * limit

      let query = supabase
        .from('maritime_ports')
        .select('id, port_name, country, country_code, port_code, un_code')
        .order('port_name')
        .range(offset, offset + limit - 1)

      // Si hay un filtro de búsqueda, aplicarlo
      if (searchQuery.trim()) {
        query = query.or(
          `port_name.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`
        )
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching maritime ports:', error)
        throw new Error(`Error al obtener puertos marítimos: ${error.message}`)
      }

      // Mapear los datos para que coincidan con la interfaz esperada
      const mappedData = data?.map((port: any) => ({
        id: port.id,
        port_name: port.port_name,
        name: port.port_name,
        country: port.country,
        country_code: port.country_code,
        port_code: port.port_code,
        un_code: port.un_code,
        code: port.port_code,
      })) || []

      return {
        data: mappedData,
        hasMore: data?.length === limit
      }
    },
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { data: MaritimePort[], hasMore: boolean }, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
