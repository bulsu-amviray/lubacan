import { store, SCREEN_CATALOG } from './state/store.js';
import { apiService, downloadCsvToLocalMachine, triggerLocalCsvDownload } from './services/api.service.js';

const PH_MOBILE_REGEX = /^\+63\s?9\d{2}\s?\d{3}\s?\d{4}$/;

/* ============================================================================
 * SHARED REUSABLE UI COMPONENTS (Badge, Banner, Card, Pill, Modal, Schematic Map)
 * Zero hard-coded hex values — all colors use centralized luba.* tokens & CSS vars
 * ========================================================================== */

const SVG_CHEVRON_DOWN = `<svg class="w-3 h-3 text-luba-textPrimary inline-block ml-1" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>`;
const SVG_CHEVRON_UP = `<svg class="w-3 h-3 text-luba-textPrimary inline-block ml-1" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 15l-6-6-6 6"/></svg>`;
const SVG_CLOSE_X = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>`;

export function renderStatusBadge(status) {
  const variantMap = {
    'Submitted':       'luba-badge-info bg-luba-infoPillBg text-luba-info',
    'Under Review':    'luba-badge-warning bg-luba-warningBg text-luba-warningText',
    'Verified':        'luba-badge-info bg-luba-infoPillBg text-luba-info',
    'Assigned':        'luba-badge-info bg-luba-infoPillBg text-luba-info',
    'In Progress':     'luba-badge-info bg-luba-infoPillBg text-luba-info',
    'Resolved':        'luba-badge-success bg-luba-successBg text-luba-success',
    'Rejected':        'luba-badge-danger bg-luba-dangerBg text-luba-danger',
    'Duplicate':       'luba-badge-neutral bg-luba-neutralBg text-luba-neutralText',
    'Active':          'luba-badge-success bg-luba-successBg text-luba-success',
    'Approved':        'luba-badge-success bg-luba-successBg text-luba-success',
    'Awaiting review': 'luba-badge-warning bg-luba-warningBg text-luba-warningText'
  };
  const cls = variantMap[status] || 'luba-badge-neutral bg-luba-neutralBg text-luba-neutralText';
  return `<span class="luba-badge ${cls}">${status}</span>`;
}

export function renderSeverityBadge(severity, asPill = true) {
  if (!asPill) {
    const textColors = {
      High: 'text-luba-danger',
      Medium: 'text-luba-warningText',
      Low: 'text-luba-info'
    };
    return `<span class="text-xs font-bold ${textColors[severity] || 'text-luba-textPrimary'}">${severity}</span>`;
  }
  const pillStyles = {
    High: 'luba-badge-danger bg-luba-dangerBg text-luba-danger',
    Medium: 'luba-badge-warning bg-luba-warningBg text-luba-warningText',
    Low: 'luba-badge-info bg-luba-infoPillBg text-luba-info'
  };
  return `<span class="luba-badge ${pillStyles[severity] || ''}">${severity}</span>`;
}

export function renderStatusTextColor(status) {
  const map = {
    'Submitted': 'text-luba-info',
    'Under Review': 'text-luba-warningText',
    'Verified': 'text-luba-info',
    'Assigned': 'text-luba-info',
    'In Progress': 'text-luba-info',
    'Resolved': 'text-luba-success',
    'Rejected': 'text-luba-danger',
    'Duplicate': 'text-luba-info'
  };
  return `<span class="text-xs font-bold ${map[status] || 'text-luba-textPrimary'}">${status}</span>`;
}

export function renderBanner({ variant = 'info', title, body, extraClass = '', extraAttrs = '' }) {
  const variantClasses = {
    info:    'luba-banner luba-banner-info bg-luba-infoBg border-luba-infoBorder text-luba-infoText',
    warning: 'luba-banner luba-banner-warning bg-luba-warningBg border-luba-warningBorder text-luba-warningText',
    success: 'luba-banner luba-banner-success bg-luba-successBg border-luba-successBorder text-luba-success',
    danger:  'luba-banner luba-banner-danger bg-luba-dangerBg border-luba-dangerBorder text-luba-danger'
  };
  const cls = variantClasses[variant] || variantClasses.info;
  return `
    <div ${extraAttrs} class="${cls} ${extraClass}">
      <p class="text-xs font-bold">${title}</p>
      <p class="text-xs mt-0.5 leading-relaxed">${body}</p>
    </div>
  `;
}

export function renderKpiCard({ label, value, subtitle, valueSizeClass = 'luba-kpi-value' }) {
  return `
    <div class="luba-card p-4">
      <p class="text-xs text-luba-textSubtle">${label}</p>
      <p class="${valueSizeClass} mt-1">${value}</p>
      <p class="text-[11px] text-luba-textSubtle mt-1">${subtitle}</p>
    </div>
  `;
}

export function renderPillButton({ label, active = false, dataAttr = '' }) {
  return `<button type="button" ${dataAttr} class="luba-pill ${active ? 'luba-pill-active' : ''}">${label}</button>`;
}

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

export function renderToggleSwitch(checked, dataAttr, locked = false, showLabel = false) {
  if (locked) {
    return `
      <div class="flex flex-col items-center">
        <button type="button" disabled class="w-[42px] h-6 rounded-full bg-luba-info relative transition cursor-not-allowed">
          <span class="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm"></span>
        </button>
        ${showLabel ? '<span class="text-[11px] text-luba-textSubtle mt-1">On</span>' : ''}
      </div>
    `;
  }
  return `
    <div class="flex flex-col items-center">
      <button type="button" ${dataAttr} class="w-[42px] h-6 rounded-full ${checked ? 'bg-luba-info' : 'bg-luba-controlTrack'} relative transition">
        <span class="w-4 h-4 rounded-full bg-white absolute top-1 ${checked ? 'right-1' : 'left-1'} shadow-sm transition-all"></span>
      </button>
      ${showLabel ? `<span class="text-[11px] text-luba-textSubtle mt-1">${checked ? 'On' : 'Off'}</span>` : ''}
    </div>
  `;
}

export function renderGreenCheckItem(label, extraAttrs = '') {
  return `
    <div ${extraAttrs} class="flex items-center gap-2.5 text-xs text-luba-textPrimary ${extraAttrs ? 'cursor-pointer hover:opacity-80' : ''}">
      <span class="w-4 h-4 rounded border border-luba-success bg-white text-luba-success inline-flex items-center justify-center shrink-0">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </span>
      <span>${label}</span>
    </div>
  `;
}

/**
 * Phase 4.2 Production Schematic Map Component (SVG + Severity Pin Overlay)
 * Zero external map tile dependencies; matches Overview, Report Details, Duplicate Comparison, and Pothole Map PNGs 1:1.
 */
export function renderSchematicMap({
  caption = 'LUBA canFindIT · Illustrative map / QC',
  showPinLabels = false,
  mode = 'standard', // 'standard' | 'comparison' | 'tall'
  selectedPin = 'RW-2026-0842'
} = {}) {
  const heightClass = mode === 'tall' ? 'h-[470px]' : 'h-[288px]';

  const pinsHtml =
    mode === 'comparison'
      ? `
        <button type="button" data-pin-select="RW-2026-0819" class="absolute top-[33%] left-[51%] flex items-center gap-1.5 group">
          <span class="w-4 h-4 rounded-full bg-luba-danger ring-[3px] ring-white shadow"></span>
          <span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-danger shadow-sm border border-luba-border">0819 · High</span>
        </button>
        <button type="button" data-pin-select="RW-2026-0842" class="absolute top-[52%] left-[37%] flex items-center gap-1.5 group">
          <span class="w-4 h-4 rounded-full bg-luba-danger ring-[3px] ring-white shadow"></span>
          <span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-danger shadow-sm border border-luba-border">0842 · High</span>
        </button>
        <button type="button" data-pin-select="RW-2026-0839" class="absolute bottom-[18%] left-[23%] flex items-center gap-1.5 group">
          <span class="w-4 h-4 rounded-full bg-luba-info ring-[3px] ring-white shadow"></span>
          <span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-info shadow-sm border border-luba-border">Low</span>
        </button>
      `
      : `
        <button type="button" data-pin-select="RW-2026-0841" class="absolute top-[30%] left-[51%] flex items-center gap-1.5">
          <span class="w-4 h-4 rounded-full bg-luba-cta ring-[3px] ring-white shadow"></span>
          ${showPinLabels ? '<span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-cta shadow-sm">Medium</span>' : ''}
        </button>
        <button type="button" data-pin-select="RW-2026-0842" class="absolute top-[51%] left-[37%] flex items-center gap-1.5">
          <span class="w-4 h-4 rounded-full bg-luba-danger ring-[3px] ${selectedPin === 'RW-2026-0842' ? 'ring-white scale-105' : 'ring-white'} shadow"></span>
          ${showPinLabels ? '<span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-danger shadow-sm">High</span>' : ''}
        </button>
        <button type="button" data-pin-select="RW-2026-0839" class="absolute bottom-[20%] left-[23%] flex items-center gap-1.5">
          <span class="w-4 h-4 rounded-full bg-luba-info ring-[3px] ring-white shadow"></span>
          ${showPinLabels ? '<span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-info shadow-sm">Low</span>' : ''}
        </button>
        ${
          !showPinLabels
            ? `<span class="absolute bottom-[20%] left-[35%] w-4 h-4 rounded-full bg-luba-mapCluster ring-2 ring-white flex items-center justify-center"><span class="w-1.5 h-1.5 rounded-full bg-luba-info"></span></span>`
            : ''
        }
      `;

  return `
    <div class="relative w-full ${heightClass} bg-luba-mapBg rounded-card border border-luba-border overflow-hidden select-none">
      <div class="absolute top-6 left-8 w-44 h-28 bg-luba-mapPark1 rounded-[18px]"></div>
      <div class="absolute bottom-6 right-12 w-56 h-36 bg-luba-mapPark2 rounded-[18px]"></div>
      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="none">
        <path d="M 0 180 Q 320 140 720 165" class="luba-map-road-stroke" stroke-width="14" fill="none"/>
        <path d="M 240 68 L 580 68 L 570 250 L 280 235 Z" class="luba-map-road-stroke" stroke-width="8" fill="none"/>
        <path d="M 195 320 L 458 0" class="luba-map-road-stroke" stroke-width="22" fill="none"/>
        <path d="M 190 320 L 453 0" class="luba-map-corridor-stroke" stroke-width="3" fill="none"/>
        <path d="M 202 320 L 465 0" class="luba-map-corridor-stroke" stroke-width="3" fill="none"/>
      </svg>
      <span class="absolute top-11 left-60 text-xs font-bold text-luba-textPrimary">Commonwealth Ave</span>
      <span class="absolute top-8 right-52 text-[11px] font-semibold uppercase tracking-wider text-luba-textSubtle">BATASAN HILLS</span>
      <span class="absolute top-28 left-14 text-xs font-semibold text-luba-textMuted">Batasan Road</span>
      <span class="absolute bottom-16 left-[43%] text-xs font-semibold text-luba-textMuted">IBP Road</span>
      <span class="absolute bottom-10 right-36 text-xs text-luba-textSubtle">Batasan grounds</span>

      ${pinsHtml}

      <button type="button" title="Recenter map" class="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-lg bg-white border border-luba-border flex items-center justify-center text-luba-textPrimary shadow-sm hover:bg-luba-canvas">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
        </svg>
      </button>
      <span class="absolute bottom-2.5 left-3.5 text-[10px] text-luba-textSubtle">${caption}</span>
    </div>
  `;
}

function renderStatusDistributionCard() {
  const statusRows = [
    { label: 'Submitted',    count: 56,  pct: 8,   minW: '18px', color: 'bg-luba-info' },
    { label: 'Under Review', count: 42,  pct: 6,   minW: '14px', color: 'bg-luba-info' },
    { label: 'Verified',     count: 186, pct: 26,  minW: '24px', color: 'bg-luba-info' },
    { label: 'Assigned',     count: 128, pct: 18,  minW: '20px', color: 'bg-luba-info' },
    { label: 'In Progress',  count: 214, pct: 31,  minW: '28px', color: 'bg-luba-cta' },
    { label: 'Resolved',     count: 620, pct: 72,  minW: '40px', color: 'bg-luba-success' },
    { label: 'Rejected',     count: 24,  pct: 3.2, minW: '10px', color: 'bg-luba-info' },
    { label: 'Duplicate',    count: 14,  pct: 2.2, minW: '9px',  color: 'bg-luba-info' }
  ];

  return `
    <div class="luba-card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-luba-textPrimary">Reports by status</h2>
        <span class="text-xs text-luba-textSubtle">1,284 total</span>
      </div>
      <div class="space-y-3">
        ${statusRows
          .map(
            (r) => `
          <div class="grid grid-cols-12 items-center gap-2 text-xs">
            <span class="col-span-3 text-luba-textSubtle">${r.label}</span>
            <div class="col-span-8 h-[7px] bg-luba-tableHeader rounded-full overflow-hidden">
              <div class="h-full ${r.color} rounded-full" style="width: ${r.pct}%; min-width: ${r.minW}"></div>
            </div>
            <span class="col-span-1 text-right font-semibold text-luba-textPrimary">${r.count}</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderSeverityDistributionCard() {
  return `
    <div class="luba-card p-5">
      <h2 class="text-base font-bold text-luba-textPrimary">Severity distribution</h2>
      <p class="luba-kpi-value mt-1">1,284</p>
      <p class="text-xs text-luba-textSubtle mb-3">Total reports · All severities</p>
      <div class="w-full h-6 rounded-[6px] overflow-hidden flex gap-[2px] mb-4">
        <div class="bg-luba-danger h-full" style="width: 32.1%"></div>
        <div class="bg-luba-cta h-full" style="width: 44.2%"></div>
        <div class="bg-luba-info h-full" style="width: 23.7%"></div>
      </div>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between"><span class="font-bold text-luba-danger">High</span><span class="text-luba-textSubtle">412 · 32.1%</span></div>
        <div class="flex justify-between"><span class="font-bold text-luba-cta">Medium</span><span class="text-luba-textSubtle">568 · 44.2%</span></div>
        <div class="flex justify-between"><span class="font-bold text-luba-info">Low</span><span class="text-luba-textSubtle">304 · 23.7%</span></div>
      </div>
      <p class="text-[11px] text-luba-textSubtle mt-3">All reports · citywide · October 2026 snapshot</p>
    </div>
  `;
}

/* ============================================================================
 * VIEW 1: Admin · Operations overview.png
 * ========================================================================== */
function renderOverviewView() {
  return `
    <div class="space-y-5">
      <!-- Page Header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">City road operations</h1>
          <p class="luba-page-subtitle">Quezon City · All reports · Snapshot as of 21 October 2026, 12:00 PM</p>
        </div>
        <button type="button" data-open-modal="export_dialog" class="luba-btn-secondary inline-flex items-center gap-2 px-4 py-2.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          Export summary
        </button>
      </div>

      <!-- Info Callout Banner (var(--luba-info-bg) fill, var(--luba-info-border) border, var(--luba-info-text) text, 10px radius) -->
      ${renderBanner({
        variant: 'info',
        title: '98 reports need a first review',
        body: '56 Submitted + 42 Under Review · Prioritize high-severity reports and roads with heavy traffic.'
      })}

      <!-- 5 KPI Cards Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        ${renderKpiCard({ label: 'Total reports', value: '1,284', subtitle: 'All statuses · citywide' })}
        ${renderKpiCard({ label: 'Pending review', value: '98', subtitle: '56 submitted · 42 under review' })}
        ${renderKpiCard({ label: 'Verified', value: '186', subtitle: 'Ready for team assignment' })}
        ${renderKpiCard({ label: 'In progress', value: '214', subtitle: 'Active work / repair review' })}
        ${renderKpiCard({ label: 'Resolved', value: '620', subtitle: 'LGU-approved repairs only' })}
      </div>

      <!-- Status & Severity Distribution Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-6">
          ${renderStatusDistributionCard()}
        </div>

        <div class="lg:col-span-6 space-y-4">
          ${renderSeverityDistributionCard()}

          <div class="grid grid-cols-2 gap-4">
            ${renderKpiCard({ label: 'Assigned', value: '128', subtitle: 'Awaiting work start' })}
            ${renderKpiCard({ label: 'Closed exceptions', value: '38', subtitle: '24 rejected · 14 duplicate' })}
          </div>
        </div>
      </div>

      <!-- Bottom Map & Needs Attention Row -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-1">
        <div class="lg:col-span-8 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-luba-textPrimary">Pothole map</h2>
            <button type="button" data-screen-jump="13" class="luba-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5">
              <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
              <span>Citywide</span>
            </button>
          </div>
          ${renderSchematicMap({ showPinLabels: false })}
          <div class="flex items-center gap-2 text-xs">
            ${renderSeverityBadge('High')}
            ${renderSeverityBadge('Medium')}
            ${renderSeverityBadge('Low')}
            <span class="text-luba-textSubtle ml-1">Batasan Hills cluster</span>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-3">
          <h2 class="text-base font-bold text-luba-textPrimary">Needs attention</h2>
          <div class="luba-card p-4 space-y-2.5">
            ${renderStatusBadge('Awaiting review')}
            <p class="text-sm font-bold text-luba-textPrimary">2 repairs ready for inspection</p>
            <p class="text-xs text-luba-textSubtle">Review before closing the report.</p>
            <button type="button" data-screen-jump="11" class="luba-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-5-5l5 5-5 5"/></svg>
              Review completion
            </button>
          </div>
          <div class="luba-card p-4 space-y-2">
            ${renderSeverityBadge('High')}
            <p class="text-sm font-bold text-luba-textPrimary">Batasan Road</p>
            <p class="text-xs text-luba-textSubtle leading-relaxed">RW-2026-0840 · In Progress · QC North · Team Bravo</p>
            <button type="button" data-screen-jump="2" class="text-xs font-bold text-luba-cta hover:underline inline-flex items-center gap-1">
              View priority reports →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 2: Admin · Reports management.png
 * ========================================================================== */
function renderReportsListView(state) {
  const pills = [
    'All reports 1,284',
    'Pending review 98',
    'Verified 186',
    'Assigned 128',
    'In Progress 214',
    'Resolved 620'
  ];

  const q = state.reportFilters.search.trim().toLowerCase();
  const filteredReports = state.reports.filter((r) => {
    if (q && !(`${r.code} ${r.road} ${r.barangay}`.toLowerCase().includes(q))) {
      return false;
    }
    if (state.reportFilters.status !== 'All statuses' && r.status !== state.reportFilters.status) {
      return false;
    }
    if (state.reportFilters.severity !== 'All severities' && r.severity !== state.reportFilters.severity) {
      return false;
    }
    return true;
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Reports management</h1>
          <p class="luba-page-subtitle">All citizen reports · Workflow snapshot: 19 October 2026, 9:45 AM</p>
        </div>
        <button type="button" data-open-modal="export_dialog" class="luba-btn-secondary inline-flex items-center gap-2 px-4 py-2.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          Export reports
        </button>
      </div>

      <!-- 6 Status Filter Pills -->
      <div class="flex flex-wrap gap-2">
        ${pills
          .map((pill) =>
            renderPillButton({
              label: pill,
              active: state.reportFilters.pill === pill,
              dataAttr: `data-report-pill="${pill}"`
            })
          )
          .join('')}
      </div>

      <!-- Search & Dropdown Controls -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[260px] flex items-center gap-2.5 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="text" id="reports-search-input" value="${state.reportFilters.search}" placeholder="Search reports, roads or report ID" class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle focus:outline-none bg-transparent"/>
        </div>

        <label class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <select id="reports-status-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary focus:outline-none cursor-pointer">
            ${['All statuses', 'Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Duplicate']
              .map((s) => `<option value="${s}" ${state.reportFilters.status === s ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </label>

        <label class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <select id="reports-severity-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary focus:outline-none cursor-pointer">
            ${['All severities', 'High', 'Medium', 'Low']
              .map((s) => `<option value="${s}" ${state.reportFilters.severity === s ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </label>

        <button type="button" data-open-modal="date_range" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          October 2026
        </button>
      </div>

      <div class="flex items-center justify-between text-xs">
        <span class="text-luba-textSubtle">1,284 reports · Newest first · All barangays</span>
        <button type="button" data-reset-report-filters="true" class="font-bold text-luba-cta hover:underline">Reset filters</button>
      </div>

      <!-- 8-Row Reports Table -->
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">REPORT ID</th>
              <th class="py-3 px-4">ROAD</th>
              <th class="py-3 px-4">BARANGAY</th>
              <th class="py-3 px-4">SEVERITY</th>
              <th class="py-3 px-4">STATUS</th>
              <th class="py-3 px-4">REPORTED</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${filteredReports
              .map(
                (r) => `
              <tr class="luba-table-row">
                <td class="py-4 px-4">
                  <button type="button" data-open-report="${r.code}" class="font-bold text-luba-info hover:underline">${r.code}</button>
                </td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.road}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.barangay}</td>
                <td class="py-4 px-4">${renderSeverityBadge(r.severity, false)}</td>
                <td class="py-4 px-4">${renderStatusTextColor(r.status)}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.reportedDate}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination Row -->
      <div class="flex flex-wrap items-center justify-between gap-4 text-xs text-luba-textSubtle">
        <span>Showing 1–8 of 1,284 results</span>
        <div class="flex items-center gap-1.5">
          <button type="button" class="px-3 py-1.5 bg-white border border-luba-border rounded-control text-luba-textSubtle">Previous</button>
          <button type="button" class="w-8 h-8 rounded-control bg-luba-navy text-white font-bold">1</button>
          <button type="button" class="w-8 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">2</button>
          <button type="button" class="w-8 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">3</button>
          <span class="px-2 bg-white border border-luba-border rounded-control h-8 inline-flex items-center text-luba-textPrimary">…</span>
          <button type="button" class="px-2.5 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">161</button>
          <button type="button" class="px-3 py-1.5 bg-white border border-luba-border rounded-control text-luba-textPrimary">Next</button>
        </div>
      </div>

      <!-- Report Lifecycle & Exception Statuses Legend Card -->
      <div class="luba-card p-5 space-y-3">
        <p class="text-xs font-bold text-luba-textPrimary">Report lifecycle & exception statuses</p>
        <div class="flex flex-wrap gap-2">
          ${['Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Duplicate']
            .map((s) => renderStatusBadge(s))
            .join('')}
        </div>
        <p class="text-xs text-luba-textSubtle">Resolved means the LGU has approved the repair. Submitted repair evidence remains In Progress until that review.</p>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 3: Admin · Report details.png
 * ========================================================================== */
function renderReportDetailsView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">RW-2026-0842</h1>
          <p class="luba-page-subtitle">Report details · Received 19 October 2026 at 9:24 AM</p>
        </div>
        <div class="flex items-center gap-2.5">
          <button type="button" data-screen-jump="2" class="luba-btn-secondary px-4 py-2.5">
            ← Back to reports
          </button>
          <button type="button" data-screen-jump="4" class="luba-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            Start verification
          </button>
        </div>
      </div>

      <!-- Sub-navigation Tabs -->
      <div class="flex flex-wrap gap-2">
        ${renderPillButton({ label: 'Report details', active: true, dataAttr: 'data-screen-jump="3"' })}
        ${renderPillButton({ label: 'Verification', active: false, dataAttr: 'data-screen-jump="4"' })}
        ${renderPillButton({ label: 'Assignment', active: false, dataAttr: 'data-screen-jump="10"' })}
        ${renderPillButton({ label: 'Activity log', active: false, dataAttr: 'data-screen-jump="12"' })}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <!-- Left 8 cols -->
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="/assets/pothole-citizen.jpg" alt="Commonwealth Avenue pothole photo" class="w-full h-[304px] object-cover"/>
          </div>

          <div class="luba-card p-5 space-y-3">
            <div class="flex items-start justify-between">
              <h2 class="text-lg font-bold text-luba-textPrimary">Commonwealth Avenue</h2>
              ${renderStatusBadge('Under Review')}
            </div>
            <p class="text-xs text-luba-textSubtle">Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City</p>
            <p class="text-xs text-luba-textPrimary leading-relaxed">Deep pothole on the northbound service road near IBP Road. Motorcycles are swerving around it; water collects after rain.</p>
            <div class="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p class="text-[11px] text-luba-textSubtle mb-1">Citizen-reported severity</p>
                ${renderSeverityBadge('High')}
              </div>
              <div>
                <p class="text-[11px] text-luba-textSubtle mb-1">Evidence</p>
                <p class="text-xs font-bold text-luba-textPrimary">1 photo · 2.4 MB</p>
              </div>
            </div>
          </div>

          <div class="space-y-2.5">
            <h3 class="text-base font-bold text-luba-textPrimary">Location evidence</h3>
            ${renderSchematicMap({ showPinLabels: false })}
            <p class="text-xs text-luba-textSecondary">Coordinates · 14.6978° N, 121.0881° E · GPS accuracy ±8 m</p>
          </div>
        </div>

        <!-- Right 4 cols -->
        <div class="lg:col-span-4 space-y-5">
          <div class="luba-card p-5 space-y-2.5">
            <h3 class="text-base font-bold text-luba-textPrimary">Submitted by</h3>
            <p class="text-xs text-luba-textSecondary">Citizen · Mika Reyes</p>
            <p class="text-xs text-luba-textSecondary">Email · mika.reyes@example.com</p>
            <p class="text-xs text-luba-textSecondary">Mobile · +63 917 000 0184</p>
            <p class="text-xs text-luba-textSecondary">Submitted · 19 Oct 2026 · 9:24 AM</p>
            ${renderBanner({
              variant: 'info',
              title: 'Restricted personal data',
              body: 'Visible only to authorized LGU staff.',
              extraClass: 'mt-2'
            })}
          </div>

          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Activity & history</h3>
            <div class="space-y-3 text-xs">
              <div class="border-l-2 border-luba-success pl-3">
                <p class="font-bold text-luba-success">Submitted · 19 Oct · 9:24 AM</p>
                <p class="text-luba-textSubtle">Report received from Mika Reyes.</p>
              </div>
              <div class="border-l-2 border-luba-success pl-3">
                <p class="font-bold text-luba-success">Under Review · 19 Oct · 9:31 AM</p>
                <p class="text-luba-textSubtle">Location and photo checked.</p>
              </div>
              <div class="border-l-2 border-luba-border pl-3">
                <p class="font-semibold text-luba-textMuted">Verified · Pending</p>
                <p class="text-luba-textSubtle">Updates will appear here.</p>
              </div>
              <div class="border-l-2 border-luba-border pl-3">
                <p class="font-semibold text-luba-textMuted">Assigned · Pending</p>
                <p class="text-luba-textSubtle">Updates will appear here.</p>
              </div>
              <div class="border-l-2 border-luba-border pl-3">
                <p class="font-semibold text-luba-textMuted">In Progress · Pending</p>
                <p class="text-luba-textSubtle">Updates will appear here.</p>
              </div>
              <div class="border-l-2 border-luba-border pl-3">
                <p class="font-semibold text-luba-textMuted">Resolved · Pending</p>
                <p class="text-luba-textSubtle">Updates will appear here.</p>
              </div>
            </div>
          </div>

          <button type="button" data-open-modal="export_dialog" class="luba-btn-secondary w-full py-2.5 inline-flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
            Download report PDF
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 4: Admin · Verification review.png
 * ========================================================================== */
function renderVerificationReviewView(state) {
  const vf = state.verificationForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Verify citizen report</h1>
          <p class="luba-page-subtitle">RW-2026-0842 · 19 October 2026, 10:15 AM · Reviewer: Ana Dela Cruz</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          ← Back to report
        </button>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Under Review → Verified',
        body: 'Confirm the photo, road location, severity and possible duplicates before approving. Approval does not mark a report as repaired.'
      })}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="/assets/pothole-citizen.jpg" alt="Commonwealth Avenue pothole" class="w-full h-[304px] object-cover"/>
          </div>

          <div class="luba-card p-5 space-y-2.5">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-luba-textPrimary">Commonwealth Avenue</h2>
              ${renderStatusBadge('Under Review')}
            </div>
            <p class="text-xs text-luba-textSubtle">Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City</p>
            <p class="text-xs text-luba-textPrimary">Citizen · Mika Reyes · 19 Oct, 9:24 AM</p>
            <p class="text-xs text-luba-textPrimary">Deep pothole near IBP Road. Motorcycles are swerving around it; water collects after rain.</p>
          </div>

          ${renderSchematicMap({ showPinLabels: false })}
        </div>

        <div class="lg:col-span-4 space-y-5">
          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Review checklist</h3>
            ${renderGreenCheckItem('Photo clearly shows road damage')}
            ${renderGreenCheckItem('Road and map pin match')}
            ${renderGreenCheckItem('Within Quezon City jurisdiction')}
            ${renderGreenCheckItem('Nearby report RW-2026-0819 checked', 'data-screen-jump="8"')}

            ${renderBanner({
              variant: 'success',
              title: 'Not a duplicate',
              body: 'RW-2026-0819 is on the opposite carriageway, 38 m away.',
              extraClass: 'mt-2 cursor-pointer hover:opacity-95 transition',
              extraAttrs: 'data-screen-jump="8"'
            })}
          </div>

          <div class="luba-card p-5 space-y-4">
            <div>
              <p class="text-xs font-bold text-luba-textPrimary mb-2">Severity *</p>
              <div class="grid grid-cols-3 gap-2.5">
                ${['Low', 'Medium', 'High']
                  .map((sev) => {
                    const active = vf.severity === sev;
                    return `<button type="button" data-select-verify-sev="${sev}" class="py-2.5 rounded-control text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
                      active
                        ? 'border-2 border-luba-cta bg-luba-ctaTint text-luba-cta'
                        : 'border border-luba-border bg-white text-luba-textPrimary hover:bg-luba-canvas'
                    }">${active ? '<span class="w-2 h-2 rounded-full bg-luba-cta"></span>' : ''}${sev}</button>`;
                  })
                  .join('')}
              </div>
              <p class="text-[11px] text-luba-textSubtle mt-2">High: deep damage or an immediate safety risk.</p>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted mb-1">Verification notes *</label>
              <textarea id="verify-notes-input" rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${vf.notes}</textarea>
            </div>

            <button type="button" data-open-modal="approve_report" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              Approve & mark Verified
            </button>

            <div class="flex items-center gap-2.5">
              <button type="button" data-open-modal="reject_report" class="luba-btn-secondary px-4 py-2.5">
                Reject report
              </button>
              <button type="button" data-open-modal="duplicate_outcome" class="luba-btn-secondary px-4 py-2.5">
                Flag duplicate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 8: Admin · Duplicate report comparison.png
 * ========================================================================== */
function renderDuplicateComparisonView(state) {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Compare nearby reports</h1>
          <p class="luba-page-subtitle">Verification snapshot · 19 Oct 2026, 10:10 AM PHT · 38 m apart</p>
        </div>
        <button type="button" data-screen-jump="4" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>

      ${renderBanner({
        variant: 'success',
        title: 'These are different potholes',
        body: 'RW-2026-0842 and RW-2026-0819 are on opposite carriageways. Distance alone is not a duplicate decision.'
      })}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Candidate -->
        <div class="luba-card p-5 space-y-3">
          <h2 class="text-lg font-bold text-luba-textPrimary">Candidate · RW-2026-0842</h2>
          ${renderStatusBadge('Under Review')}
          <img src="/assets/pothole-citizen.jpg" alt="Candidate RW-2026-0842" class="w-full h-[228px] object-cover rounded-lg border border-luba-border"/>
          <p class="text-xs font-bold text-luba-textPrimary">Commonwealth Avenue · Northbound</p>
          <p class="text-xs text-luba-textSubtle">Service road near IBP Road, Batasan Hills</p>
          <p class="text-xs text-luba-textSubtle">14.6978° N, 121.0881° E · Pin A</p>
          ${renderSeverityBadge('High')}
          <p class="text-xs text-luba-textSubtle">0.8 m wide · 12 cm deep · 19 Oct, 9:24 AM</p>
        </div>

        <!-- Existing -->
        <div class="luba-card p-5 space-y-3">
          <h2 class="text-lg font-bold text-luba-textPrimary">Existing · RW-2026-0819</h2>
          ${renderStatusBadge('Assigned')}
          <img src="/assets/pothole-existing.jpg" alt="Existing RW-2026-0819" class="w-full h-[228px] object-cover rounded-lg border border-luba-border"/>
          <p class="text-xs font-bold text-luba-textPrimary">Commonwealth Avenue · Southbound</p>
          <p class="text-xs text-luba-textSubtle">Opposite carriageway near IBP Road</p>
          <p class="text-xs text-luba-textSubtle">14.6980° N, 121.0884° E · Pin B (sample)</p>
          ${renderSeverityBadge('High')}
          <p class="text-xs text-luba-textSubtle">Reported 18 Oct, 4:10 PM · 38 m from candidate</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-2">
          ${renderSchematicMap({ mode: 'comparison' })}
          <p class="text-xs text-luba-textSubtle">Illustrative map · A = 0842 northbound · B = 0819 southbound. Pin positions are schematic; the reported separation is 38 m.</p>
        </div>
        <div class="lg:col-span-4 space-y-3">
          <div class="luba-field-box">
            <label class="block text-[11px] text-luba-textMuted mb-1">Comparison reason *</label>
            <textarea rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.duplicateCompareForm.reason}</textarea>
          </div>
          <button type="button" data-screen-jump="4" class="luba-btn-primary w-full py-3">
            Keep as distinct report
          </button>
          <button type="button" data-open-modal="duplicate_outcome" class="luba-btn-secondary w-full py-2.5">
            Mark as Duplicate...
          </button>
          <p class="text-[11px] text-luba-textSubtle">Duplicate action requires a matching original and citizen-visible reason. Do not use for this pair.</p>
          <p class="text-[11px] text-luba-textSubtle">Actual duplicate example: 0835 → 0826, Aurora Blvd, Project 4 · 12 m apart.</p>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 10: Admin · Assignment review and confirmation.png
 * ========================================================================== */
function renderAssignmentConfirmedView(state) {
  const af = state.assignmentForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Assignment confirmed</h1>
          <p class="luba-page-subtitle">RW-2026-0842 · Assigned 19 October 2026 at 10:30 AM PHT</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>

      ${renderBanner({
        variant: 'success',
        title: 'Verified → Assigned',
        body: 'Ana Dela Cruz assigned QC North · Team Alpha. Work has not started; accepting the task does not mark it In Progress.'
      })}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="/assets/pothole-citizen.jpg" alt="Assigned pothole" class="w-full h-[304px] object-cover"/>
          </div>

          <div class="luba-card p-5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-luba-textPrimary">RW-2026-0842</span>
              ${renderStatusBadge('Assigned')}
            </div>
            <h2 class="text-lg font-bold text-luba-textPrimary">Commonwealth Avenue</h2>
            <p class="text-xs text-luba-textSubtle">Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City</p>
            <p class="text-xs font-medium text-luba-danger">High severity · 0.8 m wide · 12 cm deep</p>
          </div>

          <div class="luba-card p-5 space-y-2">
            <h3 class="text-base font-bold text-luba-textPrimary">Instructions to team</h3>
            <p class="text-xs text-luba-textPrimary leading-relaxed">${af.instructions}</p>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-4">
            <h3 class="text-base font-bold text-luba-textPrimary">Team and target</h3>
            ${renderStatusBadge('Assigned')}
            <div>
              <p class="text-xs font-bold text-luba-textPrimary">QC North · Team Alpha</p>
              <p class="text-xs text-luba-textSubtle mt-0.5">Lead · Engr. Paolo Santos</p>
              <p class="text-xs text-luba-textSubtle mt-0.5">paolo.santos@example.com · 4 crew</p>
            </div>

            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Assignment priority *</p>
              <p class="text-xs font-medium text-luba-textPrimary mt-1 flex items-center gap-1">${af.priority} ${SVG_CHEVRON_UP}</p>
            </div>

            <div class="flex gap-2">
              ${['High', 'Medium', 'Low']
                .map((p) =>
                  renderPillButton({
                    label: p,
                    active: af.priority === p,
                    dataAttr: `data-select-assign-priority="${p}"`
                  })
                )
                .join('')}
            </div>

            <p class="text-[11px] text-luba-textSubtle">Editable priority is separate from verified damage severity. Changing it requires saving an audited update.</p>

            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Target completion *</p>
              <p class="text-xs text-luba-textPrimary mt-1">21 Oct 2026 · 5:00 PM PHT</p>
            </div>

            <button type="button" data-save-priority="true" class="luba-btn-secondary w-full py-2.5">
              Save priority update
            </button>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Notifications recorded',
            body: 'Team task inbox: delivered. Citizen assignment alert: delivered. Email update: queued for the verified address.'
          })}

          <button type="button" data-screen-jump="3" class="luba-btn-primary w-full py-3">
            Back to report
          </button>
          <button type="button" data-screen-jump="15" class="luba-btn-secondary w-full py-2.5">
            View Team Alpha
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 11: Admin · Repair completion review.png
 * ========================================================================== */
function renderRepairCompletionView(state) {
  const cf = state.completionForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Review repair completion</h1>
          <p class="luba-page-subtitle">RW-2026-0842 · Team evidence submitted 21 October 2026 at 10:45 AM</p>
        </div>
        <button type="button" data-screen-jump="1" class="luba-btn-secondary px-4 py-2.5">
          ← Back to review queue
        </button>
      </div>

      ${renderBanner({
        variant: 'warning',
        title: 'Awaiting LGU approval · Not yet Resolved',
        body: "Current report status: In Progress. Team Alpha's completion submission is pending your verification. Only approval below changes the status to Resolved."
      })}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-luba-textPrimary">Commonwealth Avenue</h2>
                <p class="text-xs text-luba-textSubtle mt-0.5">Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City</p>
              </div>
              ${renderStatusBadge('In Progress')}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <img src="/assets/pothole-before.jpg" alt="Before repair" class="w-full h-[212px] object-cover rounded-lg border border-luba-border"/>
                <p class="text-xs font-bold text-luba-textPrimary">Before repair</p>
                <p class="text-[11px] text-luba-textSubtle">20 Oct · 8:05 AM · Team Alpha</p>
              </div>
              <div class="space-y-2">
                <img src="/assets/pothole-after.jpg" alt="After repair" class="w-full h-[212px] object-cover rounded-lg border border-luba-border"/>
                <p class="text-xs font-bold text-luba-textPrimary">After repair</p>
                <p class="text-[11px] text-luba-textSubtle">21 Oct · 10:35 AM · Team Alpha</p>
              </div>
            </div>
          </div>

          <div class="luba-card p-5 space-y-2.5 text-xs">
            <h3 class="text-base font-bold text-luba-textPrimary">Repair summary</h3>
            <p class="text-luba-textPrimary">Report ID · RW-2026-0842</p>
            <p class="text-luba-textPrimary">Team / lead · QC North · Team Alpha / Engr. Paolo Santos</p>
            <p class="text-luba-textPrimary">Work started · 20 Oct 2026 · 8:10 AM</p>
            <p class="text-luba-textPrimary">Work completed · 21 Oct 2026 · 10:35 AM</p>
            <p class="text-luba-textPrimary leading-relaxed">Repair notes · Removed loose aggregate, dried base and placed hot-mix asphalt. Compacted a 1.2 × 1.0 m patch flush with the road. Site cleared; lane reopened.</p>
            <p class="text-luba-textPrimary">Materials · Hot-mix asphalt · 4 bags / approx. 200 kg</p>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Citizen: Mika Reyes',
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
              <textarea rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${cf.reviewNotes}</textarea>
            </div>

            <div class="text-xs space-y-1 text-luba-textSecondary">
              <p>Reviewer · Ana Dela Cruz</p>
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

/* ============================================================================
 * VIEW 12: Admin · Report status history and audit log.png
 * ========================================================================== */
function renderReportAuditLogView(state) {
  const af = state.auditLogFilters;
  const rows = state.auditLogEvents.filter((ev) => {
    if (af.status !== 'All statuses' && ev.status !== af.status) return false;
    return true;
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Report activity log</h1>
          <p class="luba-page-subtitle">RW-2026-0842 · Immutable event records · All timestamps PHT, 2026</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          ${renderStatusBadge('Resolved')}
          <span class="text-xs text-luba-textSubtle">Latest decision · 21 Oct 2026, 11:20 AM · Ana Dela Cruz</span>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2">
          Back to report
        </button>
      </div>

      <!-- Filter Row -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        <div class="md:col-span-4 luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">Status filter</label>
          <select id="audit-status-filter" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none bg-transparent">
            ${['All statuses', 'Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved']
              .map((s) => `<option value="${s}" ${af.status === s ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </div>
        <div class="md:col-span-3 luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">From date (inclusive)</label>
          <input type="text" value="${af.fromDate}" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none bg-transparent"/>
        </div>
        <div class="md:col-span-3 luba-field-box">
          <label class="block text-[11px] text-luba-textSubtle">To date (inclusive)</label>
          <input type="text" value="${af.toDate}" class="w-full text-xs font-medium text-luba-textPrimary mt-1 focus:outline-none bg-transparent"/>
        </div>
        <div class="md:col-span-2 flex items-start">
          <button type="button" class="luba-btn-primary w-full px-4 py-3">
            Apply filters
          </button>
        </div>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Read-only history',
        body: 'Event records cannot be edited or deleted here. Corrections are appended as new audited events; the original actor, timestamp and evidence references are retained.'
      })}

      <!-- 10-Event Immutable Audit Table -->
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">TIMESTAMP · PHT</th>
              <th class="py-3 px-4">ACTOR</th>
              <th class="py-3 px-4">STATUS</th>
              <th class="py-3 px-4">REASON / EVIDENCE NOTE</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${rows
              .map(
                (ev) => `
              <tr class="luba-table-row">
                <td class="py-3.5 px-4 font-bold text-luba-info">${ev.time}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${ev.actor}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${ev.status}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${ev.note}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="luba-card p-5 space-y-2">
        <h3 class="text-base font-bold text-luba-textPrimary">Evidence references</h3>
        <p class="text-xs text-luba-textSubtle">Citizen photo · 19 Oct, 9:24 AM · Before photo · 20 Oct, 8:05 AM · After photo · 21 Oct, 10:35 AM</p>
        <p class="text-xs text-luba-textSubtle">Completed at 10:35 AM and submitted at 10:45 AM are distinct events. Neither marks the report Resolved before LGU approval.</p>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 13: Admin · Pothole map.png
 * ========================================================================== */
function renderPotholeMapView(state) {
  const mf = state.mapFilters;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Pothole map</h1>
          <p class="luba-page-subtitle">Quezon City · Illustrative map · Snapshot 21 Oct 2026, 12:00 PM PHT</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>

      <!-- 4 Filter Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="luba-field-box">
          <p class="text-[11px] text-luba-textSubtle">Search road or report ID</p>
          <p class="text-xs font-medium text-luba-textPrimary mt-1">${mf.search}</p>
        </div>
        <div class="luba-field-box">
          <p class="text-[11px] text-luba-textSubtle">Status</p>
          <p class="text-xs font-medium text-luba-textPrimary mt-1 flex items-center gap-1">${mf.status} ${SVG_CHEVRON_DOWN}</p>
        </div>
        <div class="luba-field-box">
          <p class="text-[11px] text-luba-textSubtle">Severity</p>
          <p class="text-xs font-medium text-luba-textPrimary mt-1 flex items-center gap-1">${mf.severity} ${SVG_CHEVRON_DOWN}</p>
        </div>
        <div class="luba-field-box">
          <p class="text-[11px] text-luba-textSubtle">Barangay</p>
          <p class="text-xs font-medium text-luba-textPrimary mt-1 flex items-center gap-1">${mf.barangay} ${SVG_CHEVRON_DOWN}</p>
        </div>
      </div>

      <!-- Mode Pills -->
      <div class="flex gap-2">
        ${['All statuses', 'Open only', 'Resolved']
          .map((m) =>
            renderPillButton({
              label: m,
              active: mf.modePill === m,
              dataAttr: `data-map-mode="${m}"`
            })
          )
          .join('')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-3">
          ${renderSchematicMap({ showPinLabels: true, mode: 'tall', selectedPin: mf.selectedPinCode })}
          <div class="flex items-center justify-between">
            ${renderSeverityBadge('High')}
            ${renderSeverityBadge('Medium')}
            ${renderSeverityBadge('Low')}
          </div>
          <p class="text-xs text-luba-textSubtle">Sample high, medium and low markers · Severity and lifecycle status are separate. Map is illustrative, not a live route or survey.</p>
          <button type="button" class="luba-btn-secondary w-full py-2.5">
            Reset map filters
          </button>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-3">
            <h2 class="text-lg font-bold text-luba-textPrimary">RW-2026-0842</h2>
            ${renderStatusBadge('Resolved')}
            <img src="/assets/pothole-citizen.jpg" alt="Pin inspector preview" class="w-full h-40 object-cover rounded-lg border border-luba-border"/>
            <p class="text-sm font-bold text-luba-textPrimary">Commonwealth Avenue</p>
            <p class="text-xs text-luba-textSubtle leading-relaxed">Northbound service road near IBP Road, Batasan Hills, Quezon City</p>
            ${renderSeverityBadge('High')}
            <p class="text-xs text-luba-textSubtle">14.6978° N, 121.0881° E</p>
            <p class="text-xs text-luba-textSubtle">Submitted · 19 Oct, 9:24 AM PHT</p>
            <p class="text-xs text-luba-textSubtle">LGU approval · Ana Dela Cruz · 21 Oct, 11:20 AM PHT</p>
            <button type="button" data-screen-jump="3" class="luba-btn-primary w-full py-3">
              Review report details
            </button>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Public map privacy',
            body: 'Citizen name, phone and email are not shown on pins. Restricted details remain in authorized report views.'
          })}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 14: Admin · Maintenance team management.png
 * ========================================================================== */
function renderTeamsListView(state) {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Maintenance teams</h1>
          <p class="luba-page-subtitle">Crew availability, service areas and workload · 21 October 2026</p>
        </div>
        <button type="button" data-screen-jump="16" class="luba-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5">
          + Create team
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderKpiCard({ label: 'Active teams', value: '8', subtitle: 'All service districts' })}
        ${renderKpiCard({ label: 'Field personnel', value: '48', subtitle: 'Team leads and crew' })}
        ${renderKpiCard({ label: 'Assigned reports', value: '128', subtitle: 'Citywide · all teams' })}
        ${renderKpiCard({ label: 'In progress', value: '214', subtitle: 'Includes repairs awaiting review' })}
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[260px] flex items-center gap-2 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="text" placeholder="Search team, lead or service area" class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle focus:outline-none bg-transparent"/>
        </div>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>All districts</span>
        </button>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>Active teams</span>
        </button>
      </div>

      <!-- 2x2 Teams Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        ${state.teams
          .map(
            (t) => `
          <div class="luba-card p-5 space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-luba-infoPillBg text-luba-info flex items-center justify-center font-bold">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M2 18h20M4 18v-5a8 8 0 0116 0v5M10 8V5a2 2 0 014 0v3"/></svg>
                </div>
                <div>
                  <h2 class="text-base font-bold text-luba-textPrimary">${t.title}</h2>
                  <p class="text-xs text-luba-textSubtle">${t.lead}</p>
                </div>
              </div>
              ${renderStatusBadge('Active')}
            </div>
            <div class="space-y-1.5 text-xs text-luba-textSecondary pt-1">
              <p>Service area · ${t.serviceArea}</p>
              <p>Crew size · ${t.crewSize}</p>
              <p>Specialty · ${t.specialty}</p>
            </div>
            <div class="flex items-center justify-between pt-2 text-xs">
              <span class="font-bold text-luba-cta">${t.workload}</span>
              <button type="button" data-screen-jump="15" class="font-bold text-luba-info hover:underline">Manage team →</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>

      <p class="text-xs text-luba-textSubtle">Showing 4 of 8 teams · Page 1 of 2 · Next →</p>
    </div>
  `;
}

/* ============================================================================
 * VIEW 15: Admin · Maintenance team details.png
 * ========================================================================== */
function renderTeamDetailsView(state) {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">QC North · Team Alpha</h1>
          <p class="luba-page-subtitle">Batasan Hills / Commonwealth · Asphalt patching · 21 October 2026</p>
        </div>
        <button type="button" data-screen-jump="14" class="luba-btn-secondary px-4 py-2.5">
          Back to teams
        </button>
      </div>

      <div class="flex items-center gap-2.5">
        ${renderStatusBadge('Active')}
        <button type="button" data-screen-jump="17" class="luba-btn-secondary px-3.5 py-2">
          Manage team
        </button>
        <button type="button" data-screen-jump="16" class="luba-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
          Add personnel
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-7 luba-card p-5 space-y-2">
          <h2 class="text-lg font-bold text-luba-textPrimary">Engr. Paolo Santos</h2>
          <p class="text-xs font-bold text-luba-textPrimary">Maintenance lead · QC North · Alpha</p>
          <p class="text-xs text-luba-textSubtle">paolo.santos@example.com</p>
          <p class="text-xs text-luba-textSubtle">+63 917 000 0210 · Fictional contact</p>
          <p class="text-[11px] text-luba-textSubtle pt-1">Lead supervises four crew members listed below.</p>
        </div>
        <div class="lg:col-span-5 luba-card p-5 space-y-2">
          <h2 class="text-lg font-bold text-luba-textPrimary">Availability & workload</h2>
          <p class="text-xs text-luba-textSubtle">Available for scheduled assignments</p>
          <p class="text-xs font-bold text-luba-cta">8 Assigned · 3 In Progress</p>
          <p class="text-[11px] text-luba-textSubtle">2 of the 3 In Progress tasks await admin review; not an additional status total.</p>
          <p class="text-[11px] text-luba-textSubtle">Service hours · 7:00 AM–4:00 PM PHT</p>
        </div>
      </div>

      <!-- Crew Table -->
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">CREW MEMBER</th>
              <th class="py-3 px-4">SPECIALTY</th>
              <th class="py-3 px-4">AVAILABILITY</th>
              <th class="py-3 px-4">ACTION</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${state.teamAlphaCrew
              .map(
                (c) => `
              <tr class="luba-table-row">
                <td class="py-3.5 px-4 font-bold text-luba-info">${c.name}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${c.specialty}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${c.availability}</td>
                <td class="py-3.5 px-4">
                  <button type="button" data-screen-jump="17" class="text-luba-textSecondary hover:text-luba-info hover:underline">Edit personnel</button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Assigned Task List -->
      <div class="luba-card p-5 space-y-3">
        <h3 class="text-base font-bold text-luba-textPrimary">Assigned task list</h3>
        <div class="border border-luba-border rounded-card overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="luba-table-header">
                <th class="py-2.5 px-4">REPORT</th>
                <th class="py-2.5 px-4">ROAD</th>
                <th class="py-2.5 px-4">STATUS</th>
                <th class="py-2.5 px-4">TARGET</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-luba-border text-xs">
              <tr class="luba-table-row">
                <td class="py-3 px-4 font-bold text-luba-info">RW-2026-0841</td>
                <td class="py-3 px-4 text-luba-textSecondary">Elliptical Road</td>
                <td class="py-3 px-4 text-luba-textSecondary">Assigned</td>
                <td class="py-3 px-4 text-luba-textSecondary">22 Oct · 5 PM</td>
              </tr>
              <tr class="luba-table-row">
                <td class="py-3 px-4 font-bold text-luba-info">RW-2026-0828</td>
                <td class="py-3 px-4 text-luba-textSecondary">Batasan Road</td>
                <td class="py-3 px-4 text-luba-textSecondary">Assigned</td>
                <td class="py-3 px-4 text-luba-textSecondary">22 Oct · 5 PM</td>
              </tr>
              <tr class="luba-table-row">
                <td class="py-3 px-4 font-bold text-luba-info">RW-2026-0842</td>
                <td class="py-3 px-4 text-luba-textSecondary">Commonwealth Ave</td>
                <td class="py-3 px-4 text-luba-textSecondary">Resolved · 21 Oct 11:20</td>
                <td class="py-3 px-4 text-luba-textSecondary">21 Oct · 5 PM</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-[11px] text-luba-textSubtle">Showing selected tasks, including the recently resolved main case. Open team workload remains 8 Assigned / 3 In Progress.</p>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Protect ongoing task ownership',
        body: 'Team or lead changes require an explicit handover. Existing tasks are not silently reassigned when personnel details change.'
      })}
    </div>
  `;
}

/* ============================================================================
 * VIEW 16: Admin · Add maintenance personnel.png (Validation Error State)
 * ========================================================================== */
function renderAddPersonnelView(state) {
  const f = state.addPersonnelForm;
  const isPhoneValid = PH_MOBILE_REGEX.test((f.mobileNumber || '').trim());

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Add maintenance personnel</h1>
          <p class="luba-page-subtitle">New invitation · Fictional demonstration · Required fields marked *</p>
        </div>
        <button type="button" data-screen-jump="14" class="luba-btn-secondary px-4 py-2.5">
          Back to teams
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-4">
          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Personnel details</h2>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Full name *</label>
              <input type="text" id="add-pers-name" value="${f.fullName}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Work email *</label>
              <input type="email" id="add-pers-email" value="${f.email}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="${isPhoneValid ? 'luba-field-box' : 'luba-field-box-error'}">
              <label class="block text-[11px] text-luba-textMuted">Philippine mobile number *</label>
              <input type="text" id="add-pers-mobile" value="${f.mobileNumber}" placeholder="+63 917 000 0215" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
              ${
                !isPhoneValid
                  ? `<p class="text-xs text-luba-danger mt-1.5">Enter a complete Philippine mobile number, for example +63 917 000 0215.</p>`
                  : `<p class="text-xs text-luba-success mt-1.5">Valid Philippine mobile number format confirmed.</p>`
              }
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Role *</label>
                <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${f.role} ${SVG_CHEVRON_DOWN}</p>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Team *</label>
                <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${f.team} ${SVG_CHEVRON_DOWN}</p>
              </div>
            </div>

            <p class="text-[11px] text-luba-textSubtle">Role grants maintenance access only. Administrator privileges are not included.</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              id="btn-save-invite-personnel"
              ${!isPhoneValid ? 'disabled' : ''}
              class="px-5 py-2.5 ${isPhoneValid ? 'luba-btn-primary' : 'luba-btn-disabled'}"
            >
              Save & send invitation
            </button>
            <button type="button" data-screen-jump="15" class="luba-btn-secondary px-4 py-2.5">
              Cancel
            </button>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Invitation settings</h3>
            ${renderGreenCheckItem('Send invitation to work email')}
            <p class="text-xs text-luba-textSubtle leading-relaxed">Invitations expire after 7 days. The recipient sets their own password through the secure invitation link.</p>
            <div class="flex gap-2">
              ${renderPillButton({ label: 'Crew', active: true })}
              ${renderPillButton({ label: 'Lead', active: false })}
            </div>
          </div>

          ${
            !isPhoneValid
              ? renderBanner({
                  variant: 'danger',
                  title: 'Check the mobile number',
                  body: 'Nothing has been saved or sent. Correct the required phone number to enable Save & send invitation.'
                })
              : renderBanner({
                  variant: 'success',
                  title: 'Ready to send invitation',
                  body: 'Mobile number verified. Save & send invitation is now enabled.'
                })
          }

          ${renderBanner({
            variant: 'info',
            title: 'Audited access',
            body: 'The invitation, team and role are logged with Ana Dela Cruz and the time saved. Existing tasks are unaffected.'
          })}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 17: Admin · Edit maintenance personnel.png
 * ========================================================================== */
function renderEditPersonnelView(state) {
  const f = state.editPersonnelForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Edit maintenance personnel</h1>
          <p class="luba-page-subtitle">Engr. Paolo Santos · QC North · Team Alpha</p>
        </div>
        <button type="button" data-screen-jump="14" class="luba-btn-secondary px-4 py-2.5">
          Back to teams
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-4">
          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Contact and role</h2>
            ${renderStatusBadge('Active')}

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Full name *</label>
              <input type="text" value="${f.fullName}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Work email *</label>
              <input type="email" value="${f.email}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Mobile number *</label>
              <input type="text" value="${f.mobileNumber}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Role *</label>
                <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${f.role} ${SVG_CHEVRON_DOWN}</p>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Team *</label>
                <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${f.team} ${SVG_CHEVRON_DOWN}</p>
              </div>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Availability</label>
              <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">On duty · Available for scheduled work ${SVG_CHEVRON_DOWN}</p>
            </div>

            <div class="flex gap-2">
              ${['On duty', 'Unavailable', 'On leave']
                .map((av) =>
                  renderPillButton({
                    label: av,
                    active: f.availability === av,
                    dataAttr: `data-select-availability="${av}"`
                  })
                )
                .join('')}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button type="button" data-save-personnel="true" class="luba-btn-primary px-5 py-2.5">
              Save personnel changes
            </button>
            <button type="button" data-screen-jump="15" class="luba-btn-secondary px-4 py-2.5">
              Cancel
            </button>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          ${renderBanner({
            variant: 'warning',
            title: 'Ongoing task ownership is protected',
            body: 'Paolo remains lead for existing Alpha tasks. A team or lead-role change requires explicit handover and administrator confirmation, not automatic reassignment.'
          })}

          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Task context</h3>
            <p class="text-xs font-bold text-luba-textPrimary">8 Assigned · 3 In Progress</p>
            <p class="text-xs text-luba-textSubtle leading-relaxed">RW-2026-0842 is already Resolved as of 21 Oct, 11:20 AM PHT.</p>
            <button type="button" data-screen-jump="15" class="luba-btn-secondary w-full py-2.5">
              Review task handover
            </button>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Audit note',
            body: 'Saving records the previous and new values, Ana Dela Cruz and the PHT timestamp. No task ownership has changed in this view.'
          })}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 18: Admin · User management.png
 * ========================================================================== */
function renderUsersListView(state) {
  const tabs = ['All users', 'Citizens', 'LGU staff', 'Maintenance', 'Invitations'];

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">User management</h1>
          <p class="luba-page-subtitle">Manage citizen accounts, LGU staff and maintenance access.</p>
        </div>
        <button type="button" data-screen-jump="16" class="luba-btn-primary inline-flex items-center gap-2 px-4 py-2.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
          Invite staff member
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderKpiCard({ label: 'Citizen accounts', value: '3,842', subtitle: 'Verified email addresses' })}
        ${renderKpiCard({ label: 'LGU administrators', value: '12', subtitle: 'Role-based access' })}
        ${renderKpiCard({ label: 'Maintenance personnel', value: '48', subtitle: 'Across 8 field teams' })}
        ${renderKpiCard({ label: 'Pending invitations', value: '3', subtitle: 'Expire after 7 days' })}
      </div>

      <!-- 5 Role Filter Tabs -->
      <div class="flex flex-wrap gap-2">
        ${tabs
          .map((t) =>
            renderPillButton({
              label: t,
              active: state.userFilters.tab === t,
              dataAttr: `data-user-tab="${t}"`
            })
          )
          .join('')}
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[260px] flex items-center gap-2 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="text" placeholder="Search name or email address" class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle focus:outline-none bg-transparent"/>
        </div>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>All roles</span>
        </button>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>All statuses</span>
        </button>
      </div>

      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">NAME</th>
              <th class="py-3 px-4">EMAIL ADDRESS</th>
              <th class="py-3 px-4">ROLE</th>
              <th class="py-3 px-4">AREA / TEAM</th>
              <th class="py-3 px-4">STATUS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${state.users
              .map(
                (u) => `
              <tr class="luba-table-row">
                <td class="py-3.5 px-4">
                  <button type="button" data-screen-jump="19" class="font-bold text-luba-info hover:underline">${u.name}</button>
                </td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${u.email}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${u.role}</td>
                <td class="py-3.5 px-4 text-luba-textSecondary">${u.area}</td>
                <td class="py-3.5 px-4 ${u.status === 'Active' ? 'font-bold text-luba-success' : 'text-luba-textSecondary'}">${u.status}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 text-xs text-luba-textSubtle">
        <span>Showing 1–8 of 3,902 results</span>
        <div class="flex items-center gap-1.5">
          <button type="button" class="px-3 py-1.5 bg-white border border-luba-border rounded-control text-luba-textSubtle">Previous</button>
          <button type="button" class="w-8 h-8 rounded-control bg-luba-navy text-white font-bold">1</button>
          <button type="button" class="w-8 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">2</button>
          <button type="button" class="w-8 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">3</button>
          <span class="px-2 bg-white border border-luba-border rounded-control h-8 inline-flex items-center text-luba-textPrimary">…</span>
          <button type="button" class="px-2.5 h-8 rounded-control bg-white border border-luba-border text-luba-textPrimary">161</button>
          <button type="button" class="px-3 py-1.5 bg-white border border-luba-border rounded-control text-luba-textPrimary">Next</button>
        </div>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Protect citizen information',
        body: 'Only LGU administrators can manage access. All permission changes are recorded in the audit log. All accounts shown here are fictional.'
      })}
    </div>
  `;
}

/* ============================================================================
 * VIEW 19: Admin · User details and account management.png
 * ========================================================================== */
function renderUserDetailsView(state) {
  const uf = state.userStatusForm;
  const hasChangedStatus = uf.selectedStatus !== uf.currentStatus;
  const hasValidReason = uf.reasonTouched && uf.reason.trim().length >= 5;
  const canConfirm = hasChangedStatus && hasValidReason && uf.acknowledgePrivilegeSeparation;

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Mika Reyes</h1>
          <p class="luba-page-subtitle">Citizen account · Joined October 2026 · Quezon City</p>
        </div>
        <button type="button" data-screen-jump="18" class="luba-btn-secondary px-4 py-2.5">
          Back to users
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-7 space-y-5">
          <div class="luba-card p-6 space-y-3">
            <h2 class="text-lg font-bold text-luba-textPrimary">Account details</h2>
            <div class="flex gap-2">
              ${renderStatusBadge(uf.currentStatus)}
              ${renderStatusBadge('Verified email')}
            </div>
            <div class="space-y-2 text-xs text-luba-textSecondary pt-1">
              <p>Email · mika.reyes@example.com</p>
              <p>Mobile · +63 917 000 0184</p>
              <p>Barangay · Batasan Hills, Quezon City</p>
              <p>Role · Citizen · Read-only in this view</p>
            </div>
            ${renderBanner({
              variant: 'info',
              title: 'Restricted personal data',
              body: 'Contact details are available only to authorized LGU staff for report handling. Do not include them in public exports.',
              extraClass: 'mt-2'
            })}
          </div>

          <div class="luba-card overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="luba-table-header">
                  <th class="py-3 px-4">RECENT REPORT</th>
                  <th class="py-3 px-4">ROAD</th>
                  <th class="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-luba-border text-xs">
                <tr class="luba-table-row">
                  <td class="py-3.5 px-4 font-bold text-luba-info">RW-2026-0842</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">Commonwealth Avenue</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">Resolved</td>
                </tr>
                <tr class="luba-table-row">
                  <td class="py-3.5 px-4 font-bold text-luba-info">RW-2026-0798</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">Batasan Road</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">Resolved</td>
                </tr>
                <tr class="luba-table-row">
                  <td class="py-3.5 px-4 font-bold text-luba-info">RW-2026-0771</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">Aurora Boulevard</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">In Progress</td>
                </tr>
                <tr class="luba-table-row">
                  <td class="py-3.5 px-4 font-bold text-luba-info">RW-2026-0723</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">Elliptical Road</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">Resolved</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="lg:col-span-5 space-y-4">
          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Account status controls</h2>
            <p class="text-xs text-luba-textSubtle leading-relaxed">Status controls sign-in access; it does not grant new role privileges or change report history.</p>

            <div class="flex gap-2">
              ${['Active', 'Suspended']
                .map((st) =>
                  renderPillButton({
                    label: st,
                    active: uf.selectedStatus === st,
                    dataAttr: `data-select-user-status="${st}"`
                  })
                )
                .join('')}
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Reason for status change *</label>
              <input type="text" id="user-status-reason" value="${uf.reason}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <p class="text-xs text-luba-danger">A reason is required before a changed status can be confirmed.</p>

            <button type="button" class="luba-btn-secondary w-full py-2.5">
              Review status change
            </button>

            ${renderBanner({
              variant: 'info',
              title: `Confirmation area · ${hasChangedStatus ? 'change pending' : 'no change pending'}`,
              body: `Current: ${uf.currentStatus} → Selected: ${uf.selectedStatus}. ${
                hasChangedStatus
                  ? 'Provide a reason and confirm privilege separation below.'
                  : 'No access changes will be saved. Select a different status and provide a reason to review.'
              }`
            })}

            <label class="flex items-center gap-2.5 text-xs text-luba-textPrimary cursor-pointer">
              <input type="checkbox" id="chk-priv-sep" ${uf.acknowledgePrivilegeSeparation ? 'checked' : ''} class="w-4 h-4 rounded border-luba-textMuted accent-luba-navy"/>
              <span>I understand account status does not edit privileges</span>
            </label>

            <button
              type="button"
              id="btn-confirm-user-status"
              ${!canConfirm ? 'disabled' : ''}
              class="w-full py-2.5 ${canConfirm ? 'luba-btn-primary' : 'luba-btn-disabled'}"
            >
              Confirm status change
            </button>

            <button type="button" data-screen-jump="18" class="luba-btn-secondary w-full py-2.5">
              Cancel
            </button>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Account audit',
            body: 'Any status change records Ana Dela Cruz, the decision time and reason. Existing reports and ongoing work are retained.'
          })}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 20: Admin · Analytics and exports.png
 * ========================================================================== */
function renderAnalyticsView() {
  const months = [
    { m: 'May', rec: 156, res: 94,  recH: 52, resH: 31 },
    { m: 'Jun', rec: 184, res: 104, recH: 62, resH: 35 },
    { m: 'Jul', rec: 210, res: 112, recH: 70, resH: 38 },
    { m: 'Aug', rec: 237, res: 103, recH: 79, resH: 35 },
    { m: 'Sep', rec: 271, res: 123, recH: 90, resH: 41 },
    { m: 'Oct', rec: 226, res: 84,  recH: 75, resH: 28 }
  ];

  const corridors = [
    { road: 'Commonwealth Avenue',     total: 342, resolved: 162, open: 170, exceptions: 10 },
    { road: 'Batasan Road',            total: 218, resolved: 108, open: 104, exceptions: 6 },
    { road: 'Aurora Boulevard',        total: 196, resolved: 94,  open: 97,  exceptions: 5 },
    { road: 'Elliptical Road',         total: 142, resolved: 78,  open: 60,  exceptions: 4 },
    { road: 'Other Quezon City roads', total: 386, resolved: 178, open: 195, exceptions: 13 }
  ];

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Road performance analytics</h1>
          <p class="luba-page-subtitle">All-report snapshot · Quezon City · As of 21 October 2026, 12:00 PM</p>
        </div>
        <div class="flex items-center gap-2.5">
          <button type="button" data-open-modal="export_dialog" class="luba-btn-secondary inline-flex items-center gap-2 px-4 py-2.5">
            <svg class="w-4 h-4 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
            Export CSV
          </button>
          <button type="button" data-open-modal="export_success" class="luba-btn-primary inline-flex items-center gap-2 px-4 py-2.5">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-2">
          ${renderPillButton({ label: 'Overview', active: true })}
          ${renderPillButton({ label: 'By barangay', active: false })}
          ${renderPillButton({ label: 'Team performance', active: false })}
        </div>
        <button type="button" data-open-modal="date_range" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2">
          <svg class="w-4 h-4 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          As of 21 Oct 2026
        </button>
      </div>

      <!-- 4 KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderKpiCard({ label: 'Reports received', value: '1,284', subtitle: 'Across all 8 statuses' })}
        ${renderKpiCard({ label: 'Resolution rate', value: '48.3%', subtitle: '620 of 1,284 · LGU approved' })}
        ${renderKpiCard({ label: 'Median first review', value: '2.4 h', subtitle: 'Submitted → first LGU review' })}
        ${renderKpiCard({ label: 'Median repair time', value: '2.8 d', subtitle: 'Assigned → verified resolution' })}
      </div>

      <!-- Reports by status & Severity distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-6">
          ${renderStatusDistributionCard()}
        </div>
        <div class="lg:col-span-6">
          ${renderSeverityDistributionCard()}
        </div>
      </div>

      <!-- Monthly Grouped Bar Chart -->
      <div class="luba-card p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-base font-bold text-luba-textPrimary">Report volume and verified resolutions</h2>
          <div class="flex items-center gap-4 text-xs">
            <span class="inline-flex items-center gap-1.5 text-luba-info font-medium"><span class="w-2.5 h-2.5 rounded-full bg-luba-info"></span> Reports received</span>
            <span class="inline-flex items-center gap-1.5 text-luba-cta font-medium"><span class="w-2.5 h-2.5 rounded-full bg-luba-cta"></span> Resolved</span>
          </div>
        </div>

        <div class="grid grid-cols-6 gap-4 pt-6 pb-2 items-end h-40 px-4">
          ${months
            .map(
              (item) => `
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-end gap-2.5 h-28">
                <div class="flex flex-col items-center">
                  <span class="text-[10px] font-semibold text-luba-info mb-1">${item.rec}</span>
                  <div class="w-7 bg-luba-info rounded-[4px]" style="height: ${item.recH}px"></div>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-[10px] font-semibold text-luba-cta mb-1">${item.res}</span>
                  <div class="w-7 bg-luba-cta rounded-[4px]" style="height: ${item.resH}px"></div>
                </div>
              </div>
              <span class="text-xs text-luba-textSubtle">${item.m}</span>
            </div>
          `
            )
            .join('')}
        </div>
        <p class="text-xs text-luba-textSubtle">May–October 2026 · Received totals: 1,284 · Resolution totals: 620 · October is month-to-date.</p>
      </div>

      <!-- Road-level summary table -->
      <div class="space-y-3">
        <h2 class="text-base font-bold text-luba-textPrimary">Road-level summary</h2>
        <div class="luba-card overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="luba-table-header">
                <th class="py-3 px-4">ROAD CORRIDOR</th>
                <th class="py-3 px-4">TOTAL REPORTS</th>
                <th class="py-3 px-4">RESOLVED</th>
                <th class="py-3 px-4">OPEN</th>
                <th class="py-3 px-4">EXCEPTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-luba-border text-xs">
              ${corridors
                .map(
                  (c) => `
                <tr class="luba-table-row">
                  <td class="py-3.5 px-4 font-bold text-luba-info">${c.road}</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">${c.total}</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">${c.resolved}</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">${c.open}</td>
                  <td class="py-3.5 px-4 text-luba-textSecondary">${c.exceptions}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-luba-textSubtle">Open = Submitted, Under Review, Verified, Assigned, In Progress (626). Exceptions = Rejected + Duplicate (38).</p>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 25: Admin · Administrator profile.png
 * ========================================================================== */
function renderAdminProfileView(state) {
  const pf = state.adminProfileForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">My administrator profile</h1>
          <p class="luba-page-subtitle">Personal account preferences · Not workspace system settings</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-7 space-y-4">
          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Ana Dela Cruz</h2>
            ${renderStatusBadge('Active')}

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Full name</label>
              <p class="text-xs text-luba-textPrimary mt-1">${pf.fullName}</p>
            </div>
            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Work email</label>
              <p class="text-xs text-luba-textPrimary mt-1">${pf.email}</p>
            </div>
            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">LGU role (managed access)</label>
              <p class="text-xs text-luba-textPrimary mt-1">${pf.role}</p>
            </div>
            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Department</label>
              <p class="text-xs text-luba-textPrimary mt-1">${pf.department}</p>
            </div>

            <p class="text-[11px] text-luba-textSubtle">Role privileges are managed separately by authorized administrators, not edited in personal preferences.</p>
          </div>

          ${renderBanner({
            variant: 'success',
            title: 'Preferences saved · sample feedback',
            body: 'Ana Dela Cruz · Personal notifications updated 21 Oct 2026, 12:05 PM PHT. Workspace rules are unchanged.'
          })}
        </div>

        <div class="lg:col-span-5 space-y-4">
          <div class="luba-card p-5 space-y-4">
            <h3 class="text-base font-bold text-luba-textPrimary">My notifications</h3>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Review queue alerts</p>
                <p class="text-xs text-luba-textSubtle">New high-severity reports awaiting review.</p>
              </div>
              ${renderToggleSwitch(pf.reviewQueueAlerts, 'data-toggle-profile="reviewQueueAlerts"', false, true)}
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Completion review alerts</p>
                <p class="text-xs text-luba-textSubtle">Team submissions needing LGU verification.</p>
              </div>
              ${renderToggleSwitch(pf.completionReviewAlerts, 'data-toggle-profile="completionReviewAlerts"', false, true)}
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Daily email summary</p>
                <p class="text-xs text-luba-textSubtle">Personal operations digest.</p>
              </div>
              ${renderToggleSwitch(pf.dailyEmailSummary, 'data-toggle-profile="dailyEmailSummary"', false, true)}
            </div>
          </div>

          <div class="luba-card p-5 space-y-4">
            <h3 class="text-base font-bold text-luba-textPrimary">Security</h3>
            <div class="flex items-center justify-between text-xs text-luba-textPrimary py-1">
              <span>Change password</span>
              <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Sign-in security notices</p>
                <p class="text-xs text-luba-textSubtle">Essential notices to your work email.</p>
              </div>
              ${renderToggleSwitch(true, '', true, true)}
            </div>
            <p class="text-[11px] text-luba-textSubtle">Security notices cannot be disabled. Never share passwords or verification links.</p>
          </div>

          <button type="button" data-save-profile="true" class="luba-btn-primary w-full py-3">
            Save preferences
          </button>
          <button type="button" data-sign-out="true" class="luba-btn-secondary w-full py-2.5 inline-flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * VIEW 26: Admin · Workspace settings.png
 * ========================================================================== */
function renderWorkspaceSettingsView(state) {
  const ws = state.workspaceSettingsForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Workspace settings</h1>
          <p class="luba-page-subtitle">Quezon City Engineering Department · Changes apply to this LGU workspace.</p>
        </div>
        <button type="button" data-save-workspace="true" class="luba-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5">
          ✓ Save changes
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        ${['General', 'Reporting rules', 'Notifications', 'Security & access', 'Audit log']
          .map((t) =>
            renderPillButton({
              label: t,
              active: ws.activeTab === t,
              dataAttr: `data-ws-tab="${t}"`
            })
          )
          .join('')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Report review & repair policy</h2>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Duplicate detection radius</label>
              <p class="text-xs font-medium text-luba-textPrimary mt-1 flex items-center gap-1">50 meters ${SVG_CHEVRON_DOWN}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">High priority target</label>
                <p class="text-xs font-medium text-luba-textPrimary mt-1">48 hours</p>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Medium priority target</label>
                <p class="text-xs font-medium text-luba-textPrimary mt-1">5 days</p>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Low priority target</label>
                <p class="text-xs font-medium text-luba-textPrimary mt-1">14 days</p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Require at least one photo</p>
                <p class="text-xs text-luba-textSubtle">Citizen reports must include visible road damage.</p>
              </div>
              ${renderToggleSwitch(ws.requirePhoto, 'data-toggle-ws="requirePhoto"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Admin verification before resolution</p>
                <p class="text-xs text-luba-textSubtle">A team's completion submission stays In Progress until approved.</p>
              </div>
              ${renderToggleSwitch(ws.adminVerificationBeforeResolution, 'data-toggle-ws="adminVerificationBeforeResolution"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Enable nearby duplicate checks</p>
                <p class="text-xs text-luba-textSubtle">Warn citizens before submitting a similar report.</p>
              </div>
              ${renderToggleSwitch(ws.enableNearbyDuplicateChecks, 'data-toggle-ws="enableNearbyDuplicateChecks"')}
            </div>
          </div>

          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Citizen notifications</h2>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Status change notifications</p>
                <p class="text-xs text-luba-textSubtle">Notify citizens when their report moves through the workflow.</p>
              </div>
              ${renderToggleSwitch(ws.statusChangeNotifications, 'data-toggle-ws="statusChangeNotifications"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Request post-repair feedback</p>
                <p class="text-xs text-luba-textSubtle">Send a feedback prompt after LGU-approved resolution.</p>
              </div>
              ${renderToggleSwitch(ws.requestPostRepairFeedback, 'data-toggle-ws="requestPostRepairFeedback"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Email update digest</p>
                <p class="text-xs text-luba-textSubtle">Send a daily summary of ongoing reports.</p>
              </div>
              ${renderToggleSwitch(ws.emailUpdateDigest, 'data-toggle-ws="emailUpdateDigest"')}
            </div>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-3.5">
            <h3 class="text-base font-bold text-luba-textPrimary">Service jurisdiction</h3>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">LGU / city</p>
              <p class="text-xs text-luba-textPrimary mt-1">Quezon City</p>
            </div>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Department</p>
              <p class="text-xs text-luba-textPrimary mt-1">City Engineering Department</p>
            </div>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Public service hotline</p>
              <p class="text-xs text-luba-textPrimary mt-1">122</p>
            </div>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Time zone</p>
              <p class="text-xs text-luba-textPrimary mt-1">Asia/Manila · UTC+8</p>
            </div>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Accountability by design',
            body: "All verification, assignment and resolution decisions are logged with the administrator's name and timestamp."
          })}

          ${renderBanner({
            variant: 'success',
            title: 'Settings are up to date',
            body: 'Last saved by Ana Dela Cruz · 21 Oct 2026, 8:00 AM'
          })}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * DEDICATED BACKGROUND VIEWS FOR MODAL SCREENS (Screens 5, 6, 7, 9, 21, 22, 23, 24)
 * ========================================================================== */
function renderApproveReportBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Verify citizen report</h1>
          <p class="luba-page-subtitle">RW-2026-0842 · 19 October 2026, 10:15 AM · Reviewer: Ana Dela Cruz</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>
      <div class="luba-card p-5 space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-luba-textPrimary">RW-2026-0842</p>
          ${renderStatusBadge('Under Review')}
        </div>
        <h2 class="text-xl font-bold text-luba-textPrimary">Commonwealth Avenue</h2>
        <p class="text-xs text-luba-textSubtle">Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City</p>
        <p class="text-xs text-luba-danger">High severity · 0.8 m wide · 12 cm deep · Photo and location verified</p>
      </div>
    </div>
  `;
}

function renderRejectReportBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Reports management</h1>
          <p class="luba-page-subtitle">Exception workflow · Separate validation demo on RW-2026-0844</p>
        </div>
        <button type="button" data-screen-jump="3" class="luba-btn-secondary px-4 py-2.5">
          Back to report
        </button>
      </div>
      <div class="luba-card p-5 space-y-2">
        <h2 class="text-lg font-bold text-luba-textPrimary">Report awaiting exception decision</h2>
        ${renderStatusBadge('Under Review')}
        <p class="text-xs text-luba-textSubtle pt-1">RW-2026-0844 · Separate validation report</p>
      </div>
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">REPORT ID</th>
              <th class="py-3 px-4">ROAD</th>
              <th class="py-3 px-4">REVIEWER</th>
            </tr>
          </thead>
          <tbody class="text-xs">
            <tr>
              <td class="py-4 px-4 font-bold text-luba-info">RW-2026-0844</td>
              <td class="py-4 px-4 text-luba-textSecondary">Marcos Highway, Marikina City</td>
              <td class="py-4 px-4 text-luba-textSecondary">Ana Dela Cruz</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDuplicateOutcomeBgView(state) {
  return `
    <div class="space-y-5">
      <div>
        <h1 class="luba-page-title">Reports management</h1>
        <p class="luba-page-subtitle">Exception workflow · Separate validation demo on RW-2026-0835</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[260px] flex items-center gap-2 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="text" placeholder="Search reports, roads or report ID" class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle bg-transparent"/>
        </div>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>All statuses</span>
        </button>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <span>All severities</span>
        </button>
        <button type="button" class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span>October 2026</span>
        </button>
      </div>
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">REPORT ID</th>
              <th class="py-3 px-4">ROAD</th>
              <th class="py-3 px-4">BARANGAY</th>
              <th class="py-3 px-4">SEVERITY</th>
              <th class="py-3 px-4">STATUS</th>
              <th class="py-3 px-4">REPORTED</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            ${state.reports
              .slice(0, 4)
              .map(
                (r) => `
              <tr>
                <td class="py-4 px-4 font-bold text-luba-info">${r.code}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.road}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.barangay}</td>
                <td class="py-4 px-4">${renderSeverityBadge(r.severity, false)}</td>
                <td class="py-4 px-4">${renderStatusTextColor(r.status)}</td>
                <td class="py-4 px-4 text-luba-textSecondary">${r.reportedDate}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAssignTeamBgView() {
  return `
    <div class="space-y-5">
      <div>
        <h1 class="luba-page-title">Assign maintenance team</h1>
        <p class="luba-page-subtitle">RW-2026-0842 · Verified 19 October 2026, 10:15 AM</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="/assets/pothole-citizen.jpg" alt="Commonwealth Avenue pothole" class="w-full h-[304px] object-cover"/>
          </div>
          <div class="luba-card p-5 space-y-3">
            <h2 class="text-lg font-bold text-luba-textPrimary">Commonwealth Avenue</h2>
            <p class="text-xs text-luba-textSubtle">Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City</p>
            ${renderSchematicMap({ showPinLabels: false })}
          </div>
        </div>
        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-2.5 text-xs">
            ${renderStatusBadge('Verified')}
            <p class="text-luba-textSecondary pt-1">Citizen · Mika Reyes</p>
            <p class="text-luba-textSecondary">Severity · High</p>
            <p class="text-luba-textSecondary">Verified by · Ana Dela Cruz</p>
          </div>
          ${renderBanner({
            variant: 'info',
            title: 'Ready for assignment',
            body: 'Location and severity confirmed. No matching duplicate found.'
          })}
        </div>
      </div>
    </div>
  `;
}

function renderAnalyticsModalBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Road performance analytics</h1>
          <p class="luba-page-subtitle">All-report snapshot · Quezon City · As of 21 October 2026, 12:00 PM</p>
        </div>
        <button type="button" data-screen-jump="20" class="luba-btn-secondary px-4 py-2.5">
          Back to analytics
        </button>
      </div>
      <div class="flex gap-2">
        ${renderPillButton({ label: 'Overview', active: true })}
        ${renderPillButton({ label: 'By barangay', active: false })}
      </div>
      ${renderBanner({
        variant: 'info',
        title: 'All-report snapshot · 21 Oct 2026, 12:00 PM PHT',
        body: '1,284 reports · 620 Resolved · 626 open · 38 exceptions · Filter dialogs validate before changing the active range.'
      })}
    </div>
  `;
}

function renderAnalyticsErrorBgView() {
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Road performance analytics</h1>
          <p class="luba-page-subtitle">Export attempt · 21 Oct 2026, 12:03 PM PHT</p>
        </div>
        <button type="button" data-screen-jump="20" class="luba-btn-secondary px-4 py-2.5">
          Back to analytics
        </button>
      </div>
      <div class="flex gap-2">
        ${renderPillButton({ label: 'Overview', active: true })}
        ${renderPillButton({ label: 'By barangay', active: false })}
      </div>
      ${renderBanner({
        variant: 'info',
        title: 'All-report snapshot · 21 Oct 2026, 12:00 PM PHT',
        body: '1,284 reports · 620 Resolved · 626 open · 38 exceptions · Filter dialogs validate before changing the active range.'
      })}
    </div>
  `;
}

function renderExportSuccessBgView() {
  return `
    <div class="space-y-5">
      <div>
        <h1 class="luba-page-title">Road performance analytics</h1>
        <p class="luba-page-subtitle">All-report snapshot · 21 Oct 2026, 12:02 PM PHT</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderKpiCard({ label: 'Reports received', value: '1,284', subtitle: 'All statuses' })}
        ${renderKpiCard({ label: 'Resolved', value: '620', subtitle: 'LGU approved' })}
        ${renderKpiCard({ label: 'Open', value: '626', subtitle: 'Active / in progress' })}
        ${renderKpiCard({ label: 'Exceptions', value: '38', subtitle: 'Rejected and Duplicate' })}
      </div>
      <div class="luba-card overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="luba-table-header">
              <th class="py-3 px-4">ROAD CORRIDOR</th>
              <th class="py-3 px-4 text-right">EXCEPTIONS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-luba-border text-xs">
            <tr>
              <td class="py-3.5 px-4 font-bold text-luba-info">Commonwealth Avenue</td>
              <td class="py-3.5 px-4 text-right text-luba-textSecondary">10</td>
            </tr>
            <tr>
              <td class="py-3.5 px-4 font-bold text-luba-info">Batasan Road</td>
              <td class="py-3.5 px-4 text-right text-luba-textSecondary">6</td>
            </tr>
            <tr>
              <td class="py-3.5 px-4 font-bold text-luba-info">Aurora Boulevard</td>
              <td class="py-3.5 px-4 text-right text-luba-textSecondary">5</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================================================
 * MODAL PORTAL RENDERERS (Screens 5, 6, 7, 9, 21, 22, 23, 24)
 * ========================================================================== */
function renderModalPortal(state) {
  if (!state.activeModal) return '';

  // SCREEN 5: Admin · Approve report confirmation.png
  if (state.activeModal === 'approve_report') {
    return renderModalShell({
      title: 'Approve this report?',
      subtitle: 'RW-2026-0842 · Commonwealth Avenue',
      bodyHtml: `
        <div class="flex items-center gap-2">
          ${renderStatusBadge('Under Review')}
          <span class="text-xs text-luba-textSubtle">→</span>
          ${renderStatusBadge('Verified')}
        </div>

        ${renderBanner({
          variant: 'info',
          title: 'Verification is not resolution',
          body: 'This confirms road damage and makes the report eligible for assignment. It does not mark the road repaired or Resolved.'
        })}

        <div class="border border-luba-border rounded-card p-4 space-y-2.5 text-xs">
          <h3 class="text-base font-bold text-luba-textPrimary">Review summary</h3>
          ${renderGreenCheckItem('Photo and location match')}
          ${renderGreenCheckItem('Quezon City jurisdiction confirmed')}
          ${renderGreenCheckItem('High severity · 0.8 m wide, 12 cm deep')}
          ${renderGreenCheckItem('0819 is distinct · opposite carriageway, 38 m away')}
        </div>

        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted mb-1">Required reason / verification notes *</label>
          <textarea rows="2" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.verificationForm.modalNotes}</textarea>
        </div>

        <p class="text-[11px] text-luba-textSubtle">Reason required. Your name, timestamp and decision will be recorded in the immutable audit log.</p>

        <button type="button" data-confirm-approve-report="true" class="luba-btn-primary w-full py-3">
          Confirm · mark Verified
        </button>
        <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
          Cancel approval
        </button>
      `
    });
  }

  // SCREEN 6 & 7: Admin · Reject report confirmation.png & Rejection and duplicate outcome dialog.png
  if (state.activeModal === 'reject_report' || state.activeModal === 'duplicate_outcome') {
    const isReject = state.activeModal === 'reject_report';
    return renderModalShell({
      title: 'Set review outcome',
      subtitle: isReject ? 'RW-2026-0844 · Marcos Highway, Marikina City' : 'RW-2026-0835 · Aurora Boulevard, Project 4',
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
            body: 'This closes only RW-2026-0844 without assigning a repair. The reason below is visible to the citizen. Main report RW-2026-0842 is not affected.'
          })}
          <div class="luba-field-box">
            <label class="block text-[11px] text-luba-textMuted">Rejection category *</label>
            <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${state.outcomeModal.rejectionCategory} ${SVG_CHEVRON_DOWN}</p>
          </div>
          <div class="luba-field-box">
            <label class="block text-[11px] text-luba-textMuted mb-1">Reason shown to citizen *</label>
            <textarea rows="3" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.outcomeModal.rejectionReason}</textarea>
          </div>
          ${renderStatusBadge('Rejected')}
          <p class="text-[11px] text-luba-textSubtle">A reason is required. Confirm only after checking the location. Decision and reviewer are retained in the audit log.</p>
          <button type="button" data-close-modal="true" class="luba-btn-danger w-full py-3">
            Confirm as Rejected
          </button>
        `
            : `
          ${renderBanner({
            variant: 'warning',
            title: 'Link to an existing report',
            body: 'A duplicate is closed without creating another repair task. The citizen will be notified and can follow the original.'
          })}
          <div class="luba-field-box">
            <label class="block text-[11px] text-luba-textMuted">Original report *</label>
            <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">${state.outcomeModal.originalReport} ${SVG_CHEVRON_UP}</p>
          </div>
          <div class="bg-luba-infoBg border border-luba-infoBorder rounded-control p-3.5">
            <p class="text-xs font-bold text-luba-textPrimary"><span class="text-luba-info mr-1">✓</span> RW-2026-0826 · Aurora Boulevard</p>
            <p class="text-xs text-luba-textSubtle mt-0.5">Project 4 · High · In Progress · 12 m away</p>
          </div>
          <div class="luba-field-box">
            <label class="block text-[11px] text-luba-textMuted mb-1">Reason shown to citizen *</label>
            <textarea rows="2" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.outcomeModal.duplicateReason}</textarea>
          </div>
          <div class="flex items-center gap-2">
            ${renderStatusBadge('Duplicate')}
            <span class="text-[11px] text-luba-textSubtle">Reject report tab records a Rejected outcome.</span>
          </div>
          <button type="button" data-close-modal="true" class="luba-btn-primary w-full py-3">
            Confirm as Duplicate
          </button>
        `
        }

        <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
          Cancel review
        </button>
      `
    });
  }

  // SCREEN 9: Admin · Team assignment modal.png
  if (state.activeModal === 'assign_team') {
    return renderModalShell({
      title: 'Assign a repair team',
      subtitle: 'RW-2026-0842 · Commonwealth Avenue',
      bodyHtml: `
        <div class="flex items-center gap-2">
          ${renderStatusBadge('Verified')}
          ${renderSeverityBadge('High')}
          <span class="text-xs text-luba-textSubtle">Target repair: within 48 hours</span>
        </div>

        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted">Maintenance team *</label>
          <p class="text-xs text-luba-textPrimary mt-1 flex items-center gap-1">QC North · Team Alpha ${SVG_CHEVRON_UP}</p>
        </div>

        <div class="bg-luba-canvas border border-luba-border rounded-control p-3.5 space-y-1.5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-luba-textPrimary flex items-center gap-2">
              <span class="w-4 h-4 rounded-full border border-luba-success text-luba-success inline-flex items-center justify-center text-[10px]">✓</span>
              QC North · Team Alpha
            </p>
            ${renderStatusBadge('Active')}
          </div>
          <p class="text-xs text-luba-textSubtle pl-6">4 crew · Asphalt repair · 2.1 km away</p>
          <p class="text-xs text-luba-textSubtle pt-1">QC North · Team Bravo · 6 active tasks</p>
        </div>

        <p class="text-xs text-luba-textPrimary">Team lead · Engr. Paolo Santos</p>

        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted">Target completion *</label>
          <p class="text-xs text-luba-textPrimary mt-1">21 Oct 2026 · 5:00 PM</p>
        </div>

        <div class="luba-field-box">
          <label class="block text-[11px] text-luba-textMuted mb-1">Instructions to team</label>
          <textarea rows="2" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.assignmentForm.instructions}</textarea>
        </div>

        ${renderBanner({
          variant: 'info',
          title: 'Verified → Assigned',
          body: 'Team Alpha will receive the task. The citizen will be notified of the assignment.'
        })}

        <button type="button" data-confirm-assign-team="true" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          Confirm assignment
        </button>
        <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
          Cancel
        </button>
      `
    });
  }

  // SCREEN 21: Admin · Date-range filters.png (Validation Error State)
  if (state.activeModal === 'date_range') {
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

  // SCREEN 22: Admin · Export CSV or PDF dialog.png
  if (state.activeModal === 'export_dialog') {
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

        <button type="button" data-open-modal="export_success" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          Generate CSV
        </button>
        <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
          Cancel export
        </button>
      `
    });
  }

  // SCREEN 23: Admin · Export generation error.png
  if (state.activeModal === 'export_error') {
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

        <p class="text-[11px] text-luba-textSubtle">Support reference · EXP-QC-20261021-1203. Do not attach citizen contact details when requesting help.</p>

        <button type="button" data-open-modal="export_success" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
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

  // SCREEN 24: Admin · Export success.png (Direct Local Machine CSV Download)
  if (state.activeModal === 'export_success') {
    return renderModalShell({
      title: 'Your export is ready',
      subtitle: 'Generated 21 Oct 2026 · 12:02 PM · Ana Dela Cruz',
      bodyHtml: `
        ${renderBanner({
          variant: 'success',
          title: 'CSV and PDF generated successfully',
          body: 'The files contain the same citywide snapshot and exclude citizen contact information.'
        })}

        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-luba-textPrimary inline-flex items-center gap-2">
              <svg class="w-5 h-5 text-luba-success" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
              LUBA canFindIT_QC_2026-10-21.csv
            </span>
            ${renderStatusBadge('Approved')}
          </div>
          <p class="text-luba-textSecondary">Dataset · 1,284 reports · all barangays · all statuses</p>
          <p class="text-luba-textSecondary">CSV size · 246 KB · UTF-8 · 1,284 data rows</p>
          <p class="text-luba-textSecondary">PDF size · 1.8 MB · 8 pages · summary and charts</p>
        </div>

        <button type="button" id="btn-download-local-csv" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          Download CSV
        </button>
        <button type="button" id="btn-download-local-pdf" class="luba-btn-secondary w-full py-2.5 inline-flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
          Download PDF summary
        </button>

        <p class="text-[11px] text-luba-textSubtle">Download links expire after 24 hours. Exports are recorded in the workspace audit log.</p>

        <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2.5">
          Back to analytics
        </button>
      `
    });
  }

  return '';
}

/* ============================================================================
 * MAIN RENDER & EVENT DELEGATION
 * ========================================================================== */
function renderApp() {
  const state = store.getState();
  const viewportEl = document.getElementById('main-viewport');
  const modalPortalEl = document.getElementById('modal-portal');
  const breadcrumbEl = document.getElementById('topbar-breadcrumb');
  const footerOpBadgeEl = document.getElementById('footer-operational-badge');

  if (!viewportEl) return;

  const activeScreen = SCREEN_CATALOG.find((s) => s.id === state.activeScreenId) || SCREEN_CATALOG[0];
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <span>${activeScreen.breadcrumb[0]}</span>
      <span class="mx-2 text-luba-textSubtle">/</span>
      <span>${activeScreen.breadcrumb[1]}</span>
    `;
  }

  // Match the exact right-side footer operational badge presence per PNG screen
  if (footerOpBadgeEl) {
    const screensWithOperationalDot = new Set([1, 2, 3, 4, 7, 9, 11, 14, 18, 20, 24, 26]);
    if (screensWithOperationalDot.has(activeScreen.id)) {
      footerOpBadgeEl.classList.remove('hidden');
    } else {
      footerOpBadgeEl.classList.add('hidden');
    }
  }

  // Update active sidebar navigation button highlight & orange (var(--luba-cta)) active icon matching uploaded PNGs
  document.querySelectorAll('[data-nav-section]').forEach((btn) => {
    const section = btn.getAttribute('data-nav-section');
    const icon = btn.querySelector('[data-nav-icon]');
    if (section === activeScreen.nav) {
      btn.className = 'luba-nav-btn luba-nav-btn-active';
      if (icon) icon.setAttribute('class', 'w-4 h-4 text-luba-cta shrink-0');
    } else {
      btn.className = 'luba-nav-btn';
      if (icon) icon.setAttribute('class', 'w-4 h-4 text-luba-sidebarIcon shrink-0');
    }
  });

  // Render active view (including dedicated modal background views matching the PNGs)
  const viewRenderers = {
    overview: renderOverviewView,
    reports_list: renderReportsListView,
    report_details: renderReportDetailsView,
    verification_review: renderVerificationReviewView,
    approve_report_bg: renderApproveReportBgView,
    reject_report_bg: renderRejectReportBgView,
    duplicate_outcome_bg: renderDuplicateOutcomeBgView,
    duplicate_comparison: renderDuplicateComparisonView,
    assign_team_bg: renderAssignTeamBgView,
    assignment_confirmed: renderAssignmentConfirmedView,
    repair_completion: renderRepairCompletionView,
    report_audit_log: renderReportAuditLogView,
    pothole_map: renderPotholeMapView,
    teams_list: renderTeamsListView,
    team_details: renderTeamDetailsView,
    add_personnel: renderAddPersonnelView,
    edit_personnel: renderEditPersonnelView,
    users_list: renderUsersListView,
    user_details: renderUserDetailsView,
    analytics: renderAnalyticsView,
    analytics_modal_bg: renderAnalyticsModalBgView,
    analytics_error_bg: renderAnalyticsErrorBgView,
    export_success_bg: renderExportSuccessBgView,
    admin_profile: renderAdminProfileView,
    workspace_settings: renderWorkspaceSettingsView
  };

  const renderFn = viewRenderers[state.currentView] || renderOverviewView;
  viewportEl.innerHTML = renderFn(state);
  modalPortalEl.innerHTML = renderModalPortal(state);
}

function attachGlobalEventListeners() {
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('button, [data-screen-jump], [data-open-modal], [data-close-modal]');
    if (!target) return;

    // 0. Sign out → back to the administrator login page
    if (target.hasAttribute('data-sign-out')) {
      window.location.replace('/login.html');
      return;
    }

    // 1. Direct Figma screen jump
    if (target.hasAttribute('data-screen-jump')) {
      const screenId = Number(target.getAttribute('data-screen-jump'));
      store.navigateToScreen(screenId);
      return;
    }

    // 2. Sidebar Navigation
    if (target.hasAttribute('data-nav-section')) {
      const navMap = {
        overview: 1,
        reports: 2,
        map: 13,
        users: 18,
        teams: 14,
        analytics: 20,
        settings: 26
      };
      const section = target.getAttribute('data-nav-section');
      store.navigateToScreen(navMap[section] || 1);
      return;
    }

    // 3. Open Modal
    if (target.hasAttribute('data-open-modal')) {
      const modalKey = target.getAttribute('data-open-modal');
      const modalToScreen = {
        approve_report: 5,
        reject_report: 6,
        duplicate_outcome: 7,
        assign_team: 9,
        date_range: 21,
        export_dialog: 22,
        export_error: 23,
        export_success: 24
      };
      const targetScreenId = modalToScreen[modalKey];
      if (targetScreenId) {
        store.navigateToScreen(targetScreenId);
      } else {
        store.setState({ activeModal: modalKey });
      }
      return;
    }

    // 4. Close Modal
    if (target.hasAttribute('data-close-modal')) {
      store.setState({ activeModal: null });
      return;
    }

    // 5. Open a report from Reports table
    if (target.hasAttribute('data-open-report')) {
      const code = target.getAttribute('data-open-report');
      store.setState({ selectedReportCode: code });
      store.navigateToScreen(3);
      return;
    }

    // 6. Reports Management Filter Pills & Reset
    if (target.hasAttribute('data-report-pill')) {
      const pill = target.getAttribute('data-report-pill');
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, pill }
      }));
      return;
    }
    if (target.hasAttribute('data-reset-report-filters')) {
      store.setState({
        reportFilters: {
          pill: 'All reports 1,284',
          search: '',
          status: 'All statuses',
          severity: 'All severities',
          month: 'October 2026'
        }
      });
      return;
    }

    // 7. Verification severity selector & Confirm Verified
    if (target.hasAttribute('data-select-verify-sev')) {
      const sev = target.getAttribute('data-select-verify-sev');
      store.setState((s) => ({
        verificationForm: { ...s.verificationForm, severity: sev }
      }));
      return;
    }
    if (target.hasAttribute('data-confirm-approve-report')) {
      try {
        await apiService.verifyReport('RW-2026-0842', {
          decision: 'Approved',
          confirmedSeverity: store.getState().verificationForm.severity,
          verificationNotes: store.getState().verificationForm.modalNotes,
          checklist: {
            photoShowsDamage: true,
            roadPinMatch: true,
            withinJurisdiction: true,
            nearbyDuplicatesChecked: true
          }
        });
      } catch {
        // Offline / already verified fallback
      }
      store.navigateToScreen(9);
      return;
    }

    // 8. Confirm Team Assignment -> Assignment Confirmed (Screen 10)
    if (target.hasAttribute('data-confirm-assign-team')) {
      try {
        await apiService.assignTeam('RW-2026-0842', {
          teamId: 1,
          assignmentPriority: 'High',
          targetCompletionAt: '2026-10-21 17:00:00',
          instructionsToTeam: store.getState().assignmentForm.instructions
        });
      } catch {
        // Fallback
      }
      store.navigateToScreen(10);
      return;
    }

    // 9. Select Assignment Priority on Screen 10
    if (target.hasAttribute('data-select-assign-priority')) {
      const priority = target.getAttribute('data-select-assign-priority');
      store.setState((s) => ({
        assignmentForm: { ...s.assignmentForm, priority }
      }));
      return;
    }

    // 10. Approve Repair & Mark Resolved (Screen 11 -> Screen 12 Audit Log)
    if (target.hasAttribute('data-approve-repair')) {
      try {
        await apiService.reviewCompletion('RW-2026-0842', {
          decision: 'ApprovedResolved',
          adminReviewNotes: store.getState().completionForm.reviewNotes,
          checklist: {
            sameSite: true,
            fullyFilledCompacted: true,
            surfaceFlushSafe: true,
            notesLocationConsistent: true
          }
        });
      } catch {
        // Fallback
      }
      store.navigateToScreen(12);
      return;
    }

    // 11. Map Mode Pills
    if (target.hasAttribute('data-map-mode')) {
      const modePill = target.getAttribute('data-map-mode');
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, modePill }
      }));
      return;
    }

    // 12. Edit Personnel Availability Pills
    if (target.hasAttribute('data-select-availability')) {
      const availability = target.getAttribute('data-select-availability');
      store.setState((s) => ({
        editPersonnelForm: { ...s.editPersonnelForm, availability }
      }));
      return;
    }

    // 13. Users Role Tabs
    if (target.hasAttribute('data-user-tab')) {
      const tab = target.getAttribute('data-user-tab');
      store.setState((s) => ({
        userFilters: { ...s.userFilters, tab }
      }));
      return;
    }

    // 14. User Account Status Controls (Screen 19)
    if (target.hasAttribute('data-select-user-status')) {
      const selectedStatus = target.getAttribute('data-select-user-status');
      store.setState((s) => ({
        userStatusForm: { ...s.userStatusForm, selectedStatus }
      }));
      return;
    }
    if (target.id === 'btn-confirm-user-status') {
      const uf = store.getState().userStatusForm;
      try {
        await apiService.updateUserStatus(1, {
          targetStatus: uf.selectedStatus,
          reason: uf.reason,
          acknowledgePrivilegeSeparation: uf.acknowledgePrivilegeSeparation
        });
      } catch {
        // Fallback
      }
      store.setState((s) => ({
        userStatusForm: {
          ...s.userStatusForm,
          currentStatus: uf.selectedStatus
        }
      }));
      return;
    }

    // 15. Date-Range Modal Reset (Screen 21)
    if (target.hasAttribute('data-reset-dates')) {
      store.setState((s) => ({
        analyticsState: {
          ...s.analyticsState,
          fromDate: '19 Oct 2026',
          toDate: '21 Oct 2026'
        }
      }));
      return;
    }

    // 16. Export CSV / PDF Format & Scope toggles
    if (target.hasAttribute('data-export-format')) {
      const format = target.getAttribute('data-export-format');
      store.setState((s) => ({
        exportForm: { ...s.exportForm, format }
      }));
      return;
    }
    if (target.hasAttribute('data-export-scope')) {
      const scope = target.getAttribute('data-export-scope');
      store.setState((s) => ({
        exportForm: { ...s.exportForm, scope }
      }));
      return;
    }

    // 17. Direct Local Machine CSV Download (Screen 24: "Download CSV")
    if (target.id === 'btn-download-local-csv') {
      const s = store.getState();
      await downloadCsvToLocalMachine({
        filename: 'LUBA canFindIT_QC_2026-10-21.csv',
        rows: s.reports,
        includeCitizenPii: s.exportForm.includeCitizenPii
      });
      return;
    }

    // 18. Direct Local Machine PDF Summary Download
    if (target.id === 'btn-download-local-pdf') {
      const s = store.getState();
      triggerLocalCsvDownload('LUBA canFindIT_QC_2026-10-21_Summary.csv', s.reports, false);
      return;
    }

    // 19. Profile & Workspace Toggle Switches
    if (target.hasAttribute('data-toggle-profile')) {
      const key = target.getAttribute('data-toggle-profile');
      store.setState((s) => ({
        adminProfileForm: {
          ...s.adminProfileForm,
          [key]: !s.adminProfileForm[key]
        }
      }));
      return;
    }
    if (target.hasAttribute('data-toggle-ws')) {
      const key = target.getAttribute('data-toggle-ws');
      store.setState((s) => ({
        workspaceSettingsForm: {
          ...s.workspaceSettingsForm,
          [key]: !s.workspaceSettingsForm[key]
        }
      }));
      return;
    }
    if (target.hasAttribute('data-ws-tab')) {
      const activeTab = target.getAttribute('data-ws-tab');
      store.setState((s) => ({
        workspaceSettingsForm: {
          ...s.workspaceSettingsForm,
          activeTab
        }
      }));
      return;
    }

    // 20. Save & Send Personnel Invitation (Screen 16)
    if (target.id === 'btn-save-invite-personnel') {
      const f = store.getState().addPersonnelForm;
      if (PH_MOBILE_REGEX.test(f.mobileNumber.trim())) {
        try {
          await apiService.invitePersonnel({
            fullName: f.fullName,
            email: f.email,
            mobileNumber: f.mobileNumber,
            roleSlug: 'maintenance_crew',
            teamId: 1
          });
        } catch {
          // Fallback
        }
        store.navigateToScreen(15);
      }
      return;
    }
  });

  // Input & Change listeners
  document.addEventListener('input', (e) => {
    const el = e.target;

    // Screen 16: Live PH Mobile Number Validation
    if (el.id === 'add-pers-mobile') {
      const val = el.value;
      const start = el.selectionStart;
      store.setState((s) => ({
        addPersonnelForm: { ...s.addPersonnelForm, mobileNumber: val }
      }));
      const updatedInput = document.getElementById('add-pers-mobile');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(start, start);
      }
      return;
    }

    // Screen 2: Reports search
    if (el.id === 'reports-search-input') {
      const val = el.value;
      const start = el.selectionStart;
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, search: val }
      }));
      const updatedInput = document.getElementById('reports-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(start, start);
      }
      return;
    }

    // Screen 19: Citizen Account Status Reason
    if (el.id === 'user-status-reason') {
      const val = el.value;
      const start = el.selectionStart;
      store.setState((s) => ({
        userStatusForm: {
          ...s.userStatusForm,
          reason: val,
          reasonTouched: true
        }
      }));
      const updatedInput = document.getElementById('user-status-reason');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(start, start);
      }
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;

    if (el.id === 'reports-status-select') {
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, status: el.value }
      }));
      return;
    }

    if (el.id === 'reports-severity-select') {
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, severity: el.value }
      }));
      return;
    }

    if (el.id === 'audit-status-filter') {
      store.setState((s) => ({
        auditLogFilters: { ...s.auditLogFilters, status: el.value }
      }));
      return;
    }

    if (el.id === 'chk-priv-sep') {
      store.setState((s) => ({
        userStatusForm: {
          ...s.userStatusForm,
          acknowledgePrivilegeSeparation: el.checked
        }
      }));
      return;
    }

    if (el.id === 'chk-export-pii') {
      store.setState((s) => ({
        exportForm: {
          ...s.exportForm,
          includeCitizenPii: el.checked
        }
      }));
    }
  });
}

function syncScreenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const queryScreen = Number(params.get('screen'));
  if (queryScreen >= 1 && queryScreen <= 26) {
    store.navigateToScreen(queryScreen);
    return;
  }
  const hashMatch = window.location.hash.match(/^#screen-(\d+)$/);
  if (hashMatch) {
    const hashScreen = Number(hashMatch[1]);
    if (hashScreen >= 1 && hashScreen <= 26) {
      store.navigateToScreen(hashScreen);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.lubaStore = store;
  store.subscribe(renderApp);
  attachGlobalEventListeners();
  window.addEventListener('hashchange', syncScreenFromUrl);
  syncScreenFromUrl();
  renderApp();
});
