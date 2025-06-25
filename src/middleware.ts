import { NextRequest, NextResponse } from "next/server"
import { getUser, updateSession } from "./utils/middleware"
import { getUserProfile } from "./utils/auth"

export async function middleware(request: NextRequest) {
  const protectedRoutesList = ['/history', '/bid_list', '/offers', '/graphics', '/notifications']
  const authRoutesList = ['/auth', '/auth/login']
  const publicRoutesList = ['/']

  const currentPath = new URL(request.url).pathname

  try {
    const { data: { user } } = await getUser(request, NextResponse.next())

    // Si el usuario está intentando acceder a rutas protegidas sin estar autenticado
    if (protectedRoutesList.includes(currentPath) && !user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Si el usuario ya está autenticado e intenta acceder a auth
    if (authRoutesList.includes(currentPath) && user) {
      return NextResponse.redirect(new URL('/graphics', request.url))
    }

    // Para la ruta home, redirigir a auth si no está autenticado
    if (currentPath === '/' && !user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Verificación de roles para rutas específicas
    if (user && (currentPath.includes('(agent)') || currentPath.includes('(importers)'))) {
      const { profile } = await getUserProfile(user.id)
      
      if (profile) {
        // role: 'agent' = agente, 'customer' = importador
        const isAgent = profile.role === 'agent'
            const isCustomer = profile.role === 'customer'
    
    // Si es agente intentando acceder a rutas de customers
    if (isAgent && currentPath.includes('(importers)')) {
      return NextResponse.redirect(new URL('/graphics', request.url))
    }
    
    // Si es customer intentando acceder a rutas de agentes
    if (isCustomer && currentPath.includes('(agent)')) {
          return NextResponse.redirect(new URL('/graphics', request.url))
        }
      }
    }

    // Actualizar la sesión para todas las otras rutas
    return await updateSession(request)
  } catch (error) {
    console.error('Middleware error:', error)
    // En caso de error, permitir el acceso pero actualizar sesión
    return await updateSession(request)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}