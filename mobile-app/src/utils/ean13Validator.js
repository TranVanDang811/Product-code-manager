/**
 * Validates a 13-digit EAN-13 barcode using GS1 Modulo-10 checksum algorithm.
 * @param {string} barcode
 * @returns {boolean}
 */
export function isValidEan13(barcode) {
  if (!barcode || typeof barcode !== 'string') return false;
  if (!/^\d{13}$/.test(barcode)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode.charAt(i), 10);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }

  const remainder = sum % 10;
  const calculatedCheck = (remainder === 0) ? 0 : 10 - remainder;
  const actualCheck = parseInt(barcode.charAt(12), 10);

  return calculatedCheck === actualCheck;
}

/**
 * Validates internal 6-digit product code (e.g. "001234").
 * @param {string} code
 * @returns {boolean}
 */
export function isValidProductCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^\d{6}$/.test(code);
}

