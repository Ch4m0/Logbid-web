import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages]
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ]
}

export const traerDeLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
}
export const guardarEnLocalStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.setItem(key, value)
  }
}

export const borrarDeLocalstorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.clear()
  }
}

/**
 * Convierte una fecha en UTC a la hora local de Colombia
 * @param {string} utcDateStr - Fecha en formato UTC (ISO 8601)
 * @return {string} - Fecha en formato 'yyyy-MM-dd HH:mm:ss' en la hora local de Colombia
 */
export function convertToColombiaTime(utcDateStr: string) {
  // Validar que la fecha no esté vacía o sea null/undefined
  if (!utcDateStr || utcDateStr.trim() === '') {
    return 'Fecha no disponible'
  }

  try {
    // Intentar crear una fecha válida
    const date = new Date(utcDateStr)
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    const timeZone = 'America/Bogota'
    const zonedDate = toZonedTime(utcDateStr, timeZone)
    return format(zonedDate, 'yyyy-MM-dd HH:mm:ss')
  } catch (error) {
    console.error('Error converting date to Colombia time:', error)
    return 'Error en fecha'
  }
}

/**
 * Formatea una fecha UTC sin conversión de zona horaria
 * Útil para fechas de cierre/embarque donde queremos mostrar la fecha exacta
 * @param {string} utcDateStr - Fecha en formato UTC (ISO 8601)
 * @return {string} - Fecha en formato 'yyyy-MM-dd HH:mm:ss' sin conversión de zona horaria
 */
export function formatDateUTCAsLocal(utcDateStr: string) {
  // Validar que la fecha no esté vacía o sea null/undefined
  if (!utcDateStr || utcDateStr.trim() === '') {
    return 'Fecha no disponible'
  }

  try {
    // Parsear la fecha UTC manualmente para extraer componentes sin conversión de zona horaria
    const date = new Date(utcDateStr)
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    // Obtener componentes UTC directamente
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('Error formatting UTC date:', error)
    return 'Error en fecha'
  }
}

/**
 * Formatea una fecha de embarque mostrando solo la fecha (sin horas)
 * @param {string} utcDateStr - Fecha en formato UTC (ISO 8601)
 * @return {string} - Fecha en formato 'yyyy-MM-dd' sin conversión de zona horaria
 */
export function formatShippingDate(utcDateStr: string) {
  // Validar que la fecha no esté vacía o sea null/undefined
  if (!utcDateStr || utcDateStr.trim() === '') {
    return 'Fecha no disponible'
  }

  try {
    // Parsear la fecha UTC manualmente para extraer solo la fecha
    const date = new Date(utcDateStr)
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    // Obtener solo los componentes de fecha UTC
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting shipping date:', error)
    return 'Error en fecha'
  }
}

export function formatStatus(status: string, t: any) {
  const statusLabels = {
    Expired: t('common.expired'),
    Cancelled: t('cargoList.cancelled'),
    Closed: t('common.closed'),
    Active: t('common.active'),
    Offering: t('common.offering'),
  }

  return statusLabels[status as keyof typeof statusLabels] || status
}

export function formatPrice(price: number, currency: string) {
  console.log('price', price)
  console.log('currency', currency)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
}


export const formatComexType = (type: string, t: (key: string) => string) => {
  switch(type) {
    case "1": return t('confirmationBid.import')
    case "2": return t('confirmationBid.export')
    default: return t('common.notSpecified')
  }
}
