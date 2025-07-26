import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

interface ExtendExpirationDateParams {
  bidListItemId: string
  newExpirationDate: string
  newShippingDate: string
}

const extendExpirationDateSupabase = async ({ 
  bidListItemId, 
  newExpirationDate,
  newShippingDate
}: ExtendExpirationDateParams) => {
  console.log('🔄 Extending expiration date:', { bidListItemId, newExpirationDate })
  
  // Usar función de BD que maneja todo internamente (actualización + notificaciones)
  const { data, error } = await supabase
    .rpc('extend_shipment_deadline_and_notify', {
      shipment_id_param: parseInt(bidListItemId),
      new_expiration_date_param: newExpirationDate,
      new_shipping_date_param: newShippingDate
    })

  if (error) {
    console.error('❌ Error extending expiration date:', error)
    throw new Error(`Error al extender fecha: ${error.message}`)
  }

  if (!data?.success) {
    console.error('❌ Function returned error:', data?.error)
    throw new Error(`Error al extender fecha: ${data?.error || 'Unknown error'}`)
  }

  console.log('✅ Expiration date extended successfully:', data)
  console.log(`📤 Notified ${data.agents_notified} agents in market "${data.market_name}"`)

  return data
}

export const useExtendExpirationDate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: extendExpirationDateSupabase,
    onSuccess: (data) => {
      console.log('✅ Extend expiration date success:', data)
      // Invalidar todas las queries que empiecen con 'shipments'
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'shipments'
      })
      return data
    },
    onError: (error) => {
      console.error('❌ Extend expiration date error:', error)
      throw error
    },
  })
}
