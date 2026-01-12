// Simple date utilities - display time exactly as entered

/**
 * Format a date exactly as stored
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString()
}

/**
 * Format a time exactly as stored
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Format a datetime exactly as stored
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })}`
}

/**
 * Get current date/time for input fields
 */
export function getCurrentDateTime(): string {
  const now = new Date()

  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convert datetime-local input to ISO string for storage
 */
export function convertToISOString(dateTimeString: string): string {
  return new Date(dateTimeString).toISOString()
}
