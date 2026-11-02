// Page renderer for Screen 11: Repair Completion Review (before/after photos, repair summary, LGU inspection checklist) for City of Malolos, Bulacan.

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge } from '../components/badge.js';
import { renderGreenCheckItem } from '../components/controls.js';
import { getReportPhotoUrl, getReportRepairPhotoUrl } from '../utils/format.js';

export function renderRepairCompletion(state) {
  const cf = state.completionForm;
  const currentCode = state.selectedReportCode || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || state.reports?.[0] || {};
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Review repair completion</h1>
          <p class="luba-page-subtitle">${report.code || currentCode} · City of Malolos · Team evidence submitted 21 October 2026 at 10:45 AM</p>
        </div>
        <button type="button" data-screen-jump="1" class="luba-btn-secondary px-4 py-2.5">
          ← Back to review queue
        </button>
      </div>

      ${renderBanner({
        variant: 'warning',
        title: 'Awaiting City Engineering Office approval · Not yet Resolved',
        body: "Current report status: In Progress. Malolos Team Alpha's completion submission is pending your verification. Only approval below changes the status to Resolved."
      })}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-luba-textPrimary">${report.road || 'MacArthur Highway (Manila North Road)'}</h2>
                <p class="text-xs text-luba-textSubtle mt-0.5">${report.landmark || 'City of Malolos, Bulacan'}</p>
              </div>
              ${renderStatusBadge(report.status || 'In Progress')}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <img src="${getReportPhotoUrl(report, './assets/pothole-before.jpg')}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-before.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Before repair" class="w-full h-[212px] object-cover rounded-lg border border-luba-border"/>
                <p class="text-xs font-bold text-luba-textPrimary">Before repair (Citizen / Crew Evidence)</p>
                <p class="text-[11px] text-luba-textSubtle">${report.reportedDate || '20 Oct'} · Submitted photo</p>
              </div>
              <div class="space-y-2">
                <img src="${getReportRepairPhotoUrl(report, './assets/pothole-after.jpg')}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-after.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="After repair" class="w-full h-[212px] object-cover rounded-lg border border-luba-border"/>
                <p class="text-xs font-bold text-luba-textPrimary">After repair (Field Completion)</p>
                <p class="text-[11px] text-luba-textSubtle">21 Oct · 10:35 AM · Malolos Team Alpha</p>
              </div>
            </div>
          </div>

          <div class="luba-card p-5 space-y-2.5 text-xs">
            <h3 class="text-base font-bold text-luba-textPrimary">Repair summary</h3>
            <p class="text-luba-textPrimary">Report ID · RW-2026-0842</p>
            <p class="text-luba-textPrimary">Team / lead · Malolos Team Alpha / Engr. Paolo Santos</p>
            <p class="text-luba-textPrimary">Work started · 20 Oct 2026 · 8:10 AM</p>
            <p class="text-luba-textPrimary">Work completed · 21 Oct 2026 · 10:35 AM</p>
            <p class="text-luba-textPrimary leading-relaxed">Repair notes · Removed loose debris and edge damage along MacArthur Highway northbound lane. Placed and compacted a 1.2 × 1.0 m asphalt patch flush with the pavement. Lane reopened safely.</p>
            <p class="text-luba-textPrimary">Materials · Hot-mix asphalt · 4 bags / approx. 200 kg</p>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Citizen: Mika Reyes (Brgy. Guinhawa)',
            body: 'Approving this repair sends Mika a Resolved notification with the repair evidence and feedback prompt.'
          })}
        </div>

        <div class="lg:col-span-4">
          <div class="luba-card p-5 space-y-3.5">
            <h3 class="text-base font-bold text-luba-textPrimary">LGU inspection checklist</h3>
            ${renderGreenCheckItem('Before / after photos show same site')}
            ${renderGreenCheckItem('Pothole fully filled and compacted')}
            ${renderGreenCheckItem('Surface is flush and lane is safe')}
            ${renderGreenCheckItem('Notes and location are consistent')}

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted mb-1">Administrator review notes *</label>
              <textarea id="repair-completion-notes" rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${cf.reviewNotes}</textarea>
            </div>

            <div class="text-xs space-y-1 text-luba-textSecondary">
              <p>Reviewer · Ana Dela Cruz</p>
              <p>Department · City Engineering Office</p>
              <p>Decision time · 21 Oct 2026 · 11:20 AM</p>
            </div>

            <button type="button" data-approve-repair="true" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              Approve repair & mark Resolved
            </button>
            <button type="button" data-return-rework="true" class="luba-btn-secondary w-full py-2.5">
              Return to team for rework
            </button>
            <p class="text-[11px] text-luba-textSubtle">Returning for rework keeps the report In Progress and requires a reason.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export { renderRepairCompletion as renderRepairCompletionView };
