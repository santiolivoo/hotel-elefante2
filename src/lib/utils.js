import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

export function formatDate(date) {
  // Corregir problema de timezone para fechas
  if (!date) return ''
  
  let year, month, day
  
  if (typeof date === 'string') {
    // Si es string, extraer la parte de fecha (YYYY-MM-DD)
    const dateOnly = date.split('T')[0]
    const parts = dateOnly.split('-')
    year = parseInt(parts[0])
    month = parseInt(parts[1])
    day = parseInt(parts[2])
  } else {
    // Si es Date object, usar getUTCFullYear, getUTCMonth, getUTCDate
    // para extraer la fecha sin conversión de timezone
    year = date.getUTCFullYear()
    month = date.getUTCMonth() + 1
    day = date.getUTCDate()
  }
  
  // Construir fecha en zona local para formatear
  const localDate = new Date(year, month - 1, day)
  
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(localDate)
}

export function formatDateTime(date) {
  // formatDateTime siempre usa el timestamp completo (con hora)
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function calculateDays(checkIn, checkOut) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function generateReservationCode() {
  return 'HE' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase()
}
