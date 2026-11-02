// Modal component for Screen 21: Date-range filters modal (validation error state)
import { renderModalShell } from '../components/modal.js';
import { renderPillButton } from '../components/controls.js';
import { renderBanner } from '../components/banner.js';

export function renderDateRangeModal(state) {
  const { fromDate, toDate } = state.analyticsState;
  const isInvalid = fromDate === '21 Oct 2026' && toDate === '19 Oct 2026';

  const days = [
    ['28', '29', '30', '1', '2', '3', '4'],
    ['5', '6', '7', '8', '9', '10', '11'],
    ['12', '13', '14', '15', '16', '17', '18'],
    ['19', '20', '21', '22', '23', '24', '25'],
    ['26', '27', '28', '29', '30', '31', '1']
  ];

  return renderModalShell({
    title: 'Choose a date range',
    bodyHtml: `
      <div class="flex gap-2">
        ${['Today', 'Last 7 days', 'This month', 'Custom']
          .map((p) =>
            renderPillButton({
              label: p,
              active: state.analyticsState.preset === p,
              dataAttr: `data-date-preset="${p}"`
            })
          )
          .join('')}
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted">From · inclusive PHT *</label>
          <input type="text" id="date-from-input" value="${fromDate}" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none"/>
        </div>
        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted">To · inclusive PHT *</label>
          <input type="text" id="date-to-input" value="${toDate}" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none"/>
        </div>
      </div>

      <div class="bg-luba-canvas rounded-card p-4 space-y-2.5">
        <div class="flex items-center justify-between text-xs font-bold text-luba-textPrimary px-2">
          <span>‹</span>
          <span>October 2026</span>
          <span>›</span>
        </div>
        <div class="grid grid-cols-7 text-center text-[11px] text-luba-textSubtle">
          <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
        </div>
        <div class="space-y-1.5">
          ${days
            .map(
              (week) => `
            <div class="grid grid-cols-7 gap-1.5 text-center text-xs">
              ${week
                .map((d) => {
                  const highlighted = ['19', '20', '21'].includes(d);
                  return `<span class="py-1.5 rounded ${
                    highlighted ? 'bg-luba-infoPillBg font-bold text-luba-textPrimary' : 'bg-white text-luba-textPrimary'
                  }">${d}</span>`;
                })
                .join('')}
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      ${
        isInvalid
          ? renderBanner({
              variant: 'danger',
              title: 'Invalid range · end precedes start',
              body: 'Choose a To date on or after 21 Oct, or set From to 19 Oct. No filter has been applied; the all-report snapshot remains unchanged.'
            })
          : renderBanner({
              variant: 'success',
              title: 'Valid date range',
              body: 'Inclusive PHT filter ready to apply.'
            })
      }

      <p class="text-[11px] text-luba-textSubtle">Includes 00:00:00 on From through 23:59:59 on To, Asia/Manila (UTC+8). This filter uses report submission dates.</p>

      <button
        type="button"
        ${isInvalid ? 'disabled' : 'data-close-modal="true"'}
        class="w-full py-2.5 ${isInvalid ? 'luba-btn-disabled' : 'luba-btn-primary'}"
      >
        Apply range
      </button>

      <div class="grid grid-cols-2 gap-3">
        <button type="button" data-reset-dates="true" class="luba-btn-secondary py-2.5">
          Reset
        </button>
        <button type="button" data-close-modal="true" class="luba-btn-secondary py-2.5">
          Cancel
        </button>
      </div>
    `
  });
}
