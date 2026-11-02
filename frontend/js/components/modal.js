// Modal dialog shell and backdrop frame.

import { SVG_CLOSE_X } from '../data/constants.js';

export function renderModalShell({ title, subtitle = '', bodyHtml }) {
  return `
    <div class="fixed inset-0 z-50 luba-modal-backdrop flex items-center justify-center p-4">
      <div class="luba-modal-dialog p-6 space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-bold text-luba-textPrimary">${title}</h2>
            ${subtitle ? `<p class="text-xs text-luba-textSubtle mt-1">${subtitle}</p>` : ''}
          </div>
          <button type="button" data-close-modal="true" class="text-luba-textSubtle hover:text-luba-textPrimary">${SVG_CLOSE_X}</button>
        </div>
        ${bodyHtml}
      </div>
    </div>
  `;
}
