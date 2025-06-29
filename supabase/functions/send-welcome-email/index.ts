import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WelcomeEmailData {
  email: string
  full_name: string
  role: string
  language: string
  company_name?: string
}

// Translations object
const translations = {
  es: {
    subject: "🚀 ¡Bienvenido a LogBid! Tu cuenta ha sido activada",
    welcome: "¡Bienvenido a LogBid!",
    greeting: "Hola",
    mainMessage: "¡Nos complace darte la bienvenida a LogBid, la plataforma líder que conecta importadores/exportadores con agentes logísticos especializados!",
    accountCreated: "Tu cuenta ha sido creada exitosamente y ya puedes comenzar a aprovechar todos los beneficios de nuestra plataforma.",
    roleSpecific: {
      customer: {
        title: "Como Importador/Exportador, podrás:",
        benefits: [
          "🚢 Publicar tus shipments y recibir ofertas competitivas",
          "🌐 Acceder a una red global de agentes logísticos verificados",
          "📊 Comparar precios y servicios de múltiples proveedores",
          "📱 Gestionar todos tus envíos desde un panel centralizado",
          "💬 Comunicarte directamente con agentes especializados",
          "📈 Acceder a analytics y reportes detallados de tus operaciones"
        ]
      },
      agent: {
        title: "Como Agente Logístico, podrás:",
        benefits: [
          "🎯 Acceder a oportunidades de negocio en tiempo real",
          "💼 Ampliar tu cartera de clientes internacionales",
          "📈 Aumentar tus ingresos con shipments rentables",
          "🏆 Competir de manera justa y transparente",
          "📊 Analizar el mercado y optimizar tus ofertas",
          "🤝 Construir relaciones comerciales duraderas"
        ]
      }
    },
    nextSteps: "Próximos Pasos",
    steps: [
      "Completa tu perfil empresarial en la plataforma",
      "Explora las funcionalidades disponibles en tu dashboard",
      "Configura tus preferencias de notificaciones",
      "Únete a nuestra comunidad y comienza a hacer negocios"
    ],
    support: "¿Necesitas ayuda?",
    supportText: "Nuestro equipo de soporte está disponible para ayudarte en cada paso. No dudes en contactarnos si tienes alguna pregunta.",
    platformButton: "Acceder a la Plataforma",
    supportButton: "Contactar Soporte",
    platformUrl: "https://logbid.com/auth",
    supportEmail: "soporte@logbid.com",
    footer: {
      company: "LogBid",
      tagline: "Conectando el mundo logístico",
      rights: "Todos los derechos reservados",
      address: "LogBid Inc. | Plataforma Global de Logística"
    }
  },
  en: {
    subject: "🚀 Welcome to LogBid! Your account has been activated",
    welcome: "Welcome to LogBid!",
    greeting: "Hello",
    mainMessage: "We're pleased to welcome you to LogBid, the leading platform that connects importers/exporters with specialized logistics agents!",
    accountCreated: "Your account has been successfully created and you can now start taking advantage of all the benefits of our platform.",
    roleSpecific: {
      customer: {
        title: "As an Importer/Exporter, you'll be able to:",
        benefits: [
          "🚢 Post your shipments and receive competitive offers",
          "🌐 Access a global network of verified logistics agents",
          "📊 Compare prices and services from multiple providers",
          "📱 Manage all your shipments from a centralized panel",
          "💬 Communicate directly with specialized agents",
          "📈 Access detailed analytics and reports of your operations"
        ]
      },
      agent: {
        title: "As a Logistics Agent, you'll be able to:",
        benefits: [
          "🎯 Access real-time business opportunities",
          "💼 Expand your international client portfolio",
          "📈 Increase your revenue with profitable shipments",
          "🏆 Compete fairly and transparently",
          "📊 Analyze the market and optimize your offers",
          "🤝 Build lasting business relationships"
        ]
      }
    },
    nextSteps: "Next Steps",
    steps: [
      "Complete your business profile on the platform",
      "Explore the features available in your dashboard",
      "Configure your notification preferences",
      "Join our community and start doing business"
    ],
    support: "Need help?",
    supportText: "Our support team is available to help you every step of the way. Don't hesitate to contact us if you have any questions.",
    platformButton: "Access Platform",
    supportButton: "Contact Support",
    platformUrl: "https://logbid.com/auth",
    supportEmail: "support@logbid.com",
    footer: {
      company: "LogBid",
      tagline: "Connecting the logistics world",
      rights: "All rights reserved",
      address: "LogBid Inc. | Global Logistics Platform"
    }
  }
}

const generateWelcomeEmailHTML = (data: WelcomeEmailData) => {
  const lang = data.language || 'es'
  const t = translations[lang as keyof typeof translations] || translations.es
  const roleKey = data.role === 'customer' ? 'customer' : 'agent'
  const roleData = t.roleSpecific[roleKey as keyof typeof t.roleSpecific]

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .header {
            background: linear-gradient(135deg, ${data.role === 'customer' ? '#4f46e5 0%, #7c3aed 100%' : '#059669 0%, #0d9488 100%'});
            padding: 40px 30px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.1; }
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        .header-subtitle {
            font-size: 18px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 40px 30px;
            color: #374151;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .main-message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #4b5563;
        }
        .role-section {
            background: ${data.role === 'customer' ? 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)' : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)'};
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid ${data.role === 'customer' ? '#8b5cf6' : '#10b981'};
        }
        .role-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .benefits-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .benefits-list li {
            padding: 8px 0;
            font-size: 15px;
            color: #374151;
            position: relative;
            padding-left: 5px;
        }
        .next-steps {
            background: #f9fafb;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #e5e7eb;
        }
        .steps-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .steps-list {
            list-style: none;
            padding: 0;
            margin: 0;
            counter-reset: step-counter;
        }
        .steps-list li {
            counter-increment: step-counter;
            padding: 12px 0;
            font-size: 15px;
            color: #374151;
            position: relative;
            padding-left: 40px;
        }
        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 12px;
            background: ${data.role === 'customer' ? '#8b5cf6' : '#10b981'};
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        .support-section {
            background: #fefce8;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #fef3c7;
        }
        .support-title {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 15px;
        }
        .support-text {
            color: #78350f;
            margin-bottom: 20px;
        }
        .buttons {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .button-primary {
            background: ${data.role === 'customer' ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
            color: white;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        .button-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 2px solid #d1d5db;
        }
        .footer {
            background: #1f2937;
            color: #9ca3af;
            text-align: center;
            padding: 30px;
        }
        .footer-company {
            font-size: 20px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }
        .footer-tagline {
            font-size: 14px;
            margin-bottom: 20px;
            color: #d1d5db;
        }
        .footer-text {
            font-size: 12px;
            line-height: 1.5;
        }
        .company-badge {
            display: inline-block;
            background: rgba(255,255,255,0.1);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 LogBid</div>
            <div class="header-subtitle">${t.welcome}</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                ${t.greeting} ${data.full_name}! 👋
            </div>
            
            <div class="main-message">
                ${t.mainMessage}
            </div>
            
            <div class="main-message">
                ${t.accountCreated}
            </div>
            
            <div class="role-section">
                <div class="role-title">
                    ${roleData.title}
                </div>
                <ul class="benefits-list">
                    ${roleData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
            
            <div class="next-steps">
                <div class="steps-title">
                    ${t.nextSteps}
                </div>
                <ol class="steps-list">
                    ${t.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            
            <div class="support-section">
                <div class="support-title">
                    ${t.support}
                </div>
                <div class="support-text">
                    ${t.supportText}
                </div>
            </div>
            
            <div class="buttons">
                <a href="${t.platformUrl}" class="button button-primary">
                    ${t.platformButton}
                </a>
                <a href="mailto:${t.supportEmail}" class="button button-secondary">
                    ${t.supportButton}
                </a>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-company">
                ${t.footer.company}
            </div>
            <div class="footer-tagline">
                ${t.footer.tagline}
            </div>
            <div class="company-badge">
                ${data.company_name || t.footer.address}
            </div>
            <div class="footer-text">
                © 2024 ${t.footer.company}. ${t.footer.rights}
            </div>
        </div>
    </div>
</body>
</html>
`
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, full_name, role, language, company_name } = await req.json() as WelcomeEmailData

    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Email and full_name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData: WelcomeEmailData = {
      email,
      full_name,
      role: role || 'customer',
      language: language || 'es',
      company_name
    }

    const lang = emailData.language || 'es'
    const t = translations[lang as keyof typeof translations] || translations.es

    const emailHtml = generateWelcomeEmailHTML(emailData)

    // Intentar enviar al email del usuario primero
    let emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LogBid <onboarding@resend.dev>',
        to: [email], // Enviar al email real del usuario
        subject: t.subject,
        html: emailHtml,
      }),
    })

    // Si falla por dominio no verificado, enviar al email verificado con nota
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.log('Primera tentativa falló, intentando con email verificado:', errorText)
      
      // Si es error de dominio no verificado, intentar con email verificado
      if (errorText.includes('You can only send testing emails')) {
        console.log('Enviando a email verificado con indicación del destinatario real')
        
        emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LogBid <onboarding@resend.dev>',
            to: ['abachadi@gmail.com'], // Email verificado
            subject: `${t.subject} (Destinatario: ${email})`,
            html: `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <strong>📧 NOTA DE DESARROLLO:</strong><br>
                Este email estaba destinado para: <strong>${email}</strong><br>
                Para enviar emails a cualquier destinatario, verifica tu dominio en <a href="https://resend.com/domains">Resend</a>
              </div>
              ${emailHtml}
            `,
          }),
        })
      }
      
      // Si aún falla, mostrar error
      if (!emailResponse.ok) {
        const finalErrorText = await emailResponse.text()
        console.error('Email sending failed definitivamente:', finalErrorText)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send welcome email',
            details: finalErrorText 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    const emailResult = await emailResponse.json()
    console.log('Welcome email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        message: 'Welcome email sent successfully',
        email_id: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in welcome email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 