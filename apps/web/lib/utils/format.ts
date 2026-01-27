/**
 * Format utility functions for data display
 */

/**
 * Format cents as USD currency string
 * @param cents - Amount in cents (e.g., 15000 for $150.00)
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$150.00")
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format date to readable string
 * @param date - Date object or ISO string
 * @param format - Date format (default: 'short')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return new Intl.DateTimeFormat('en-US', options[format]).format(dateObj);
}

/**
 * Format date and time
 * @param date - Date object or ISO string
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Format number with thousands separator
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format distance in miles
 * @param miles - Distance in miles
 * @returns Formatted distance string
 */
export function formatDistance(miles: number): string {
  return `${formatNumber(miles, 1)} mi`;
}

/**
 * Format weight in pounds
 * @param pounds - Weight in pounds
 * @returns Formatted weight string
 */
export function formatWeight(pounds: number): string {
  return `${formatNumber(pounds)} lbs`;
}

/**
 * Format percentage
 * @param value - Decimal value (e.g., 0.25 for 25%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format phone number
 * @param phone - Phone number string (digits only)
 * @returns Formatted phone number (e.g., "(123) 456-7890")
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Format margin percentage with color context
 * @param marginPercentage - Margin percentage (0-100)
 * @returns Object with formatted string and color class
 */
export function formatMarginWithColor(marginPercentage: number): {
  formatted: string;
  colorClass: string;
} {
  const formatted = `${marginPercentage.toFixed(1)}%`;
  
  let colorClass = 'text-red-600 bg-red-50';
  if (marginPercentage >= 30) {
    colorClass = 'text-green-600 bg-green-50';
  } else if (marginPercentage >= 20) {
    colorClass = 'text-blue-600 bg-blue-50';
  } else if (marginPercentage >= 10) {
    colorClass = 'text-yellow-600 bg-yellow-50';
  }

  return { formatted, colorClass };
}
