// Interactive control primitives: pill buttons, toggle switches, and green checklist items.

export function renderPillButton({ label, active = false, dataAttr = '' }) {
  return `<button type="button" ${dataAttr} class="luba-pill ${active ? 'luba-pill-active' : ''}">${label}</button>`;
}

export function renderToggleSwitch(checked, dataAttr, locked = false, showLabel = false) {
  if (locked) {
    return `
      <div class="flex flex-col items-center select-none">
        <button type="button" disabled class="w-11 h-6 rounded-full bg-luba-navy relative transition cursor-not-allowed opacity-90">
          <span class="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm pointer-events-none"></span>
        </button>
        ${showLabel ? '<span class="text-[11px] text-luba-textMuted font-medium mt-1">On</span>' : ''}
      </div>
    `;
  }
  return `
    <div class="flex flex-col items-center select-none">
      <button type="button" ${dataAttr} class="w-11 h-6 rounded-full ${checked ? 'bg-luba-navy' : 'bg-[#E2E8F0]'} relative transition cursor-pointer">
        <span class="w-4 h-4 rounded-full bg-white absolute top-1 ${checked ? 'right-1' : 'left-1'} shadow-sm transition-all pointer-events-none"></span>
      </button>
      ${showLabel ? `<span class="text-[11px] text-luba-textMuted font-medium mt-1">${checked ? 'On' : 'Off'}</span>` : ''}
    </div>
  `;
}

export function renderGreenCheckItem(label, extraAttrs = '', checked = true) {
  const isChecked = Boolean(checked);
  return `
    <div ${extraAttrs} class="flex items-center gap-2.5 text-xs text-luba-textPrimary ${extraAttrs ? 'cursor-pointer hover:opacity-80 select-none' : ''}">
      <span class="w-4 h-4 rounded border ${isChecked ? 'border-luba-success bg-white text-luba-success' : 'border-luba-border bg-white text-transparent'} inline-flex items-center justify-center shrink-0 transition-colors">
        <svg class="w-3 h-3 ${isChecked ? 'opacity-100' : 'opacity-0'}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </span>
      <span>${label}</span>
    </div>
  `;
}
