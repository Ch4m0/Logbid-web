import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  bid_id: number
  offer_id: number
  importer_email: string
  agent_email: string
  shipment_details: any
  offer_details: any
}

// Translations object
const translations = {
  es: {
    // Email subjects
    importerSubject: "✅ Oferta Aceptada - Shipment",
    agentSubject: "🎯 Tu Oferta fue Aceptada - Shipment",
    
    // Headers
    offerAccepted: "¡Oferta Aceptada!",
    congratulations: "¡Felicitaciones!",
    importerTagline: "Tu shipment ha encontrado su agente logístico",
    agentTagline: "Tu oferta ha sido aceptada",
    
    // Greetings
    helloImporter: "Hola",
    helloAgent: "Hola",
    estimatedClient: "Estimado Cliente",
    estimatedAgent: "Estimado Agente",
    
    // Main content
    importerMainText: "¡Excelentes noticias! Has aceptado exitosamente una oferta para tu shipment. A continuación encontrarás todos los detalles de la transacción:",
    agentMainText: "¡Excelentes noticias! Tu oferta ha sido aceptada por el importador/exportador. Has ganado este shipment y ahora eres responsable de gestionar toda la logística. A continuación tienes todos los detalles:",
    
    // Section titles
    shipmentDetails: "Detalles del Shipment",
    winningOffer: "Oferta Ganadora",
    yourWinningOffer: "Tu Oferta Ganadora",
    logisticAgent: "Tu Agente Logístico",
    clientInfo: "Información del Cliente",
    
    // Fields
    shipmentId: "ID del Shipment",
    shippingType: "Tipo de Envío",
    commerceType: "Tipo de Comercio",
    transport: "Transporte",
    cargoValue: "Valor de Carga",
    status: "Estado",
    expirationDate: "Fecha de Expiración",
    created: "Creado",
    origin: "Origen",
    destination: "Destino",
    additionalInfo: "Información Adicional",
    totalPrice: "Precio Total",
    winningPrice: "Precio Ganador",
    offerDate: "Fecha de Oferta",
    accepted: "ACEPTADA",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    company: "Empresa",
    
    // Offer breakdown
    freightRates: "Tarifas de Flete",
    originCharges: "Cargos de Origen",
    destinationCharges: "Cargos de Destino",
    otherCharges: "Otros Cargos",
    basicService: "Servicio Básico",
    container: "Contenedor",
    freightValue: "Valor del Flete",
    freeDays: "Días Libres",
    validity: "Validez",
    cancellationFee: "Tarifa de Cancelación",
    days: "días",
    
    // Buttons
    viewCompleteDetails: "Ver Detalles Completos en la Plataforma",
    viewShipmentPlatform: "Ver Shipment en la Plataforma",
    
    // Next steps
    nextSteps: "Próximos Pasos",
    importantNextSteps: "Próximos Pasos Importantes",
    importerSteps: [
      "El agente se pondrá en contacto contigo para coordinar los detalles del envío",
      "Revisa y confirma las fechas de recogida y entrega",
      "Prepara la documentación necesaria para el envío",
      "Mantén comunicación constante con tu agente durante el proceso"
    ],
    agentSteps: [
      "Contacta inmediatamente al cliente para coordinar detalles del envío",
      "Confirma fechas de recogida y entrega según tu oferta",
      "Prepara toda la documentación necesaria para el proceso logístico",
      "Mantén comunicación constante durante todo el proceso de envío",
      "Cumple con los términos especificados en tu oferta ganadora"
    ],
    
    // Important notice
    importantReminder: "Recordatorio Importante",
    agentReminder: "Como agente ganador, ahora eres responsable de gestionar todo el proceso logístico según los términos de tu oferta. El éxito de este envío depende de tu profesionalismo y cumplimiento de los compromisos adquiridos.",
    
    // Footer
    rightsReserved: "Todos los derechos reservados",
    tagline: "Conectando importadores/exportadores y agentes logísticos",
    
    // Misc
    notSpecified: "No especificado"
  },
  en: {
    // Email subjects
    importerSubject: "✅ Offer Accepted - Shipment",
    agentSubject: "🎯 Your Offer was Accepted - Shipment",
    
    // Headers
    offerAccepted: "Offer Accepted!",
    congratulations: "Congratulations!",
    importerTagline: "Your shipment has found its logistics agent",
    agentTagline: "Your offer has been accepted",
    
    // Greetings
    helloImporter: "Hello",
    helloAgent: "Hello",
    estimatedClient: "Dear Client",
    estimatedAgent: "Dear Agent",
    
    // Main content
    importerMainText: "Excellent news! You have successfully accepted an offer for your shipment. Below you will find all the transaction details:",
    agentMainText: "Excellent news! Your offer has been accepted by the importer/exporter. You have won this shipment and are now responsible for managing all the logistics. Below you have all the details:",
    
    // Section titles
    shipmentDetails: "Shipment Details",
    winningOffer: "Winning Offer",
    yourWinningOffer: "Your Winning Offer",
    logisticAgent: "Your Logistics Agent",
    clientInfo: "Client Information",
    
    // Fields
    shipmentId: "Shipment ID",
    shippingType: "Shipping Type",
    commerceType: "Commerce Type",
    transport: "Transport",
    cargoValue: "Cargo Value",
    status: "Status",
    expirationDate: "Expiration Date",
    created: "Created",
    origin: "Origin",
    destination: "Destination",
    additionalInfo: "Additional Information",
    totalPrice: "Total Price",
    winningPrice: "Winning Price",
    offerDate: "Offer Date",
    accepted: "ACCEPTED",
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    
    // Offer breakdown
    freightRates: "Freight Rates",
    originCharges: "Origin Charges",
    destinationCharges: "Destination Charges",
    otherCharges: "Other Charges",
    basicService: "Basic Service",
    container: "Container",
    freightValue: "Freight Value",
    freeDays: "Free Days",
    validity: "Validity",
    cancellationFee: "Cancellation Fee",
    days: "days",
    
    // Buttons
    viewCompleteDetails: "View Complete Details on Platform",
    viewShipmentPlatform: "View Shipment on Platform",
    
    // Next steps
    nextSteps: "Next Steps",
    importantNextSteps: "Important Next Steps",
    importerSteps: [
      "The agent will contact you to coordinate shipment details",
      "Review and confirm pickup and delivery dates",
      "Prepare necessary documentation for shipping",
      "Maintain constant communication with your agent during the process"
    ],
    agentSteps: [
      "Immediately contact the client to coordinate shipment details",
      "Confirm pickup and delivery dates according to your offer",
      "Prepare all necessary documentation for the logistics process",
      "Maintain constant communication throughout the shipping process",
      "Comply with the terms specified in your winning offer"
    ],
    
    // Important notice
    importantReminder: "Important Reminder",
    agentReminder: "As the winning agent, you are now responsible for managing the entire logistics process according to the terms of your offer. The success of this shipment depends on your professionalism and compliance with the commitments made.",
    
    // Footer
    rightsReserved: "All rights reserved",
    tagline: "Connecting importers/exporters and logistics agents",
    
    // Misc
    notSpecified: "Not specified"
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bid_id, offer_id }: { bid_id: number, offer_id: number } = await req.json()

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
      .eq('id', bid_id)
      .single()

    if (dataError) throw dataError

    // Find the specific offer
    const offer = fullData.offers.find((o: any) => o.id === offer_id)
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

    // Generate offer breakdown HTML
    const generateOfferBreakdown = (details: any, lang: string) => {
      const t = translations[lang as keyof typeof translations]
      let html = ''
      
      if (details.freight_fees) {
        html += `
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #007bff;">
            <h4 style="color: #007bff; margin-top: 0; margin-bottom: 15px;">🚢 ${t.freightRates}</h4>
        `
        if (details.freight_fees.container) {
          html += `<p><strong>${t.container}:</strong> ${details.freight_fees.container}</p>`
        }
        if (details.freight_fees.value) {
          html += `<p><strong>${t.freightValue}:</strong> ${formatCurrency(details.freight_fees.value, lang)}</p>`
        }
        html += `</div>`
      }

      if (details.origin_fees) {
        html += `
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #28a745;">
            <h4 style="color: #28a745; margin-top: 0; margin-bottom: 15px;">🏁 ${t.originCharges}</h4>
        `
        Object.entries(details.origin_fees).forEach(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          html += `<p><strong>${label}:</strong> ${formatCurrency(Number(value), lang)}</p>`
        })
        html += `</div>`
      }

      if (details.destination_fees) {
        html += `
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0; margin-bottom: 15px;">🎯 ${t.destinationCharges}</h4>
        `
        Object.entries(details.destination_fees).forEach(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          const formattedValue = String(value).includes('%') ? String(value) : formatCurrency(Number(value), lang)
          html += `<p><strong>${label}:</strong> ${formattedValue}</p>`
        })
        html += `</div>`
      }

      if (details.other_fees) {
        html += `
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #6f42c1;">
            <h4 style="color: #6f42c1; margin-top: 0; margin-bottom: 15px;">📋 ${t.otherCharges}</h4>
        `
        Object.entries(details.other_fees).forEach(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          html += `<p><strong>${label}:</strong> ${formatCurrency(Number(value), lang)}</p>`
        })
        html += `</div>`
      }

      if (details.basic_service) {
        html += `
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #17a2b8;">
            <h4 style="color: #17a2b8; margin-top: 0; margin-bottom: 15px;">⚙️ ${t.basicService}</h4>
        `
        if (details.basic_service.free_days) {
          html += `<p><strong>${t.freeDays}:</strong> ${details.basic_service.free_days} ${t.days}</p>`
        }
        if (details.basic_service.validity) {
          html += `<p><strong>${t.validity}:</strong> ${details.basic_service.validity.time} ${details.basic_service.validity.unit}</p>`
        }
        if (details.basic_service.cancellation_fee) {
          html += `<p><strong>${t.cancellationFee}:</strong> ${formatCurrency(details.basic_service.cancellation_fee, lang)}</p>`
        }
        html += `</div>`
      }

      return html
    }

    // Generate email HTML
    const generateEmailHTML = (isForImporter: boolean, lang: string) => {
      const t = translations[lang as keyof typeof translations]
      const recipient = isForImporter ? importer : agent
      const recipientName = recipient.full_name || (isForImporter ? t.estimatedClient : t.estimatedAgent)
      
      return `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${isForImporter ? '#28a745 0%, #20c997 100%' : '#007bff 0%, #6610f2 100%'}); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">${isForImporter ? '🎉' : '🎯'} ${isForImporter ? t.offerAccepted : t.congratulations}</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${isForImporter ? t.importerTagline : t.agentTagline}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px; background: white; margin: 0;">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">${isForImporter ? t.helloImporter : t.helloAgent} ${recipientName},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
              ${isForImporter ? t.importerMainText : t.agentMainText}
            </p>
            
            ${isForImporter ? `
            <!-- Shipment Details -->
            <div style="background: #e8f5e8; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 6px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0; margin-bottom: 20px; font-size: 20px;">📦 ${t.shipmentDetails}</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p style="margin: 8px 0;"><strong>${t.shipmentId}:</strong> ${shipment.uuid}</p>
                  <p style="margin: 8px 0;"><strong>${t.shippingType}:</strong> ${shipment.shipping_type}</p>
                  <p style="margin: 8px 0;"><strong>${t.commerceType}:</strong> ${shipment.comex_type || t.notSpecified}</p>
                  <p style="margin: 8px 0;"><strong>${t.transport}:</strong> ${shipment.transportation || t.notSpecified}</p>
                </div>
                <div>
                  <p style="margin: 8px 0;"><strong>${t.cargoValue}:</strong> ${formatCurrency(shipment.value, lang)} ${shipment.currency}</p>
                  <p style="margin: 8px 0;"><strong>${t.status}:</strong> <span style="color: #28a745; font-weight: bold;">${shipment.status}</span></p>
                  <p style="margin: 8px 0;"><strong>${t.expirationDate}:</strong> ${formatDate(shipment.expiration_date, lang)}</p>
                  <p style="margin: 8px 0;"><strong>${t.created}:</strong> ${formatDate(shipment.inserted_at, lang)}</p>
                </div>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #c3e6cb;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  <div>
                    <h4 style="color: #28a745; margin-bottom: 10px;">🌍 ${t.origin}</h4>
                    <p style="margin: 5px 0; font-weight: bold;">${shipment.origin_name}</p>
                    <p style="margin: 5px 0; color: #666;">${shipment.origin_country}</p>
                  </div>
                  <div>
                    <h4 style="color: #28a745; margin-bottom: 10px;">🎯 ${t.destination}</h4>
                    <p style="margin: 5px 0; font-weight: bold;">${shipment.destination_name}</p>
                    <p style="margin: 5px 0; color: #666;">${shipment.destination_country}</p>
                  </div>
                </div>
              </div>
              
              ${shipment.additional_info ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #c3e6cb;">
                  <h4 style="color: #28a745; margin-bottom: 10px;">📝 ${t.additionalInfo}</h4>
                  <p style="margin: 0; font-style: italic; color: #666;">${shipment.additional_info}</p>
                </div>
              ` : ''}
            </div>
            
            <!-- Winning Offer -->
            <div style="background: #e3f2fd; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 6px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0; margin-bottom: 20px; font-size: 20px;">🏆 ${t.winningOffer}</h3>
              <div style="text-align: center; background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: #1976d2; margin: 0; font-size: 24px;">${t.totalPrice}</h4>
                <p style="margin: 10px 0; font-size: 36px; font-weight: bold; color: #28a745;">${formatCurrency(offer.price, lang)}</p>
                <p style="margin: 0; color: #666; font-size: 14px;">${t.offerDate}: ${formatDate(offer.inserted_at, lang)}</p>
              </div>
              
              ${generateOfferBreakdown(offer.details, lang)}
            </div>
            
            <!-- Agent Information -->
            <div style="background: #f3e5f5; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 6px solid #9c27b0;">
              <h3 style="color: #7b1fa2; margin-top: 0; margin-bottom: 20px; font-size: 20px;">👤 ${t.logisticAgent}</h3>
              <div style="background: white; border-radius: 8px; padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>
                    <p style="margin: 8px 0;"><strong>${t.name}:</strong> ${agent.full_name}</p>
                    <p style="margin: 8px 0;"><strong>${t.email}:</strong> <a href="mailto:${agent.email}" style="color: #7b1fa2;">${agent.email}</a></p>
                  </div>
                  <div>
                    ${agent.phone ? `<p style="margin: 8px 0;"><strong>${t.phone}:</strong> ${agent.phone}</p>` : ''}
                    ${agent.company_name ? `<p style="margin: 8px 0;"><strong>${t.company}:</strong> ${agent.company_name}</p>` : ''}
                  </div>
                </div>
              </div>
            </div>
            ` : `
            <!-- Winning Offer Summary -->
            <div style="background: #e8f5e8; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 6px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0; margin-bottom: 20px; font-size: 20px;">🏆 ${t.yourWinningOffer}</h3>
              <div style="text-align: center; background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: #28a745; margin: 0; font-size: 24px;">${t.winningPrice}</h4>
                <p style="margin: 10px 0; font-size: 36px; font-weight: bold; color: #007bff;">${formatCurrency(offer.price, lang)}</p>
                <p style="margin: 0; color: #666; font-size: 14px;">${t.offerDate}: ${formatDate(offer.inserted_at, lang)}</p>
                <p style="margin: 5px 0 0 0; color: #28a745; font-weight: bold;">${t.status}: ✅ ${t.accepted}</p>
              </div>
              
              ${generateOfferBreakdown(offer.details, lang)}
            </div>
            
            <!-- Shipment Details -->
            <div style="background: #e3f2fd; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 6px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0; margin-bottom: 20px; font-size: 20px;">📦 ${t.shipmentDetails}</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                  <p style="margin: 8px 0;"><strong>${t.shipmentId}:</strong> ${shipment.uuid}</p>
                  <p style="margin: 8px 0;"><strong>${t.shippingType}:</strong> ${shipment.shipping_type}</p>
                  <p style="margin: 8px 0;"><strong>${t.commerceType}:</strong> ${shipment.comex_type || t.notSpecified}</p>
                  <p style="margin: 8px 0;"><strong>${t.transport}:</strong> ${shipment.transportation || t.notSpecified}</p>
                </div>
                <div>
                  <p style="margin: 8px 0;"><strong>${t.cargoValue}:</strong> ${formatCurrency(shipment.value, lang)} ${shipment.currency}</p>
                  <p style="margin: 8px 0;"><strong>${t.status}:</strong> <span style="color: #ff6b35; font-weight: bold;">${shipment.status}</span></p>
                  <p style="margin: 8px 0;"><strong>${t.expirationDate}:</strong> ${formatDate(shipment.expiration_date, lang)}</p>
                  <p style="margin: 8px 0;"><strong>${t.created}:</strong> ${formatDate(shipment.inserted_at, lang)}</p>
                </div>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #bbdefb;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  <div>
                    <h4 style="color: #1976d2; margin-bottom: 10px;">🌍 ${t.origin}</h4>
                    <p style="margin: 5px 0; font-weight: bold;">${shipment.origin_name}</p>
                    <p style="margin: 5px 0; color: #666;">${shipment.origin_country}</p>
                  </div>
                  <div>
                    <h4 style="color: #1976d2; margin-bottom: 10px;">🎯 ${t.destination}</h4>
                    <p style="margin: 5px 0; font-weight: bold;">${shipment.destination_name}</p>
                    <p style="margin: 5px 0; color: #666;">${shipment.destination_country}</p>
                  </div>
                </div>
              </div>
              
              ${shipment.additional_info ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #bbdefb;">
                  <h4 style="color: #1976d2; margin-bottom: 10px;">📝 ${t.additionalInfo}</h4>
                  <p style="margin: 0; font-style: italic; color: #666;">${shipment.additional_info}</p>
                </div>
              ` : ''}
            </div>
            
            <!-- Client Information -->
            <div style="background: #fce4ec; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 6px solid #e91e63;">
              <h3 style="color: #c2185b; margin-top: 0; margin-bottom: 20px; font-size: 20px;">👤 ${t.clientInfo}</h3>
              <div style="background: white; border-radius: 8px; padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>
                    <p style="margin: 8px 0;"><strong>${t.name}:</strong> ${importer.full_name}</p>
                    <p style="margin: 8px 0;"><strong>${t.email}:</strong> <a href="mailto:${importer.email}" style="color: #c2185b;">${importer.email}</a></p>
                  </div>
                  <div>
                    ${importer.phone ? `<p style="margin: 8px 0;"><strong>${t.phone}:</strong> ${importer.phone}</p>` : ''}
                    ${importer.company_name ? `<p style="margin: 8px 0;"><strong>${t.company}:</strong> ${importer.company_name}</p>` : ''}
                  </div>
                </div>
              </div>
            </div>
            `}
            
            <!-- Action Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${Deno.env.get('FRONTEND_URL')}${isForImporter ? '/confirmation-bid' : '/offers?offer_id=' + shipment.uuid}" 
                 style="background: ${isForImporter ? '#28a745' : '#007bff'}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                ${isForImporter ? t.viewCompleteDetails : t.viewShipmentPlatform}
              </a>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #856404; margin-top: 0; margin-bottom: 15px;">📋 ${isForImporter ? t.nextSteps : t.importantNextSteps}:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.6;">
                ${(isForImporter ? t.importerSteps : t.agentSteps).map(step => `<li>${step}</li>`).join('')}
              </ul>
            </div>
            
            ${!isForImporter ? `
            <!-- Important Notice -->
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0c5460; margin-top: 0; margin-bottom: 15px;">⚠️ ${t.importantReminder}:</h4>
              <p style="color: #0c5460; margin: 0; line-height: 1.6;">
                ${t.agentReminder}
              </p>
            </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div style="background: #333; color: white; padding: 25px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 LogBid. ${t.rightsReserved}.</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">${t.tagline}</p>
          </div>
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
        subject: `${translations[importerLang as keyof typeof translations].importerSubject} ${shipment.uuid}`,
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
        subject: `${translations[agentLang as keyof typeof translations].agentSubject} ${shipment.uuid}`,
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