import { useState } from 'react'

interface WelcomeEmailData {
  email: string
  full_name: string
  role: string
  language: string
  company_name?: string
}

export const useSendWelcomeEmail = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendWelcomeEmail = async (data: WelcomeEmailData) => {
    console.log('🚀 useSendWelcomeEmail: Function called with data:', data)
    setIsLoading(true)
    setError(null)

    try {
      console.log('📧 Sending welcome email to:', data.email)
      
      // Configuración temporal - deberás crear un archivo .env.local con estas variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://upvqodxyneqlrayrkyst.supabase.co'
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdnFvZHh5bmVxbHJheXJreXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1Mjk2MjMsImV4cCI6MjA2MTEwNTYyM30.QalQF3TRPGJzckPG6fKea-1MLeW7NRgtqPKz79RkZ9I'

      const response = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Welcome email failed:', errorText)
        throw new Error(`Failed to send welcome email: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Welcome email sent successfully:', result)
      
      return { success: true, data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('💥 Welcome email error:', errorMessage)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendWelcomeEmail,
    isLoading,
    error
  }
} 