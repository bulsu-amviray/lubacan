// Validation helpers and regular expressions for user input and date ranges.

export const PH_MOBILE_REGEX = /^(?:\+63|0)?[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}$|^(?:\+63|0)?9\d{9}$/;

export function isValidPhMobileNumber(mobile) {
  if (!mobile) return false;
  return PH_MOBILE_REGEX.test(mobile.trim());
}

export function isValidDateRange(fromDateStr, toDateStr) {
  if (!fromDateStr || !toDateStr) return true;
  // In the reference spec: 21 Oct 2026 to 19 Oct 2026 is invalid (end precedes start)
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
    return to >= from;
  }
  return true;
}
