// Modal component for Screen 5: Approve report confirmation (City of Malolos)
import { renderModalShell } from '../components/modal.js';
import { renderStatusBadge } from '../components/badge.js';
import { renderBanner } from '../components/banner.js';
import { renderGreenCheckItem } from '../components/controls.js';

export function renderApproveReportModal(state) {
  const currentCode = state.selectedReportCode || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || state.reports?.[0] || {};

  return renderModalShell({
    title: 'Approve this report?',
    subtitle: `${report.code || currentCode} · ${report.road || 'MacArthur Highway'}, Brgy. ${report.barangay || 'Guinhawa'}`,
    bodyHtml: `
      <div class="flex items-center gap-2">
        ${renderStatusBadge(report.status || 'Under Review')}
        <span class="text-xs text-luba-textSubtle">→</span>
        ${renderStatusBadge('Verified')}
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Verification is not resolution',
        body: 'This confirms road damage and makes the report eligible for repair dispatch or forwarding to DPWH Bulacan 1st District. It does not mark the road repaired.'
      })}

      <div class="border border-luba-border rounded-card p-4 space-y-2.5 text-xs">
        <h3 class="text-base font-bold text-luba-textPrimary">Review summary</h3>
        ${renderGreenCheckItem('Photo and location match')}
        ${renderGreenCheckItem('City of Malolos / DPWH corridor scope confirmed')}
        ${renderGreenCheckItem('High severity · 0.8 m wide, 12 cm deep')}
        ${renderGreenCheckItem('RW-2026-0819 is distinct · opposite carriageway in Brgy. Tikay, 38 m away')}
      </div>

      <div class="luba-field-box">
        <label class="block text-[11px] text-luba-textMuted mb-1">Required reason / verification notes *</label>
        <textarea id="approve-modal-notes" rows="2" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.verificationForm.modalNotes}</textarea>
      </div>

      <p class="text-[11px] text-luba-textSubtle">Reason required. Ana Dela Cruz, PHT timestamp and decision will be recorded in the immutable audit log.</p>

      <button type="button" data-confirm-approve-report="true" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        Confirm · mark Verified & proceed
      </button>
      <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
        Cancel approval
      </button>
    `
  });
}
