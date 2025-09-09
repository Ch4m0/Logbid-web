"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSupabaseClient } from '@/src/utils/supabase/client'

interface RejectOfferArgs {
  offer_id: number
}

const rejectOfferWithSupabase = async ({ offer_id }: RejectOfferArgs) => {
  const supabase = createSupabaseClient()

  // Actualizar el status de la oferta a 'rejected'
  const { data: updatedOffer, error: offerError } = await supabase
    .from('offers')
    .update({ 
      status: 'rejected'
    })
    .eq('id', offer_id)
    .select()
    .single()

  if (offerError) {
    throw new Error(`Error updating offer: ${offerError.message}`)
  }

  console.log('✅ Oferta rechazada exitosamente:', updatedOffer)

  return updatedOffer
}

export const useRejectOffer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: rejectOfferWithSupabase,
    onSuccess: (data) => {
      console.log('✅ Offer rejected successfully')
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['offer'] })
      queryClient.invalidateQueries({ queryKey: ['bidList'] })
      queryClient.invalidateQueries({ queryKey: ['shipment'] })
    },
    onError: (error: Error) => {
      console.error('❌ Error rejecting offer:', error)
    },
  })
}
