// Background views for modal screens (Screens 5, 6, 7, 9, 21, 22, 23, 24)
import { renderStatusBadge, renderSeverityBadge, renderStatusTextColor } from '../components/badge.js';
import { renderBanner } from '../components/banner.js';
import { renderPillButton } from '../components/controls.js';
import { renderKpiCard } from '../components/card.js';

export function renderApproveReportBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Verify citizen report</h1>
          <p class="luba-page-subtitle">RW-2026-0842 · 19 October 2026, 10:15 AM · Reviewer: Ana Dela Cruz</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>
      <div class="luba-card p-5 space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-luba-textPrimary">RW-2026-0842</p>
          ${renderStatusBadge('Under Review')}
        </div>
        <h2 class="text-xl font-bold text-luba-textPrimary">MacArthur Highway</h2>
        <p class="text-xs text-luba-textSubtle">Northbound, near Bulihan junction, Brgy. Guinhawa, City of Malolos</p>
        <p class="text-xs text-luba-danger">High severity · 0.8 m wide · 12 cm deep · Photo and location verified · DPWH Corridor</p>
      </div>
    </div>
  `;
}

export function renderRejectReportBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Reports management</h1>
          <p class="luba-page-subtitle">Exception workflow · Separate validation demo on RW-2026-0844</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>
      <div class="luba-card p-5 space-y-2">
        <h2 class="text-lg font-bold text-luba-textPrimary">Report awaiting exception decision</h2>
        ${renderStatusBadge('Under Review')}
        <p class="text-xs text-luba-textSubtle pt-1">RW-2026-0844 · Separate validation report</p>
      </div>
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">REPORT ID</th>
              <th class="py-3 px-4">ROAD</th>
              <th class="py-3 px-4">REVIEWER</th>
            </tr>
          </thead>
          <tbody class="text-xs">
            <tr>
              <td class="py-4 px-4 font-bold text-luba-info">RW-2026-0844</td>
              <td class="py-4 px-4 text-luba-textSecondary">Bocaue–San Jose Road, Outside City Jurisdiction</td>
              <td class="py-4 px-4 text-luba-textSecondary">Ana Dela Cruz</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderDuplicateOutcomeBgView(state) {
  return `
    <div class="space-y-5">
      <div>
        <h1 class="luba-page-title">Reports management</h1>
        <p class="luba-page-subtitle">Exception workflow · Separate validation demo on RW-2026-0835</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[260px] flex items-center gap-2 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="text" placeholder="Search reports, roads or report ID" class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle bg-transparent"/>
        </div>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>All statuses</span>
        </button>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>All severities</span>
        </button>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span>October 2026</span>
        </button>
      </div>
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">REPORT ID</th>
              <th class="py-3 px-4">ROAD</th>
              <th class="py-3 px-4">BARANGAY</th>
              <th class="py-3 px-4">SEVERITY</th>
              <th class="py-3 px-4">STATUS</th>
              <th class="py-3 px-4">REPORTED</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${state.reports
              .slice(0, 4)
              .map(
                (r) => `
              <tr>
                <td class="py-4 px-4 font-bold text-luba-info">${r.code}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.road}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.barangay}</td>
                <td class="py-4 px-4">${renderSeverityBadge(r.severity, false)}</td>
                <td class="py-4 px-4">${renderStatusTextColor(r.status)}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.reportedDate}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderAssignTeamBgView() {
  return `
    <div class="space-y-5">
      <div>
        <h1 class="luba-page-title">Assign maintenance team</h1>
        <p class="luba-page-subtitle">RW-2026-0842 · Verified 19 October 2026, 10:15 AM</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="./assets/pothole-citizen.jpg" onerror="this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;" alt="MacArthur Highway pothole" class="w-full h-[304px] object-cover"/>
          </div>
          <div class="luba-card p-5 space-y-3">
            <h2 class="text-lg font-bold text-luba-textPrimary">MacArthur Highway</h2>
            <p class="text-xs text-luba-textSubtle">Northbound, near Bulihan junction, Brgy. Guinhawa, City of Malolos</p>
            <div class="relative w-full h-[288px] rounded-card overflow-hidden border border-luba-border bg-[#F8FAFC] shadow-xs">
              <div id="report-detail-leaflet-map" class="w-full h-full z-0"></div>
              <div class="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-luba-border shadow-xs text-[11px] text-luba-textSecondary flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-semibold text-luba-textPrimary">OpenStreetMap GPS</span>
                <span class="text-luba-textSubtle">· MacArthur Highway, Guinhawa</span>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-2.5 text-xs">
            ${renderStatusBadge('Verified')}
            <p class="text-luba-textSecondary pt-1">Citizen · Mika Reyes</p>
            <p class="text-luba-textSecondary">Severity · High</p>
            <p class="text-luba-textSecondary">Verified by · Ana Dela Cruz</p>
          </div>
          ${renderBanner({
            variant: 'info',
            title: 'Ready for assignment',
            body: 'Location and severity confirmed. No matching duplicate found.'
          })}
        </div>
      </div>
    </div>
  `;
}

export function renderAnalyticsModalBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Road performance analytics</h1>
          <p class="luba-page-subtitle">All-report snapshot · City of Malolos, Bulacan · As of 21 October 2026, 12:00 PM</p>
        </div>
        <button type="button" data-screen-jump="20" class="luba-btn-secondary px-4 py-2.5">
          Back to analytics
        </button>
      </div>
      <div class="flex gap-2">
        ${renderPillButton({ label: 'Overview', active: true })}
        ${renderPillButton({ label: 'By barangay', active: false })}
      </div>
      ${renderBanner({
        variant: 'info',
        title: 'All-report snapshot · 21 Oct 2026, 12:00 PM PHT',
        body: '1,284 reports · 620 Resolved · 626 open · 38 exceptions · Filter dialogs validate before changing the active range.'
      })}
    </div>
  `;
}

export function renderAnalyticsErrorBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Road performance analytics</h1>
          <p class="luba-page-subtitle">Export attempt · 21 Oct 2026, 12:03 PM PHT</p>
        </div>
        <button type="button" data-screen-jump="20" class="luba-btn-secondary px-4 py-2.5">
          Back to analytics
        </button>
      </div>
      <div class="flex gap-2">
        ${renderPillButton({ label: 'Overview', active: true })}
        ${renderPillButton({ label: 'By barangay', active: false })}
      </div>
      ${renderBanner({
        variant: 'info',
        title: 'All-report snapshot · 21 Oct 2026, 12:00 PM PHT',
        body: '1,284 reports · 620 Resolved · 626 open · 38 exceptions · Filter dialogs validate before changing the active range.'
      })}
    </div>
  `;
}

export function renderExportSuccessBgView() {
  return `
    <div class="space-y-5">
      <div>
        <h1 class="luba-page-title">Road performance analytics</h1>
        <p class="luba-page-subtitle">All-report snapshot · 21 Oct 2026, 12:02 PM PHT</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderKpiCard({ label: 'Reports received', value: '1,284', subtitle: 'All statuses' })}
        ${renderKpiCard({ label: 'Resolved', value: '620', subtitle: 'LGU approved' })}
        ${renderKpiCard({ label: 'Open', value: '626', subtitle: 'Active / in progress' })}
        ${renderKpiCard({ label: 'Exceptions', value: '38', subtitle: 'Rejected and Duplicate' })}
      </div>
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">ROAD CORRIDOR</th>
              <th class="py-3 px-4 text-right">EXCEPTIONS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            <tr>
              <td class="py-3.5 px-4 font-bold text-luba-info">MacArthur Highway</td>
              <td class="py-3.5 px-4 text-right text-luba-textSecondary">10</td>
            </tr>
            <tr>
              <td class="py-3.5 px-4 font-bold text-luba-info">Paseo del Congreso</td>
              <td class="py-3.5 px-4 text-right text-luba-textSecondary">6</td>
            </tr>
            <tr>
              <td class="py-3.5 px-4 font-bold text-luba-info">Blas Ople Diversion Road</td>
              <td class="py-3.5 px-4 text-right text-luba-textSecondary">5</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
