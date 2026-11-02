// Page renderer for Screen 13: Pothole Map (tall schematic QC map, pin inspector, filters, public map privacy note) for City of Malolos, Bulacan.

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge, renderSeverityBadge, renderStatusTextColor } from '../components/badge.js';
import { renderPillButton } from '../components/controls.js';
import { renderRealMalolosMapContainer, filterMapReports, escapeHtml } from '../components/realMalolosMap.js';
import { SVG_CHEVRON_DOWN, MALOLOS_BARANGAYS } from '../data/constants.js';
import { getReportPhotoUrl, formatLiveSnapshotDate } from '../utils/format.js';

export function renderPotholeMap(state) {
  const mf = state.mapFilters || {};
  const allReports = state.reports || [];
  const rawFiltered = filterMapReports(allReports, mf);
  const filteredReports = [...rawFiltered].sort((a, b) => {
    const idA = Number(a.id) || Number(String(a.code || '').replace(/\D/g, '')) || 0;
    const idB = Number(b.id) || Number(String(b.code || '').replace(/\D/g, '')) || 0;
    if (idB !== idA) return idB - idA;
    const timeA = new Date(a.createdAt || a.reportedDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.reportedDate || 0).getTime();
    return timeB - timeA;
  });

  const selectedReport =
    filteredReports.find((r) => r.code === mf.selectedPinCode) ||
    filteredReports[0] ||
    null;

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Pothole map</h1>
          <p class="luba-page-subtitle">City of Malolos, Bulacan · Center: 14.8433° N, 120.8113° E · Snapshot ${formatLiveSnapshotDate()} PHT</p>
        </div>
      </div>

      <!-- Filter Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- 1. Search road or report ID -->
        <div class="luba-field-box relative">
          <div class="flex items-center justify-between">
            <label class="block text-[11px] text-luba-textSubtle">Search road or report ID</label>
            ${
              mf.search
                ? `<button type="button" data-clear-map-search class="text-[11px] text-luba-textSubtle hover:text-luba-danger transition cursor-pointer font-medium" title="Clear search">✕ Clear</button>`
                : ''
            }
          </div>
          <div class="relative flex items-center mt-1">
            <input
              type="text"
              id="map-search-input"
              value="${escapeHtml(mf.search || '')}"
              placeholder="e.g. MacArthur Highway, 0842, Guinhawa"
              class="w-full text-xs font-medium text-luba-textPrimary bg-transparent focus:outline-none pr-4"
              autocomplete="off"
            />
          </div>
        </div>

        <!-- 2. Jurisdiction Dropdown -->
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">Jurisdiction</label>
          <select
            id="map-jurisdiction-select"
            class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer"
          >
            ${['All jurisdictions', 'City', 'DPWH-National']
              .map((j) => `<option value="${j}" ${mf.jurisdiction === j ? 'selected' : ''}>${j}</option>`)
              .join('')}
          </select>
        </div>

        <!-- 3. Severity Dropdown -->
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">Severity</label>
          <select
            id="map-severity-select"
            class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer"
          >
            ${['All severities', 'High', 'Medium', 'Low']
              .map((s) => `<option value="${s}" ${mf.severity === s ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </div>

        <!-- 4. Barangay (51 total) Dropdown -->
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">Barangay (51 total)</label>
          <select
            id="map-barangay-select"
            class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="All barangays" ${mf.barangay === 'All barangays' ? 'selected' : ''}>All barangays</option>
            ${MALOLOS_BARANGAYS.map((b) => `<option value="${b}" ${mf.barangay === b ? 'selected' : ''}>${b}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Mode Pills & Live Search Feedback Row -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-2">
          ${['All statuses', 'Open only', 'Resolved']
            .map((m) =>
              renderPillButton({
                label: m,
                active: mf.modePill === m,
                dataAttr: `data-map-mode="${m}"`
              })
            )
            .join('')}
        </div>

        <!-- Result count counter and quick filter reset -->
        <div class="flex items-center gap-2 text-xs text-luba-textSubtle">
          <span>Showing <strong class="text-luba-textPrimary">${filteredReports.length}</strong> of ${allReports.length} reports</span>
          ${
            mf.search
              ? `<span class="bg-blue-50 text-luba-info border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">matching "${escapeHtml(mf.search)}"</span>`
              : ''
          }
          ${
            mf.search ||
            (mf.jurisdiction && mf.jurisdiction !== 'All jurisdictions') ||
            (mf.severity && mf.severity !== 'All severities') ||
            (mf.barangay && mf.barangay !== 'All barangays') ||
            (mf.modePill && mf.modePill !== 'All statuses')
              ? `<button type="button" id="btn-reset-map-filters" class="text-xs text-luba-cta hover:underline font-semibold cursor-pointer ml-1">Reset filters</button>`
              : ''
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-3">
          ${renderRealMalolosMapContainer({ selectedPin: selectedReport ? selectedReport.code : mf.selectedPinCode, mapViewType: 'real' })}
          <div class="flex items-center justify-between">
            ${renderSeverityBadge('High')}
            ${renderSeverityBadge('Medium')}
            ${renderSeverityBadge('Low')}
          </div>
          <p class="text-xs text-luba-textSubtle">
            ${
              mf.mapViewType === 'schematic'
                ? 'MacArthur Highway corridor with Paseo del Congreso branch · Schematic vector layout.'
                : 'Interactive real-time OpenStreetMap of City of Malolos, Bulacan · Pins plotted from real GPS coordinates.'
            }
          </p>
          <button type="button" id="btn-reset-map-filters" class="luba-btn-secondary w-full py-2.5 cursor-pointer">
            Reset map filters
          </button>
        </div>

        <div class="lg:col-span-4 space-y-4" id="pothole-map-sidebar">
          ${renderPotholeMapSidebar(state)}
        </div>
      </div>

      <!-- Public Map Privacy Banner -->
      ${renderBanner({
        variant: 'info',
        title: 'Public map privacy',
        body: 'Citizen name, phone and email are not shown on pins. Restricted details remain in authorized report views.'
      })}
    </div>
  `;
}

export function renderPotholeMapSidebar(state) {
  const mf = state.mapFilters || {};
  const allReports = state.reports || [];
  const rawFiltered = filterMapReports(allReports, mf);
  const filteredReports = [...rawFiltered].sort((a, b) => {
    const idA = Number(a.id) || Number(String(a.code || '').replace(/\D/g, '')) || 0;
    const idB = Number(b.id) || Number(String(b.code || '').replace(/\D/g, '')) || 0;
    if (idB !== idA) return idB - idA;
    const timeA = new Date(a.createdAt || a.reportedDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.reportedDate || 0).getTime();
    return timeB - timeA;
  });

  const selectedReport =
    filteredReports.find((r) => r.code === mf.selectedPinCode) ||
    filteredReports[0] ||
    null;

  return `
    ${
      selectedReport
        ? `
          <div class="luba-card p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-luba-textPrimary">${selectedReport.code}</h2>
              ${renderStatusBadge(selectedReport.status || 'Under Review')}
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedReport.jurisdiction === 'DPWH-National'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }">
                ${selectedReport.jurisdiction || 'City'}
              </span>
              <span class="text-xs text-luba-textSubtle">Brgy. ${selectedReport.barangay || 'Guinhawa'}</span>
            </div>
            <img src="${getReportPhotoUrl(selectedReport)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Pin inspector preview" class="w-full h-40 object-cover rounded-lg border border-luba-border"/>
            <div>
              <p class="text-sm font-bold text-luba-textPrimary">${selectedReport.road}</p>
              <p class="text-xs text-luba-textSubtle leading-relaxed mt-0.5">${selectedReport.landmark || selectedReport.location || 'City of Malolos, Bulacan'}</p>
            </div>
            <div class="pt-1">
              ${renderSeverityBadge(selectedReport.severity || 'High')}
            </div>
            <p class="text-xs text-luba-textSubtle flex items-center gap-1.5">
              <span class="font-medium text-luba-textPrimary">GPS:</span> ${selectedReport.coordinates || '14.8524° N, 120.8168° E'}
            </p>
            <p class="text-xs text-luba-textSubtle">Submitted · ${selectedReport.reportedDate || '19 Oct, 9:24 AM PHT'}</p>
            <p class="text-xs text-luba-textSubtle">City verification · Ana Dela Cruz · 21 Oct, 11:20 AM PHT</p>
            <button type="button" data-open-report="${selectedReport.code}" class="luba-btn-primary w-full py-3">
              Review report details
            </button>
          </div>
        `
        : `
          <div class="luba-card p-6 text-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-luba-textSubtle">
              <svg class="w-6 h-6 text-luba-textSubtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-sm text-luba-textPrimary">No matching reports</h3>
              <p class="text-xs text-luba-textSubtle mt-1 leading-relaxed">
                No pothole reports match "<strong>${escapeHtml(mf.search || '')}</strong>".
              </p>
            </div>
            <p class="text-[11px] text-luba-textSubtle">
              Try searching by road name (e.g. MacArthur Highway, Paseo del Congreso), report ID (e.g. 0842), or barangay (e.g. Guinhawa).
            </p>
            <button type="button" data-clear-map-search class="luba-btn-secondary w-full py-2 text-xs cursor-pointer">
              Clear search filter
            </button>
          </div>
        `
    }

    <!-- Reports List Matching Current Map View -->
    <div class="luba-card p-4 space-y-2.5">
      <div class="flex items-center justify-between border-b border-luba-border pb-2">
        <h3 class="text-xs font-bold text-luba-textPrimary flex items-center gap-1.5 uppercase tracking-wider">
          <svg class="w-3.5 h-3.5 text-luba-info" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          Reports on Map (${filteredReports.length})
        </h3>
        <button type="button" data-screen-jump="2" class="text-[11px] font-bold text-luba-info hover:underline inline-flex items-center gap-1 cursor-pointer">
          <span>View table</span>
          <span>→</span>
        </button>
      </div>

      <div class="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 divide-y divide-luba-border/60">
        ${
          filteredReports.length > 0
            ? filteredReports.map((r) => `
              <div
                data-pin-select="${r.code}"
                class="pt-1.5 first:pt-0 p-2 rounded-lg transition cursor-pointer flex items-center justify-between gap-2 ${
                  r.code === selectedReport?.code
                    ? 'bg-blue-50/80 border border-luba-info/40'
                    : 'hover:bg-slate-50 border border-transparent'
                }"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-xs ${r.code === selectedReport?.code ? 'text-luba-info' : 'text-luba-textPrimary'} truncate">
                    ${r.code} · ${r.road}
                  </p>
                  <p class="text-[11px] text-luba-textSubtle truncate">Brgy. ${r.barangay} · ${r.jurisdiction || 'City'}</p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  ${renderSeverityBadge(r.severity, false)}
                  ${renderStatusTextColor(r.status)}
                </div>
              </div>
            `).join('')
            : `<p class="text-xs text-luba-textSubtle py-2 text-center">No reports match active filters.</p>`
        }
      </div>
    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.lubaUpdatePotholeSidebar = (code) => {
    const sidebar = document.getElementById('pothole-map-sidebar');
    if (sidebar) {
      sidebar.innerHTML = renderPotholeMapSidebar(store.getState());
    }
  };
}

export { renderPotholeMap as renderPotholeMapView };
