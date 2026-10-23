export const PH_MOBILE_REGEX = /^\+63\s?9\d{2}\s?\d{3}\s?\d{4}$/;

export const ALLOWED_STATUS_TRANSITIONS = {
  'Submitted': ['Under Review', 'Verified', 'Rejected', 'Duplicate'],
  'Under Review': ['Verified', 'Rejected', 'Duplicate'],
  'Verified': ['Assigned'],
  'Assigned': ['In Progress'],
  'In Progress': ['In Progress', 'Resolved'],
  'Resolved': [],
  'Rejected': [],
  'Duplicate': []
};

/**
 * Validates Philippine mobile number format (+63 9XX XXX XXXX).
 * Matches "Admin · Add maintenance personnel.png" error state when incomplete (+63 917 000).
 */
export function validatePhilippineMobile(req, res, next) {
  const mobile = (req.body.mobileNumber ?? req.body.mobile_number ?? '').trim();
  if (!PH_MOBILE_REGEX.test(mobile)) {
    return res.status(422).json({
      error: 'INVALID_PH_MOBILE_NUMBER',
      field: 'mobileNumber',
      message: 'Enter a complete Philippine mobile number, for example +63 917 000 0215.'
    });
  }
  return next();
}

/**
 * Validates inclusive PHT date range (fromDate <= toDate).
 * Matches "Admin · Date-range filters.png" error state (From: 21 Oct 2026 > To: 19 Oct 2026).
 */
export function validateDateRangeQuery(req, res, next) {
  const fromDate = req.query.fromDate || req.body?.fromDate;
  const toDate = req.query.toDate || req.body?.toDate;

  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(422).json({
        error: 'INVALID_DATE_FORMAT',
        message: 'Provide valid ISO dates for fromDate and toDate.'
      });
    }
    if (start.getTime() > end.getTime()) {
      return res.status(422).json({
        error: 'INVALID_DATE_RANGE_END_PRECEDES_START',
        title: 'Invalid range · end precedes start',
        message: 'Choose a To date on or after From date. No filter has been applied; the all-report snapshot remains unchanged.'
      });
    }
  }
  return next();
}

/**
 * Validates whether a report status transition is allowed by the LGU lifecycle state machine.
 */
export function isTransitionAllowed(previousStatus, nextStatus) {
  const allowed = ALLOWED_STATUS_TRANSITIONS[previousStatus] || [];
  return allowed.includes(nextStatus);
}
