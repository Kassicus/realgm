/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as currency in millions
 */
export function formatMillions(amount: number): string {
  const millions = amount / 1000000;
  return `$${millions.toFixed(1)}M`;
}

/**
 * Format a player's full name
 */
export function formatPlayerName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Format a rating with color coding
 */
export function getRatingColor(rating: number): string {
  if (rating >= 90) return '#4caf50'; // Green - Superstar
  if (rating >= 85) return '#8bc34a'; // Light green - Pro Bowl
  if (rating >= 77) return '#ffc107'; // Yellow - Above average
  if (rating >= 70) return '#ff9800'; // Orange - Average
  if (rating >= 60) return '#ff5722'; // Deep orange - Below average
  return '#f44336'; // Red - Poor
}

/**
 * Format contract years remaining
 */
export function formatYearsRemaining(years: number): string {
  if (years === 1) return '1 year';
  return `${years} years`;
}
