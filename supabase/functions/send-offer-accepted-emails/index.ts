import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bid_id, offer_id }: { bid_id: string, offer_id: string } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get complete shipment and offer details with language preferences
    const { data: fullData, error: dataError } = await supabaseClient
      .from('shipments')
      .select(`
        *,
        profiles!shipments_profile_id_fkey (
          id,
          email,
          full_name,
          phone,
          company_name,
          language
        ),
        offers!offers_shipment_id_fkey (
          id,
          uuid,
          price,
          details,
          status,
          inserted_at,
          profiles!offers_agent_id_fkey (
            id,
            email,
            full_name,
            phone,
            company_name,
            language
          )
        )
      `)
      .eq('uuid', bid_id)
      .single()

    if (dataError) throw dataError

    // Find the specific offer
    const offer = fullData.offers.find((o: any) => o.uuid === offer_id)
    if (!offer) throw new Error('Offer not found')

    const shipment = fullData
    const importer = shipment.profiles
    const agent = offer.profiles

    // Use user language preferences with fallback to Spanish
    const importerLang = importer.language || 'es'
    const agentLang = agent.language || 'es'

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('RESEND_API_KEY not found')

    // Helper function to format currency
    const formatCurrency = (amount: number | string, lang: string) => {
      return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(amount))
    }

    // Helper function to format date
    const formatDate = (date: string, lang: string) => {
      return new Date(date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Generate simple email HTML
    const generateEmailHTML = (isForImporter: boolean, lang: string) => {
      const isSpanish = lang === 'es'
      const recipientName = isForImporter ? importer.full_name : agent.full_name
      
      const subject = isSpanish 
        ? (isForImporter ? "✅ Oferta Aceptada" : "🎯 Tu Oferta fue Aceptada")
        : (isForImporter ? "✅ Offer Accepted" : "🎯 Your Offer was Accepted")
      
      const greeting = isSpanish ? "Hola" : "Hello"
      const congratsMsg = isSpanish 
        ? (isForImporter ? "Has aceptado exitosamente una oferta" : "Tu oferta ha sido aceptada")
        : (isForImporter ? "You have successfully accepted an offer" : "Your offer has been accepted")
      
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #007bff; text-align: center;">${subject}</h1>
          <p><strong>${greeting} ${recipientName},</strong></p>
          <p>${congratsMsg}</p>
          
          <h3>${isSpanish ? 'Detalles del Shipment' : 'Shipment Details'}:</h3>
          <ul>
            <li><strong>ID:</strong> ${shipment.uuid}</li>
            <li><strong>${isSpanish ? 'Origen' : 'Origin'}:</strong> ${shipment.origin_country} - ${shipment.origin_name}</li>
            <li><strong>${isSpanish ? 'Destino' : 'Destination'}:</strong> ${shipment.destination_country} - ${shipment.destination_name}</li>
            <li><strong>${isSpanish ? 'Precio Aceptado' : 'Accepted Price'}:</strong> ${formatCurrency(offer.price, lang)}</li>
          </ul>
          
          <h3>${isSpanish ? (isForImporter ? 'Agente Logístico' : 'Información del Cliente') : (isForImporter ? 'Logistics Agent' : 'Client Information')}:</h3>
          <ul>
            <li><strong>${isSpanish ? 'Nombre' : 'Name'}:</strong> ${isForImporter ? agent.full_name : importer.full_name}</li>
            <li><strong>Email:</strong> ${isForImporter ? agent.email : importer.email}</li>
            ${(isForImporter ? agent.phone : importer.phone) ? `<li><strong>${isSpanish ? 'Teléfono' : 'Phone'}:</strong> ${isForImporter ? agent.phone : importer.phone}</li>` : ''}
            ${(isForImporter ? agent.company_name : importer.company_name) ? `<li><strong>${isSpanish ? 'Empresa' : 'Company'}:</strong> ${isForImporter ? agent.company_name : importer.company_name}</li>` : ''}
          </ul>
          
          <p style="margin-top: 30px;">
            <strong>${isSpanish ? 'Próximos pasos' : 'Next steps'}:</strong><br>
            ${isSpanish 
              ? (isForImporter 
                ? 'El agente se pondrá en contacto contigo para coordinar los detalles.' 
                : 'Contacta al cliente para coordinar los detalles del envío.')
              : (isForImporter 
                ? 'The agent will contact you to coordinate the details.' 
                : 'Contact the client to coordinate the shipment details.')}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('FRONTEND_URL')}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              ${isSpanish ? 'Ver en Plataforma' : 'View on Platform'}
            </a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 12px;">
            © 2024 LogBid - ${isSpanish ? 'Conectando importadores y agentes logísticos' : 'Connecting importers and logistics agents'}
          </p>
        </div>
      `
    }

    // Email to Importer
    const importerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LogBid <onboarding@resend.dev>',
        to: ['abachadi@gmail.com'], // Temporal para testing
        subject: `Oferta Aceptada - Shipment ${shipment.uuid}`,
        html: generateEmailHTML(true, importerLang),
      }),
    })

    // Email to Agent
    const agentEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LogBid <onboarding@resend.dev>',
        to: ['abachadi@gmail.com'], // Temporal para testing
        subject: `Tu Oferta fue Aceptada - Shipment ${shipment.uuid}`,
        html: generateEmailHTML(false, agentLang),
      }),
    })

    const importerResult = await importerEmailResponse.json()
    const agentResult = await agentEmailResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails sent successfully',
        importer_email: importerResult,
        agent_email: agentResult,
        languages: {
          importer: importerLang,
          agent: agentLang
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 