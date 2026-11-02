// Status and severity badge components with semantic color tokens.

export function renderStatusBadge(status) {
  if (!status) return '';
  const statusStr = String(status).trim();
  
  // Extract main status name and optional timestamp (e.g. "Resolved · 21 Oct 11:20")
  let mainStatus = statusStr;
  let timestampSuffix = '';
  if (statusStr.includes('·')) {
    const parts = statusStr.split('·');
    mainStatus = parts[0].trim();
    timestampSuffix = parts.slice(1).join('·').trim();
  }

  const variantMap = {
    'Submitted':         'luba-badge-info bg-luba-infoPillBg text-luba-info',
    'Under Review':      'luba-badge-warning bg-luba-warningBg text-luba-warningText',
    'Verified':          'luba-badge-info bg-luba-infoPillBg text-luba-info',
    'Assigned':          'luba-badge-info bg-luba-infoPillBg text-luba-info',
    'In Progress':       'luba-badge-warning bg-luba-warningBg text-luba-warningText',
    'Resolved':          'luba-badge-success bg-luba-successBg text-luba-success',
    'Rejected':          'luba-badge-danger bg-luba-dangerBg text-luba-danger',
    'Duplicate':         'luba-badge-neutral bg-luba-neutralBg text-luba-neutralText',
    'Active':            'luba-badge-success bg-luba-successBg text-luba-success',
    'Approved':          'luba-badge-success bg-luba-successBg text-luba-success',
    'Awaiting review':   'luba-badge-warning bg-luba-warningBg text-luba-warningText',
    'On duty':           'luba-badge-success bg-luba-successBg text-luba-success',
    'Off duty':          'luba-badge-neutral bg-luba-neutralBg text-luba-neutralText',
    'Available':         'luba-badge-success bg-luba-successBg text-luba-success',
    'Unavailable':       'luba-badge-neutral bg-luba-neutralBg text-luba-neutralText',
    'Forwarded to DPWH': 'luba-badge-warning bg-amber-50 text-amber-900 border border-amber-300'
  };

  const cls = variantMap[mainStatus] || 'luba-badge-neutral bg-luba-neutralBg text-luba-neutralText';

  if (timestampSuffix) {
    return `<span class="inline-flex items-center gap-1.5"><span class="luba-badge ${cls}">${mainStatus}</span><span class="text-xs text-luba-textSubtle font-medium">· ${timestampSuffix}</span></span>`;
  }
  return `<span class="luba-badge ${cls}">${statusStr}</span>`;
}

export function renderSeverityBadge(severity, asPill = true) {
  if (!asPill) {
    const textColors = {
      High: 'text-luba-danger',
      Medium: 'text-luba-warningText',
      Low: 'text-luba-info'
    };
    return `<span class="text-xs font-bold ${textColors[severity] || 'text-luba-textPrimary'}">${severity}</span>`;
  }
  const pillStyles = {
    High: 'luba-badge-danger bg-luba-dangerBg text-luba-danger',
    Medium: 'luba-badge-warning bg-luba-warningBg text-luba-warningText',
    Low: 'luba-badge-info bg-luba-infoPillBg text-luba-info'
  };
  return `<span class="luba-badge ${pillStyles[severity] || ''}">${severity}</span>`;
}

export function renderStatusTextColor(status) {
  if (!status) return '';
  const statusStr = String(status).trim();
  let mainStatus = statusStr;
  let timestampSuffix = '';
  if (statusStr.includes('·')) {
    const parts = statusStr.split('·');
    mainStatus = parts[0].trim();
    timestampSuffix = parts.slice(1).join('·').trim();
  }

  const map = {
    'Submitted':    'text-luba-info',
    'Under Review': 'text-luba-warningText',
    'Verified':     'text-luba-info',
    'Assigned':     'text-luba-info',
    'In Progress':  'text-luba-warningText',
    'Resolved':     'text-luba-success',
    'Rejected':     'text-luba-danger',
    'Duplicate':    'text-luba-info',
    'Active':       'text-luba-success',
    'On duty':      'text-luba-success',
    'Off duty':     'text-luba-textMuted',
    'Available':    'text-luba-success',
    'Unavailable':  'text-luba-textMuted'
  };

  const colorCls = map[mainStatus] || 'text-luba-textPrimary';
  if (timestampSuffix) {
    return `<span class="text-xs font-bold ${colorCls}">${mainStatus}</span> <span class="text-xs text-luba-textSubtle font-normal">· ${timestampSuffix}</span>`;
  }
  return `<span class="text-xs font-bold ${colorCls}">${statusStr}</span>`;
}
