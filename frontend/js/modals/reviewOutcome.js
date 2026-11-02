// Modal component for Screens 6 & 7: Reject report confirmation & duplicate outcome dialog (City of Malolos)
import { renderModalShell } from '../components/modal.js';
import { renderBanner } from '../components/banner.js';
import { renderPillButton } from '../components/controls.js';
import { renderStatusBadge } from '../components/badge.js';
import { SVG_CHEVRON_DOWN, SVG_CHEVRON_UP } from '../data/constants.js';

export function renderReviewOutcomeModal(state) {
  const isReject = state.activeModal === 'reject_report';
  const currentCode = (state && state.selectedReportCode) || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || {
    code: currentCode,
    road: 'MacArthur Highway',
    barangay: 'Guinhawa'
  };

  return renderModalShell({
    title: 'Set Review Outcome',
    subtitle: `${report.code} · ${report.road}, Brgy. ${report.barangay}`,
    bodyHtml: `
      <div class="flex gap-2">
        ${renderPillButton({ label: 'Reject report', active: isReject, dataAttr: 'data-open-modal="reject_report"' })}
        ${renderPillButton({ label: 'Flag duplicate', active: !isReject, dataAttr: 'data-open-modal="duplicate_outcome"' })}
      </div>

      ${
        isReject
          ? `
        ${renderBanner({
          variant: 'danger',
          title: 'Confirm rejection',
          body: `This will mark ${report.code} as Rejected without creating a repair dispatch. The citizen will be notified with the reason below.`
        })}
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted">Rejection category *</label>
          <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${state.outcomeModal.rejectionCategory} ${SVG_CHEVRON_DOWN}</p>
        </div>
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted mb-1">Reason shown to citizen *</label>
          <textarea id="outcome-rejection-reason" rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.outcomeModal.rejectionReason}</textarea>
        </div>
        ${renderStatusBadge('Rejected')}
        <p class="text-[11px] text-luba-textSubtle">A reason is required. Decision and reviewer are retained in the audit log.</p>
        <button type="button" data-confirm-reject-report="true" class="luba-btn-danger w-full py-3">
          Confirm as Rejected
        </button>
      `
          : `
        ${renderBanner({
          variant: 'warning',
          title: 'Link to an existing report',
          body: `A duplicate report is closed without creating another repair task. The citizen will follow the primary report.`
        })}
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted">Original report *</label>
          <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${state.outcomeModal.originalReport} ${SVG_CHEVRON_UP}</p>
        </div>
        <div class="bg-luba-infoBg border border-luba-infoBorder rounded-control p-3.5">
          <p class="text-xs font-bold text-luba-textPrimary"><span class="text-luba-info mr-1">✓</span> RW-2026-0826 · MacArthur Highway</p>
          <p class="text-xs text-luba-textSubtle mt-0.5">Bulihan · High · In Progress · 12 m away</p>
        </div>
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted mb-1">Reason shown to citizen *</label>
          <textarea id="outcome-duplicate-reason" rows="2" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.outcomeModal.duplicateReason}</textarea>
        </div>
        <div class="flex items-center gap-2">
          ${renderStatusBadge('Duplicate')}
          <span class="text-xs text-luba-textSubtle">Links to original repair progress</span>
        </div>
        <button type="button" data-confirm-duplicate-report="true" class="luba-btn-primary w-full py-3 font-bold">
          Confirm as Duplicate
        </button>
      `
      }

      <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2">
        Cancel
      </button>
    `
  });
}
