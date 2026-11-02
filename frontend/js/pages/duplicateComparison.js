// Page renderer for Screen 8: Duplicate Report Comparison (candidate vs existing photo, schematic map, decision) for City of Malolos, Bulacan.

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge, renderSeverityBadge } from '../components/badge.js';
import { getReportPhotoUrl } from '../utils/format.js';

export function renderDuplicateComparison(state) {
  const currentCode = state.selectedReportCode || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || state.reports?.[0] || {};
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Compare nearby reports</h1>
          <p class="luba-page-subtitle">Candidate ${report.code || currentCode} vs Reference RW-2026-0819 · Spatial radius: 50 m</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>

      ${renderBanner({
        variant: 'success',
        title: 'These are different potholes',
        body: 'RW-2026-0842 and RW-2026-0819 are on opposite carriageways along MacArthur Highway. Distance alone is not a duplicate decision.'
      })}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Candidate -->
        <div class="luba-card p-5 space-y-3">
          <h2 class="text-lg font-bold text-luba-textPrimary">Candidate · ${report.code || currentCode}</h2>
          ${renderStatusBadge(report.status || 'Under Review')}
          <img src="${getReportPhotoUrl(report)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Candidate ${report.code || currentCode}" class="w-full h-[228px] object-cover rounded-lg border border-luba-border"/>
          <p class="text-xs font-bold text-luba-textPrimary">${report.road || 'MacArthur Highway'} · Northbound</p>
          <p class="text-xs text-luba-textSubtle">Near BSU crossing / Capitol junction, Brgy. Guinhawa</p>
          <p class="text-xs text-luba-textSubtle">14.8524° N, 120.8168° E · Pin A</p>
          ${renderSeverityBadge('High')}
          <p class="text-xs text-luba-textSubtle">0.8 m wide · 12 cm deep · 19 Oct, 9:24 AM</p>
        </div>

        <!-- Existing -->
        <div class="luba-card p-5 space-y-3">
          <h2 class="text-lg font-bold text-luba-textPrimary">Existing · RW-2026-0819</h2>
          ${renderStatusBadge('Assigned')}
          <img src="./assets/pothole-existing.jpg" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Existing RW-2026-0819" class="w-full h-[228px] object-cover rounded-lg border border-luba-border"/>
          <p class="text-xs font-bold text-luba-textPrimary">MacArthur Highway · Southbound</p>
          <p class="text-xs text-luba-textSubtle">Opposite carriageway approaching Brgy. Tikay</p>
          <p class="text-xs text-luba-textSubtle">14.8520° N, 120.8170° E · Pin B (sample)</p>
          ${renderSeverityBadge('High')}
          <p class="text-xs text-luba-textSubtle">Reported 18 Oct, 4:10 PM · 38 m from candidate</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-2">
          <div class="relative w-full h-[320px] rounded-card overflow-hidden border border-luba-border bg-[#F8FAFC] shadow-xs">
            <div id="duplicate-comparison-leaflet-map" class="w-full h-full z-0"></div>
            <div class="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-luba-border shadow-xs text-[11px] text-luba-textSecondary flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-semibold text-luba-textPrimary">OpenStreetMap GPS</span>
              <span class="text-luba-textSubtle">· Candidate Pin A (0842) vs Existing Pin B (0819) · 38 m apart</span>
            </div>
          </div>
          <p class="text-xs text-luba-textSubtle">Real-world GPS map · A = 0842 northbound · B = 0819 southbound · MacArthur Highway, Guinhawa.</p>
        </div>
        <div class="lg:col-span-4 space-y-3">
          <div class="luba-field-box">
            <label class="block text-[11px] text-luba-textMuted mb-1">Comparison reason *</label>
            <textarea id="duplicate-compare-notes" rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.duplicateCompareForm.reason}</textarea>
          </div>
          <button type="button" data-screen-jump="4" class="luba-btn-primary w-full py-3">
            Keep as distinct report
          </button>
          <button type="button" data-open-modal="duplicate_outcome" class="luba-btn-secondary w-full py-2.5">
            Mark as Duplicate...
          </button>
          <p class="text-[11px] text-luba-textSubtle">Duplicate action requires a matching original and citizen-visible reason. Do not use for this pair.</p>
          <p class="text-[11px] text-luba-textSubtle">Actual duplicate example: 0835 → 0826, MacArthur Hwy, Bulihan · 12 m apart.</p>
        </div>
      </div>
    </div>
  `;
}

export { renderDuplicateComparison as renderDuplicateComparisonView };
