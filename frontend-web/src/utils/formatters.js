/**
 * Format ISO datetime string to localized Vietnamese format.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDateTime(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date string to localized date format.
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  if (!isoDate) return '-';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return isoDate;
  }
}

