// Modal component for Screen 23: Export generation error dialog
import { renderModalShell } from '../components/modal.js';
import { renderBanner } from '../components/banner.js';
import { renderPillButton } from '../components/controls.js';

export function renderExportErrorModal() {
  return renderModalShell({
    title: "We couldn't generate your export",
    bodyHtml: `
      <div class="flex flex-col items-center text-center py-2 space-y-2">
        <div class="w-[72px] h-[72px] rounded-full bg-luba-dangerBg text-luba-danger flex items-center justify-center">
          <div class="w-7 h-7 rounded-md border-[1.8px] border-luba-danger flex items-center justify-center font-bold text-xs">!</div>
        </div>
        <h3 class="text-lg font-bold text-luba-textPrimary">No file was created</h3>
        <p class="text-xs text-luba-textSubtle max-w-sm">The export service timed out before generation finished. Your report data has not changed.</p>
      </div>

      ${renderBanner({
        variant: 'danger',
        title: 'Your selections are retained',
        body: 'You can retry safely with the same scope, or choose another format. No download is available for this attempt.'
      })}

      <div class="border border-luba-border rounded-card p-4 space-y-1.5 text-xs">
        <p class="text-base font-bold text-luba-textPrimary">Selected export</p>
        <p class="text-luba-textSubtle">Format · CSV · UTF-8</p>
        <p class="text-luba-textSubtle">Scope · All reports · 1,284 rows</p>
        <p class="text-luba-textSubtle">All dates through 21 Oct 2026, 12:00 PM PHT</p>
        <p class="text-luba-textSubtle">Citizen personal data excluded</p>
      </div>

      <div class="flex gap-2">
        ${renderPillButton({ label: 'CSV', active: true })}
        ${renderPillButton({ label: 'PDF', active: false })}
      </div>

      <p class="text-[11px] text-luba-textSubtle">Support reference · EXP-MALOLOS-20261021-1203. Do not attach citizen contact details when requesting help.</p>

      <button type="button" id="btn-retry-generate-export" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        Retry generation
      </button>
      <button type="button" data-open-modal="export_dialog" class="luba-btn-secondary w-full py-2.5">
        Change format / scope
      </button>
      <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
        Back to analytics
      </button>
    `
  });
}
