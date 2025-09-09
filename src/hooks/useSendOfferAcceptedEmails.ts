import { useMutation } from '@tanstack/react-query'
import { createSupabaseClient } from '../utils/supabase/client'

interface SendEmailParams {
  bid_id: string
  offer_id: string
}

interface EmailResponse {
  success: boolean
  message: string
  importer_email: any
  agent_email: any
}

export const useSendOfferAcceptedEmails = () => {
  const supabase = createSupabaseClient()

  return useMutation<EmailResponse, Error, SendEmailParams>({
    mutationFn: async ({ bid_id, offer_id }) => {
      const { data, error } = await supabase.functions.invoke('send-offer-accepted-emails', {
        body: {
          bid_id,
          offer_id
        }
      })

      if (error) {
        throw new Error(error.message || 'Error sending emails')
      }

      return data
    },
    onSuccess: (data) => {
      console.log('✅ Emails sent successfully:', data)
    },
    onError: (error) => {
      console.error('❌ Error sending emails:', error)
    }
  })
} 