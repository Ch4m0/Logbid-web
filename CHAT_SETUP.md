# 🤖 Chat Setup - DeepSeek AI Integration

LogBid Chat está ahora integrado con **DeepSeek AI** en lugar de ChatGPT para mejores costos y rendimiento.

## 🔑 Configuración del API Key

### 1. Obtener API Key de DeepSeek

1. Ve a [DeepSeek Platform](https://platform.deepseek.com/)
2. Crea una cuenta o inicia sesión
3. Navega a [API Keys](https://platform.deepseek.com/api_keys)
4. Crea un nuevo API key

### 2. Configurar Variables de Entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```bash
NEXT_PUBLIC_DEEPSEEK_API_KEY=tu_deepseek_api_key_aqui
```

**⚠️ Importante:** 
- Reemplaza `tu_deepseek_api_key_aqui` con tu API key real
- Nunca commits el archivo `.env.local` al repositorio
- El prefijo `NEXT_PUBLIC_` es necesario para que funcione en el cliente

### 3. Reiniciar el servidor de desarrollo

Después de agregar la variable de entorno:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

## 🚀 Beneficios de DeepSeek

- **💰 Costo reducido:** Significativamente más barato que GPT-4
- **⚡ Velocidad:** Respuestas rápidas y eficientes
- **🔄 Compatibilidad:** 100% compatible con OpenAI API
- **🌟 Calidad:** Modelo DeepSeek-V3 de última generación

## 🔧 Configuración Actual

- **Modelo:** `deepseek-chat` (DeepSeek-V3)
- **Base URL:** `https://api.deepseek.com`
- **Temperatura:** 0.7 (balance entre creatividad y consistencia)
- **Max Tokens:** 500 (respuestas concisas)

## 🎯 Características del Chat

- **Personalidad:** Leo, experto en logística de LogBid
- **Especialización:** Logística internacional y freight forwarding
- **Funciones:**
  - Explicar rutas y opciones de envío
  - Aclarar términos logísticos y documentación
  - Proporcionar estimaciones de costos y tiempos
  - Ayudar con regulaciones aduaneras
  - Asistir en el proceso de ofertas

## 🛠️ Desarrollo

Si necesitas modificar la configuración del chat, edita:
- `src/context/ChatContext.tsx` - Configuración principal
- `src/components/ChatBot.tsx` - UI del chat
- `src/types/chat.ts` - Tipos TypeScript

## 🔍 Troubleshooting

### Error: "API key not found"
- Verifica que `NEXT_PUBLIC_DEEPSEEK_API_KEY` esté en `.env.local`
- Reinicia el servidor de desarrollo

### Error: "Network error"
- Verifica tu conexión a internet
- Confirma que el API key sea válido en DeepSeek Platform

### Error: "Rate limit exceeded"
- DeepSeek tiene límites de rate por minuto
- Espera unos momentos antes de reintentar 