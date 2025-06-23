'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import useAuthStore from '@/src/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'

// Hook específico para componentes que manejan paginación
export const useRealtimeShipmentsWithPagination = () => {
  const profile = useAuthStore((state) => state.profile)
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!profile?.id) return


    // Crear canal de Supabase Realtime
    const channel = supabase
      .channel('shipments-with-pagination')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shipments'
        },
        (payload) => {
          
          const currentPage = Number(searchParams.get('page')) || 1
          
          // Si no estamos en la página 1, navegar a la página 1
          if (currentPage !== 1) {
            const newParams = new URLSearchParams(searchParams.toString())
            newParams.set('page', '1')
            router.push(`?${newParams.toString()}`)
          }
          
          // Invalidar queries para que se refresquen automáticamente
          queryClient.invalidateQueries({ queryKey: ['shipments'] })
          queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
          queryClient.invalidateQueries({ queryKey: ['bidList'] })
          
        }
      )
      .subscribe((status) => {
      })

    // Cleanup al desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, queryClient, router, searchParams])

  return null // Este hook no retorna nada, solo maneja side effects
} 