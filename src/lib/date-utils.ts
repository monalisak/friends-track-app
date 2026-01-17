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
 * Format a datetime exactly as stored - display the time as entered by user
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date)

  // Use local time methods to display the time exactly as the user entered it
  // This shows the time in the user's local timezone interpretation
  const year = d.getFullYear()
  const month = d.getMonth()
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = d.getMinutes()

  // Format as DD/MM/YYYY • HH:MM
  const dateStr = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  return `${dateStr} • ${timeStr}`
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
 * datetime-local inputs should be treated as local time
 */
export function convertToISOString(dateTimeString: string): string {
  // Ensure the string has seconds
  if (dateTimeString.length === 16) { // YYYY-MM-DDTHH:MM format
    dateTimeString += ':00'
  }

  // Parse as local time and store as UTC
  // This preserves the exact time the user selected
  const localDate = new Date(dateTimeString)
  return localDate.toISOString()
}

/**
 * Convert date input to ISO string (for date-only inputs)
 */
export function convertDateToISOString(dateString: string): string {
  // Create date at midnight local time
  return new Date(dateString + 'T00:00:00').toISOString()
}
