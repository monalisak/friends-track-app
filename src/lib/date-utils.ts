// Date utilities for GMT+8 timezone handling

/**
 * Format a date in GMT+8 timezone
 */
export function formatDateInGMT8(date: Date | string): string {
  const d = new Date(date)

  // Convert to GMT+8
  const gmt8Time = new Date(d.getTime() + (8 * 60 * 60 * 1000))

  return gmt8Time.toLocaleDateString()
}

/**
 * Format a time in GMT+8 timezone
 */
export function formatTimeInGMT8(date: Date | string): string {
  const d = new Date(date)

  // Convert to GMT+8
  const gmt8Time = new Date(d.getTime() + (8 * 60 * 60 * 1000))

  return gmt8Time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Format a datetime in GMT+8 timezone
 */
export function formatDateTimeInGMT8(date: Date | string): string {
  const d = new Date(date)

  // Convert to GMT+8
  const gmt8Time = new Date(d.getTime() + (8 * 60 * 60 * 1000))

  return `${gmt8Time.toLocaleDateString()} • ${gmt8Time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })} (GMT+8)`
}

/**
 * Get current date/time in GMT+8 as ISO string for input fields
 */
export function getCurrentDateTimeInGMT8(): string {
  const now = new Date()
  const gmt8Time = new Date(now.getTime() + (8 * 60 * 60 * 1000))

  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  const year = gmt8Time.getFullYear()
  const month = String(gmt8Time.getMonth() + 1).padStart(2, '0')
  const day = String(gmt8Time.getDate()).padStart(2, '0')
  const hours = String(gmt8Time.getHours()).padStart(2, '0')
  const minutes = String(gmt8Time.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convert a datetime-local input value to GMT+8 for storage
 */
export function convertToGMT8ISOString(dateTimeString: string): string {
  // Parse the input as if it's in GMT+8
  const localDate = new Date(dateTimeString)
  // Since the input is interpreted as local time, we need to adjust it to be GMT+8
  const gmt8Date = new Date(localDate.getTime() - (8 * 60 * 60 * 1000))
  return gmt8Date.toISOString()
}
