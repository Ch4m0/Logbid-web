import { useQuery } from '@tanstack/react-query'
import { createSupabaseClient } from '@/src/utils/supabase/client'

export interface Incoterm {
  id: number
  name: string
  english_name: string
}

export const useGetIncotermList = () => {
  const supabase = createSupabaseClient()

  return useQuery({
    queryKey: ['incoterms'],
    queryFn: async (): Promise<Incoterm[]> => {
      const { data, error } = await supabase
        .from('incoterms')
        .select('id, name, english_name')
        .order('english_name')

      if (error) {
        console.error('Error fetching incoterms:', error)
        throw new Error(`Error al obtener incoterms: ${error.message}`)
      }

      return data || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (los incoterms cambian muy poco)
  })
}
