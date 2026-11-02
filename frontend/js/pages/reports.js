// Page renderer for Screen 2: Reports Management (table, search, filters, pagination, lifecycle legend) with Malolos localization.

import { renderStatusBadge, renderSeverityBadge, renderStatusTextColor } from '../components/badge.js';
import { MALOLOS_ZONE_CLUSTERS } from '../data/constants.js';
import { filterMapReports } from '../components/realMalolosMap.js';
import { getReportPhotoUrl, formatLiveSnapshotDate } from '../utils/format.js';

export function renderReports(state) {
  const selectedJurisdiction = state.reportFilters.jurisdiction || 'All jurisdictions';
  const selectedBarangay = state.reportFilters.barangay || 'All barangays';

  const filteredReports = filterMapReports(state.reports || [], state.reportFilters);

  // Enforce newest-first sort matching Citizen mobile reference (order=id.desc)
  const sortedReports = [...filteredReports].sort((a, b) => {
    const idA = Number(a.id) || Number(String(a.code || '').replace(/\D/g, '')) || 0;
    const idB = Number(b.id) || Number(String(b.code || '').replace(/\D/g, '')) || 0;
    if (idB !== idA) return idB - idA;
    const timeA = new Date(a.createdAt || a.reportedDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.reportedDate || 0).getTime();
    return timeB - timeA;
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Reports management</h1>
          <p class="luba-page-subtitle">City of Malolos, Bulacan · All citizen reports · Workflow snapshot: <span id="reports-live-snapshot-time">${formatLiveSnapshotDate()}</span></p>
        </div>
        <button type="button" data-open-modal="export_dialog" class="luba-btn-secondary inline-flex items-center gap-2 px-4 py-2.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          Export reports
        </button>
      </div>

      <!-- Search & Dropdown Controls with Jurisdiction and 51 Malolos Barangays -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        <div class="lg:col-span-4 flex items-center gap-2.5 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="text" id="reports-search-input" value="${state.reportFilters.search || ''}" placeholder="Search road, barangay, or ID" class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle focus:outline-none bg-transparent"/>
        </div>

        <label class="lg:col-span-2 luba-btn-secondary inline-flex items-center gap-2 px-3 py-2.5">
          <select id="reports-status-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary focus:outline-none cursor-pointer w-full">
            ${['All statuses', 'Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Duplicate']
              .map((s) => `<option value="${s}" ${state.reportFilters.status === s ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </label>

        <!-- Jurisdiction Filter (City / DPWH-National) -->
        <label class="lg:col-span-2 luba-btn-secondary inline-flex items-center gap-2 px-3 py-2.5">
          <select id="reports-jurisdiction-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary focus:outline-none cursor-pointer w-full">
            ${['All jurisdictions', 'City', 'DPWH-National']
              .map((j) => `<option value="${j}" ${selectedJurisdiction === j ? 'selected' : ''}>${j}</option>`)
              .join('')}
          </select>
        </label>

        <!-- 51 Malolos Barangays Filter Grouped by Zone Clusters -->
        <label class="lg:col-span-2 luba-btn-secondary inline-flex items-center gap-2 px-3 py-2.5">
          <select id="reports-barangay-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary focus:outline-none cursor-pointer w-full">
            <option value="All barangays" ${selectedBarangay === 'All barangays' ? 'selected' : ''}>All barangays (51)</option>
            <optgroup label="Poblacion Zone">
              ${MALOLOS_ZONE_CLUSTERS.Poblacion.map((b) => `<option value="${b}" ${selectedBarangay === b ? 'selected' : ''}>${b}</option>`).join('')}
            </optgroup>
            <optgroup label="Highway Corridor Zone">
              ${MALOLOS_ZONE_CLUSTERS['Highway Corridor'].map((b) => `<option value="${b}" ${selectedBarangay === b ? 'selected' : ''}>${b}</option>`).join('')}
            </optgroup>
            <optgroup label="Outer / Rural Zone">
              ${MALOLOS_ZONE_CLUSTERS['Outer / Rural'].map((b) => `<option value="${b}" ${selectedBarangay === b ? 'selected' : ''}>${b}</option>`).join('')}
            </optgroup>
          </select>
        </label>

        <label class="lg:col-span-2 luba-btn-secondary inline-flex items-center gap-2 px-3 py-2.5">
          <select id="reports-severity-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary focus:outline-none cursor-pointer w-full">
            ${['All severities', 'High', 'Medium', 'Low']
              .map((s) => `<option value="${s}" ${state.reportFilters.severity === s ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </label>
      </div>

      <!-- Results summary counter & reset button -->
      <div class="flex items-center justify-between text-xs text-luba-textSubtle">
        <span><strong class="text-luba-textPrimary">${filteredReports.length}</strong> of ${state.reports.length} reports · City of Malolos, Bulacan (51 barangays)</span>
        <button type="button" data-reset-report-filters="true" class="font-bold text-luba-cta hover:underline cursor-pointer">Reset filters</button>
      </div>

      <!-- Reports Table with Jurisdiction & Direct Action -->
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">REPORT ID</th>
              <th class="py-3 px-4">ROAD</th>
              <th class="py-3 px-4">JURISDICTION</th>
              <th class="py-3 px-4">BARANGAY</th>
              <th class="py-3 px-4">SEVERITY</th>
              <th class="py-3 px-4">STATUS</th>
              <th class="py-3 px-4 min-w-[160px]">ACTION / WORKFLOW</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${sortedReports
              .map(
                (r) => `
              <tr class="luba-table-row transition-colors" data-report-row="${r.code}">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2.5">
                    <img src="${getReportPhotoUrl(r)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Evidence photo" class="w-9 h-9 rounded-md object-cover border border-luba-border shrink-0 shadow-xs" />
                    <div class="flex items-center gap-1.5">
                      <button type="button" data-locate-report="${r.code}" title="Locate pin on pothole map" class="p-1 rounded hover:bg-slate-100 text-luba-textSubtle hover:text-luba-info transition cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      </button>
                      <button type="button" data-open-report="${r.code}" class="font-bold text-luba-info hover:underline">${r.code}</button>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 text-luba-textPrimary font-medium">${r.road}</td>
                <td class="py-4 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
                    r.jurisdiction === 'DPWH-National'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-50 text-luba-info border border-luba-infoBorder'
                  }">
                    ${r.jurisdiction || 'City'}
                  </span>
                </td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.barangay}</td>
                <td class="py-4 px-4">${renderSeverityBadge(r.severity, false)}</td>
                <td class="py-4 px-4">${renderStatusTextColor(r.status)}</td>
                <td class="py-4 px-4">
                  ${
                    r.status === 'Verified'
                      ? r.jurisdiction === 'DPWH-National'
                        ? `<button type="button" data-forward-dpwh="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 transition shadow-sm">
                            <svg class="w-3.5 h-3.5 text-amber-700 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            <span>Forward DPWH</span>
                          </button>`
                        : `<button type="button" data-assign-report="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-white text-luba-textPrimary border border-luba-border rounded hover:bg-luba-canvas transition shadow-sm">
                            <svg class="w-3.5 h-3.5 text-luba-cta shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            <span>Assign crew →</span>
                          </button>`
                      : (r.status === 'Submitted' || r.status === 'Under Review')
                        ? `<button type="button" data-open-report="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-luba-navy text-white rounded hover:bg-luba-navyActive transition shadow-sm">
                            <span>Review report →</span>
                          </button>`
                        : (r.status === 'In Progress')
                          ? `<button type="button" data-review-completion="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 transition shadow-sm">
                              <span>Review repair →</span>
                            </button>`
                        : (r.status === 'Assigned')
                          ? `<button type="button" data-open-report="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white text-luba-textPrimary border border-luba-border rounded hover:bg-luba-canvas transition shadow-sm">
                              <span>Track repair →</span>
                            </button>`
                          : (r.status === 'Resolved')
                            ? `<button type="button" data-open-report="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100 transition shadow-sm">
                                <span>View repair →</span>
                              </button>`
                            : (r.status === 'Forwarded to DPWH')
                              ? `<button type="button" data-open-report="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100 transition shadow-sm">
                                  <span>View DPWH →</span>
                                </button>`
                              : `<button type="button" data-open-report="${r.code}" class="w-[140px] h-[32px] inline-flex items-center justify-center gap-1.5 text-xs font-medium text-luba-textSecondary bg-gray-50 border border-gray-200 rounded hover:text-luba-textPrimary hover:bg-gray-100 transition shadow-sm">
                                  <span>View details</span>
                                </button>`
                  }
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination Row -->
      <div class="flex flex-wrap items-center justify-between gap-4 text-xs text-luba-textSubtle">
        <span>Showing 1–${Math.min(8, filteredReports.length)} of ${filteredReports.length} results</span>
        <div class="flex items-center gap-1.5">
          <button type="button" class="px-3 py-1.5 bg-white border border-luba-border rounded-control text-luba-textSubtle">Previous</button>
          <button type="button" class="w-8 h-8 rounded-control bg-luba-navy text-white font-bold">1</button>
          <button type="button" class="w-8 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">2</button>
          <button type="button" class="w-8 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">3</button>
          <span class="px-2 bg-white border border-luba-border rounded-control h-8 inline-flex items-center text-luba-textPrimary">…</span>
          <button type="button" class="px-2.5 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">161</button>
          <button type="button" class="px-3 py-1.5 bg-white border border-luba-border rounded-control text-luba-textPrimary">Next</button>
        </div>
      </div>

      <!-- Report Lifecycle & Exception Statuses Legend Card -->
      <div class="luba-card p-5 space-y-3">
        <p class="text-xs font-bold text-luba-textPrimary">Report lifecycle & jurisdiction note</p>
        <div class="flex flex-wrap gap-2">
          ${['Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Duplicate']
            .map((s) => renderStatusBadge(s))
            .join('')}
        </div>
        <p class="text-xs text-luba-textSubtle">City road repairs are managed by the City of Malolos City Engineering Office. Reports along MacArthur Highway and Blas Ople Diversion Road are coordinated directly with DPWH Bulacan 1st District Engineering Office.</p>
      </div>
    </div>
  `;
}

export { renderReports as renderReportsListView };
