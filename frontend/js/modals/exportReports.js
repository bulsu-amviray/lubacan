// Modal component for Screen 22: Export CSV or PDF dialog
import { renderModalShell } from '../components/modal.js';
import { renderPillButton, renderGreenCheckItem } from '../components/controls.js';
import { renderBanner } from '../components/banner.js';

export function renderExportReportsModal(state) {
  const ef = state.exportForm;
  return renderModalShell({
    title: 'Export reports',
    subtitle: 'Choose your format and scope before generating a file.',
    bodyHtml: `
      <div class="flex gap-2">
        ${['CSV', 'PDF']
          .map((fmt) =>
            renderPillButton({
              label: fmt,
              active: ef.format === fmt,
              dataAttr: `data-export-format="${fmt}"`
            })
          )
          .join('')}
      </div>

      <div class="flex gap-2">
        ${['Current filters', 'All reports']
          .map((sc) =>
            renderPillButton({
              label: sc,
              active: ef.scope === sc,
              dataAttr: `data-export-scope="${sc}"`
            })
          )
          .join('')}
      </div>

      <div class="luba-field-box">
        <p class="text-[11px] text-luba-textMuted">Date range</p>
        <p class="text-xs text-luba-textPrimary mt-1">All dates through 21 Oct 2026 · 12:00 PM PHT</p>
      </div>

      <p class="text-[11px] text-luba-textSubtle">All reports · 1,284 rows · all barangays and statuses. Current filters would use only the active valid filters.</p>

      <div class="border border-luba-border rounded-card p-4 space-y-2.5 text-xs">
        <h3 class="text-base font-bold text-luba-textPrimary">Include in export</h3>
        ${renderGreenCheckItem('Report ID, road, barangay and coordinates')}
        ${renderGreenCheckItem('Severity, status and lifecycle timestamps')}
        ${renderGreenCheckItem('Assigned team and repair summary')}
        ${renderGreenCheckItem('PDF: summary and aggregate charts')}
        <label class="flex items-center gap-2.5 text-luba-textPrimary cursor-pointer pt-0.5">
          <input type="checkbox" id="chk-export-pii" ${ef.includeCitizenPii ? 'checked' : ''} class="accent-luba-navy w-4 h-4 rounded border-luba-border"/>
          <span>Citizen name, email and phone</span>
        </label>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Personal data excluded by default',
        body: 'Citizen contact details and private support messages are not included. Access rules still apply to all exports.'
      })}

      <p class="text-[11px] text-luba-textSubtle">CSV uses UTF-8 data columns. PDF uses a readable summary. Export generation is recorded in the audit log.</p>

      <button type="button" id="btn-submit-generate-export" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
        ${ef.format === 'PDF' ? 'Generate PDF' : 'Generate Excel / CSV'}
      </button>
      <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
        Cancel export
      </button>
    `
  });
}
