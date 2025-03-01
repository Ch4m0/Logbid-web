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
  const timeZone = 'America/Bogota'
  const zonedDate = toZonedTime(utcDateStr, timeZone)
  return format(zonedDate, 'yyyy-MM-dd HH:mm:ss')
}
