// Page renderer for Screen 4: Verification Review (citizen photo, checklist, severity selector, notes) for City of Malolos, Bulacan.

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge } from '../components/badge.js';
import { renderGreenCheckItem } from '../components/controls.js';
import { getReportPhotoUrl } from '../utils/format.js';

export function renderVerificationReview(state) {
  const vf = state.verificationForm;
  const currentCode = state.selectedReportCode || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || state.reports?.[0] || {};
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Verify citizen report</h1>
          <p class="luba-page-subtitle">${report.code || currentCode} · City of Malolos · Received ${report.reportedDate || '19 October 2026'} · Reviewer: Ana Dela Cruz</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          ← Back to report
        </button>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Under Review → Verified',
        body: 'Confirm the photo, road location, severity and possible duplicates before approving. Approval authorizes repair dispatch or forwarding to DPWH Bulacan 1st District.'
      })}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="${getReportPhotoUrl(report)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Citizen reported pothole" class="w-full h-[304px] object-cover"/>
          </div>

          <div class="luba-card p-5 space-y-2.5">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-luba-textPrimary">${report.road || 'MacArthur Highway'}</h2>
                <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                  report.jurisdiction === 'DPWH-National'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-50 text-luba-info border border-luba-infoBorder'
                }">${report.jurisdiction || 'City'}</span>
              </div>
              ${renderStatusBadge(report.status || 'Under Review')}
            </div>
            <p class="text-xs text-luba-textSubtle">${report.landmark || `${report.road}, Brgy. ${report.barangay}, City of Malolos, Bulacan`}</p>
            <p class="text-xs text-luba-textPrimary">Citizen · ${report.citizen ? report.citizen.name : 'Citizen Reporter'} · ${report.reportedDate || '19 Oct, 9:24 AM'}</p>
            <p class="text-xs text-luba-textPrimary">${report.description || 'Deep pothole reported along road carriageway.'}</p>
          </div>

          <div class="relative w-full h-[288px] rounded-card overflow-hidden border border-luba-border bg-[#F8FAFC] shadow-xs">
            <div id="report-detail-leaflet-map" class="w-full h-full z-0"></div>
            <!-- Live GPS Malolos Watermark / Status Badge -->
            <div class="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-luba-border shadow-xs text-[11px] text-luba-textSecondary flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-semibold text-luba-textPrimary">OpenStreetMap GPS</span>
              <span class="text-luba-textSubtle">· ${report.coordinates || '14.8524° N, 120.8168° E'}</span>
            </div>
            <button
              type="button"
              id="btn-recenter-report-detail-map"
              title="Recenter map to pothole location"
              class="absolute bottom-3 right-3 z-[400] w-8 h-8 rounded-lg bg-white border border-luba-border flex items-center justify-center text-luba-textPrimary shadow-sm hover:bg-luba-canvas cursor-pointer transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-5">
          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Review checklist</h3>
            ${renderGreenCheckItem('Photo clearly shows road damage')}
            ${renderGreenCheckItem('Road and map pin match')}
            ${renderGreenCheckItem('Within City of Malolos / DPWH corridor scope')}
            ${renderGreenCheckItem('Nearby report RW-2026-0819 checked', 'data-screen-jump="8"')}

            ${renderBanner({
              variant: 'success',
              title: 'Not a duplicate',
              body: 'RW-2026-0819 is on the opposite carriageway in Brgy. Tikay, 38 m away.',
              extraClass: 'mt-2 cursor-pointer hover:opacity-95 transition',
              extraAttrs: 'data-screen-jump="8"'
            })}
          </div>

          <div class="luba-card p-5 space-y-4">
            <div>
              <p class="text-xs font-bold text-luba-textPrimary mb-2">Severity *</p>
              <div class="grid grid-cols-3 gap-2.5">
                ${['Low', 'Medium', 'High']
                  .map((sev) => {
                    const active = vf.severity === sev;
                    return `<button type="button" data-select-verify-sev="${sev}" class="py-2.5 rounded-control text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
                      active
                        ? 'border-2 border-luba-cta bg-luba-ctaTint text-luba-cta'
                        : 'border border-luba-border bg-white text-luba-textPrimary hover:bg-luba-canvas'
                    }">${active ? '<span class="w-2 h-2 rounded-full bg-luba-cta"></span>' : ''}${sev}</button>`;
                  })
                  .join('')}
              </div>
              <p class="text-[11px] text-luba-textSubtle mt-2">High: deep damage or an immediate safety risk on major arterial road.</p>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted mb-1">Verification notes *</label>
              <textarea id="verify-notes-input" rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${vf.notes}</textarea>
            </div>

            <button type="button" data-open-modal="approve_report" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              Approve & mark Verified
            </button>

            <div class="flex items-center gap-2.5">
              <button type="button" data-open-modal="reject_report" class="luba-btn-secondary px-4 py-2.5">
                Reject report
              </button>
              <button type="button" data-open-modal="duplicate_outcome" class="luba-btn-secondary px-4 py-2.5">
                Flag duplicate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export { renderVerificationReview as renderVerificationReviewView };
