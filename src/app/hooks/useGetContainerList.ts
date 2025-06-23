import { useQuery } from '@tanstack/react-query'
import { createSupabaseClient } from '@/src/utils/supabase/client'

export interface Container {
  id: number
  name: string
  type?: string
  shipping_type?: string
  dimensions?: any
}

export const useGetListContainer = (shipping_type: string) => {
  const supabase = createSupabaseClient()

  return useQuery({
    queryKey: ['list-container', shipping_type],
    queryFn: async (): Promise<Container[]> => {
      let query = supabase
        .from('containers')
        .select('id, name, type, shipping_type, dimensions')
        .order('name')

      // Filtrar por tipo de envío si se proporciona
      if (shipping_type) {
        query = query.eq('shipping_type', shipping_type)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching containers:', error)
        throw new Error(`Error al obtener contenedores: ${error.message}`)
      }

      // Organizar contenedores por tamaño
      const organizeContainers = (containers: Container[]) => {
        return containers.sort((a, b) => {
          // Extraer los números de los nombres (20, 40, etc.)
          const sizeA = parseInt(a.name.match(/\d+/)?.[0] || '0')
          const sizeB = parseInt(b.name.match(/\d+/)?.[0] || '0')

          // Si los tamaños son diferentes, ordenar por tamaño
          if (sizeA !== sizeB) {
            return sizeA - sizeB
          }

          // Si los tamaños son iguales, ordenar alfabéticamente
          return a.name.localeCompare(b.name)
        })
      }

      return organizeContainers(data || [])
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (los contenedores cambian muy poco)
  })
}
