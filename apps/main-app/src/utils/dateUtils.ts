/**
 * Timezone-agnostic date utilities for band availability functionality
 */

/**
 * Parse a date string (YYYY-MM-DD) to a Date object in local timezone without timezone shifting
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JavaScript
}

/**
 * Format a Date object to YYYY-MM-DD string without timezone conversion
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
export function getTodayString(): string {
  return formatDateToString(new Date());
}

/**
 * Check if two dates represent the same day (ignoring time)
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return formatDateToString(date1) === formatDateToString(date2);
}

/**
 * Compare two date strings (YYYY-MM-DD format) chronologically
 */
export function compareDateStrings(dateStr1: string, dateStr2: string): number {
  return dateStr1.localeCompare(dateStr2);
}

/**
 * Check if a date string is today or in the future
 */
export function isDateFutureOrToday(dateString: string): boolean {
  return compareDateStrings(dateString, getTodayString()) >= 0;
}

/**
 * Create a Date object for "today" at start of day (00:00:00)
 */
export function getTodayAtStartOfDay(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Check if a date is in the past (before today)
 */
export function isDateInPast(date: Date): boolean {
  const today = getTodayAtStartOfDay();
  const dateAtStartOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dateAtStartOfDay < today;
}

/**
 * Get an array of date strings between two dates (inclusive)
 */
export function getDateStringsBetween(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const startDate = parseDateString(startDateStr);
  const endDate = parseDateString(endDateStr);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(formatDateToString(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Sort an array of date strings chronologically
 */
export function sortDateStrings(dateStrings: string[]): string[] {
  return [...dateStrings].sort(compareDateStrings);
}

/**
 * Convert a date string array to Date objects array
 */
export function parseDateStrings(dateStrings: string[]): Date[] {
  return dateStrings.map(parseDateString);
}

/**
 * Get the first day of the current month as YYYY-MM-DD string
 */
export function getCurrentMonthStart(): string {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return formatDateToString(firstDay);
}

/**
 * Get the last day of the current month as YYYY-MM-DD string
 */
export function getCurrentMonthEnd(): string {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Day 0 of next month = last day of current month
  return formatDateToString(lastDay);
} 