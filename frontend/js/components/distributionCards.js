// Status and severity distribution metric cards for Overview and Analytics.
import { formatNumberWithCommas } from '../utils/format.js';

export function renderStatusDistributionCard(state = null) {
  const reports = state?.reports || [];
  const totalReports = reports.length;

  const counts = {
    'Submitted': 0,
    'Under Review': 0,
    'Verified': 0,
    'Assigned': 0,
    'In Progress': 0,
    'Resolved': 0,
    'Rejected': 0,
    'Duplicate': 0
  };

  reports.forEach((r) => {
    if (counts[r.status] !== undefined) {
      counts[r.status]++;
    }
  });

  const divisor = totalReports > 0 ? totalReports : 1;

  const statusRows = [
    { label: 'Submitted',    count: counts['Submitted'],    pct: Math.round((counts['Submitted'] / divisor) * 100),    minW: counts['Submitted'] > 0 ? '12px' : '0px', color: 'bg-luba-info' },
    { label: 'Under Review', count: counts['Under Review'], pct: Math.round((counts['Under Review'] / divisor) * 100), minW: counts['Under Review'] > 0 ? '12px' : '0px', color: 'bg-luba-info' },
    { label: 'Verified',     count: counts['Verified'],     pct: Math.round((counts['Verified'] / divisor) * 100),     minW: counts['Verified'] > 0 ? '12px' : '0px', color: 'bg-luba-info' },
    { label: 'Assigned',     count: counts['Assigned'],     pct: Math.round((counts['Assigned'] / divisor) * 100),     minW: counts['Assigned'] > 0 ? '12px' : '0px', color: 'bg-luba-info' },
    { label: 'In Progress',  count: counts['In Progress'],  pct: Math.round((counts['In Progress'] / divisor) * 100),  minW: counts['In Progress'] > 0 ? '12px' : '0px', color: 'bg-luba-cta' },
    { label: 'Resolved',     count: counts['Resolved'],     pct: Math.round((counts['Resolved'] / divisor) * 100),     minW: counts['Resolved'] > 0 ? '12px' : '0px', color: 'bg-luba-success' },
    { label: 'Rejected',     count: counts['Rejected'],     pct: Math.round((counts['Rejected'] / divisor) * 100),     minW: counts['Rejected'] > 0 ? '12px' : '0px', color: 'bg-luba-info' },
    { label: 'Duplicate',    count: counts['Duplicate'],    pct: Math.round((counts['Duplicate'] / divisor) * 100),    minW: counts['Duplicate'] > 0 ? '12px' : '0px', color: 'bg-luba-info' }
  ];

  return `
    <div class="luba-card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-luba-textPrimary">Reports by status</h2>
        <span class="text-xs text-luba-textSubtle">${formatNumberWithCommas(totalReports)} total</span>
      </div>
      <div class="space-y-3">
        ${statusRows
          .map(
            (r) => `
          <div class="grid grid-cols-12 items-center gap-2 text-xs">
            <span class="col-span-3 text-luba-textSubtle">${r.label}</span>
            <div class="col-span-8 h-[7px] bg-luba-tableHeader rounded-full overflow-hidden">
              <div class="h-full ${r.color} rounded-full" style="width: ${r.pct}%; min-width: ${r.minW}"></div>
            </div>
            <span class="col-span-1 text-right font-semibold text-luba-textPrimary">${formatNumberWithCommas(r.count)}</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

export function renderSeverityDistributionCard(state = null) {
  const reports = state?.reports || [];
  const totalReports = reports.length;

  let high = 0;
  let medium = 0;
  let low = 0;

  reports.forEach((r) => {
    if (r.severity === 'High') high++;
    else if (r.severity === 'Medium') medium++;
    else if (r.severity === 'Low') low++;
  });

  const divisor = totalReports > 0 ? totalReports : 1;
  const highPct = ((high / divisor) * 100).toFixed(1);
  const medPct = ((medium / divisor) * 100).toFixed(1);
  const lowPct = ((low / divisor) * 100).toFixed(1);

  return `
    <div class="luba-card p-5">
      <h2 class="text-base font-bold text-luba-textPrimary">Severity distribution</h2>
      <p class="luba-kpi-value mt-1">${formatNumberWithCommas(totalReports)}</p>
      <p class="text-xs text-luba-textSubtle mb-3">Total reports · All severities</p>
      <div class="w-full h-6 rounded-[6px] overflow-hidden flex gap-[2px] mb-4 bg-slate-100">
        <div class="bg-luba-danger h-full" style="width: ${highPct}%"></div>
        <div class="bg-luba-cta h-full" style="width: ${medPct}%"></div>
        <div class="bg-luba-info h-full" style="width: ${lowPct}%"></div>
      </div>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between"><span class="font-bold text-luba-danger">High</span><span class="text-luba-textSubtle">${formatNumberWithCommas(high)} · ${highPct}%</span></div>
        <div class="flex justify-between"><span class="font-bold text-luba-cta">Medium</span><span class="text-luba-textSubtle">${formatNumberWithCommas(medium)} · ${medPct}%</span></div>
        <div class="flex justify-between"><span class="font-bold text-luba-info">Low</span><span class="text-luba-textSubtle">${formatNumberWithCommas(low)} · ${lowPct}%</span></div>
      </div>
      <p class="text-[11px] text-luba-textSubtle mt-3">Live database breakdown · City of Malolos, Bulacan</p>
    </div>
  `;
}
