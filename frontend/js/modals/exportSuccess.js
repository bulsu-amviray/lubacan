// Modal component for Screen 24: Export success dialog
import { renderModalShell } from '../components/modal.js';
import { renderBanner } from '../components/banner.js';
import { renderStatusBadge } from '../components/badge.js';

export function renderExportSuccessModal(state = {}) {
  const isPdf = state?.exportForm?.format === 'PDF';
  const displayFileName = isPdf ? 'LUBA_canFindIT_Malolos_2026-10-21_Summary.pdf' : 'LUBA_canFindIT_Malolos_2026-10-21.xls';

  return renderModalShell({
    title: 'Your export is ready',
    subtitle: 'Generated 21 Oct 2026 · 12:02 PM · Ana Dela Cruz',
    bodyHtml: `
      ${renderBanner({
        variant: 'success',
        title: 'CSV, Excel and PDF generated successfully',
        body: 'The files contain the same citywide snapshot and exclude citizen contact information.'
      })}

      <div class="space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-luba-textPrimary inline-flex items-center gap-2">
            <svg class="w-5 h-5 text-luba-success" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
            ${displayFileName}
          </span>
          ${renderStatusBadge('Approved')}
        </div>
        <p class="text-luba-textSecondary">Dataset · 1,284 reports · City of Malolos (51 barangays) · all statuses</p>
        <p class="text-luba-textSecondary">Excel / CSV size · 246 KB · UTF-8 / XML · 1,284 data rows</p>
        <p class="text-luba-textSecondary">PDF size · 1.8 MB · 59 pages · summary and color-coded table</p>
      </div>

      <button type="button" id="btn-download-local-pdf" class="${isPdf ? 'luba-btn-primary' : 'luba-btn-secondary'} w-full py-3 inline-flex items-center justify-center gap-2">
        <svg class="w-4 h-4 fill-none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
        Save as PDF file (.pdf)
      </button>

      <button type="button" id="btn-download-local-csv" class="${!isPdf ? 'luba-btn-primary' : 'luba-btn-secondary'} w-full py-2.5 inline-flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
        Save as Excel / CSV (.xls & .csv)
      </button>

      <p class="text-[11px] text-luba-textSubtle">Files download directly to your local computer. Exports are recorded in the workspace audit log.</p>

      <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
        Back to analytics
      </button>
    `
  });
}
