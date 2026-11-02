// Reusable KPI Metric Card component.

export function renderKpiCard({ label, value, subtitle, valueSizeClass = 'luba-kpi-value' }) {
  return `
    <div class="luba-card p-4">
      <p class="text-xs text-luba-textSubtle">${label}</p>
      <p class="${valueSizeClass} mt-1">${value}</p>
      <p class="text-[11px] text-luba-textSubtle mt-1">${subtitle}</p>
    </div>
  `;
}
