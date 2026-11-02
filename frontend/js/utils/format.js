// Formatting helpers for timestamps, numbers, and coordinates.

export const FALLBACK_POTHOLE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23E2E8F0'%3E%3Crect width='400' height='300' fill='%231E3959'/%3E%3Ccircle cx='200' cy='120' r='48' fill='%232E4765'/%3E%3Cpath d='M180 115a8 8 0 0 1 8-8h24a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-24a8 8 0 0 1-8-8z' stroke='%238FA3BA' stroke-width='3' fill='none'/%3E%3Ccircle cx='200' cy='123' r='6' stroke='%238FA3BA' stroke-width='2' fill='none'/%3E%3Cpath d='M195 103h10' stroke='%238FA3BA' stroke-width='2' stroke-linecap='round'/%3E%3Ctext x='200' y='210' font-family='Inter, sans-serif' font-size='14' font-weight='600' fill='%23CFD9E5' text-anchor='middle'%3EROAD EVIDENCE PHOTO%3C/text%3E%3Ctext x='200' y='232' font-family='Inter, sans-serif' font-size='11' fill='%238FA3BA' text-anchor='middle'%3EMalolos City Road Works%3C/text%3E%3C/svg%3E";

if (typeof window !== 'undefined') {
  window.FALLBACK_POTHOLE_SVG = FALLBACK_POTHOLE_SVG;
}

export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return './assets/pothole-citizen.jpg';
  }
  const trimmed = url.trim();
  // Absolute URLs and inline data URIs are left untouched
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  // Convert root-relative /assets/ to relative ./assets/
  if (trimmed.startsWith('/assets/')) {
    return '.' + trimmed;
  }
  if (trimmed.startsWith('assets/')) {
    return './' + trimmed;
  }
  return trimmed;
}

if (typeof window !== 'undefined') {
  window.resolveAssetUrl = resolveAssetUrl;
}

export function formatNumberWithCommas(num) {
  if (num === null || num === undefined) return '';
  return Number(num).toLocaleString('en-US');
}

export function formatPhtTimestamp(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Returns a live dynamic snapshot timestamp in "19 October 2026, 9:45 AM" format (PHT Asia/Manila)
 */
export function formatLiveSnapshotDate(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : (date || new Date());
  try {
    const day = d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', day: 'numeric' });
    const month = d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', month: 'long' });
    const year = d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric' });
    const time = d.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
  } catch (e) {
    return d.toLocaleString('en-US');
  }
}

/**
 * Returns the exact picture/photo uploaded by the citizen/reporter for this pothole.
 * Supports citizen photo URLs, Firebase Storage URLs, Cloudinary/S3 URLs, Base64 data URIs, or fallback.
 */
export function getReportPhotoUrl(report, fallback = './assets/pothole-citizen.jpg') {
  if (!report) return resolveAssetUrl(fallback);
  const rawUrl = (
    report.photoUrl ||
    report.photo ||
    report.imageUrl ||
    report.image ||
    report.citizenPhoto ||
    report.evidencePhoto ||
    (Array.isArray(report.media) && (report.media.find(m => m.media_stage === 'CitizenSubmission')?.file_url || report.media[0]?.file_url)) ||
    fallback
  );
  return resolveAssetUrl(rawUrl);
}

/**
 * Returns the repair completion photo submitted by the maintenance crew from the field.
 */
export function getReportRepairPhotoUrl(report, fallback = './assets/pothole-repaired.jpg') {
  if (!report) return resolveAssetUrl(fallback);
  const rawUrl = (
    report.completionPhotoUrl ||
    report.afterRepairPhoto ||
    report.repairPhoto ||
    report.repairedPhotoUrl ||
    (Array.isArray(report.media) && report.media.find(m => m.media_stage === 'AfterRepair')?.file_url) ||
    fallback
  );
  return resolveAssetUrl(rawUrl);
}
