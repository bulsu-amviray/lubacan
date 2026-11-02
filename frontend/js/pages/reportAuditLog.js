// Page renderer for Screen 12: Report Status History and Audit Log (immutable event records table and status filter).

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge } from '../components/badge.js';

export function renderReportAuditLog(state) {
  const af = state.auditLogFilters || { status: 'All statuses', fromDate: '19 Oct 2026', toDate: '21 Oct 2026' };
  const currentCode = state.selectedReportCode || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || state.reports?.[0] || {};
  const rows = (state.auditLogEvents || []).filter((ev) => {
    if (af.status !== 'All statuses' && ev.status !== af.status) return false;
    return true;
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Report activity log</h1>
          <p class="luba-page-subtitle">${report.code || currentCode} · Immutable event records · All timestamps PHT, 2026</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5 cursor-pointer">
          Back to report
        </button>
      </div>

      <div class="flex items-center gap-3">
        ${renderStatusBadge(report.status || 'Resolved')}
        <span class="text-xs text-luba-textSubtle">Road: ${report.road || 'MacArthur Highway'} · Latest decision recorded</span>
      </div>

      <!-- Filter Row -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        <div class="md:col-span-4 luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">Status filter</label>
          <select id="audit-status-filter" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none bg-transparent">
            ${['All statuses', 'Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved']
              .map((s) => `<option value="${s}" ${af.status === s ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </div>
        <div class="md:col-span-3 luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">From date (inclusive)</label>
          <input type="text" value="${af.fromDate}" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none bg-transparent"/>
        </div>
        <div class="md:col-span-3 luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">To date (inclusive)</label>
          <input type="text" value="${af.toDate}" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none bg-transparent"/>
        </div>
        <div class="md:col-span-2 flex items-start">
          <button type="button" class="luba-btn-primary w-full px-4 py-3">
            Apply filters
          </button>
        </div>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Read-only history',
        body: 'Event records cannot be edited or deleted here. Corrections are appended as new audited events; the original actor, timestamp and evidence references are retained.'
      })}

      <!-- 10-Event Immutable Audit Table -->
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">TIMESTAMP · PHT</th>
              <th class="py-3 px-4">ACTOR</th>
              <th class="py-3 px-4">STATUS</th>
              <th class="py-3 px-4">REASON / EVIDENCE NOTE</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${rows
              .map(
                (ev) => `
              <tr class="luba-table-row">
                <td class="py-3.5 px-4 font-bold text-luba-info">${ev.time}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${ev.actor}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${ev.status}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${ev.note}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="luba-card p-5 space-y-2">
        <h3 class="text-base font-bold text-luba-textPrimary">Evidence references</h3>
        <p class="text-xs text-luba-textSubtle">Citizen photo · 19 Oct, 9:24 AM · Before photo · 20 Oct, 8:05 AM · After photo · 21 Oct, 10:35 AM</p>
        <p class="text-xs text-luba-textSubtle">Completed at 10:35 AM and submitted at 10:45 AM are distinct events. Neither marks the report Resolved before LGU approval.</p>
      </div>
    </div>
  `;
}

export { renderReportAuditLog as renderReportAuditLogView };
