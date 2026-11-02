// Page renderer for Screen 1: Operations Overview (KPIs, distribution graphs, schematic map, needs-attention queue).

import { renderBanner } from '../components/banner.js';
import { renderKpiCard } from '../components/card.js';
import { renderStatusBadge, renderSeverityBadge } from '../components/badge.js';
import { renderOverviewMapContainer } from '../components/realMalolosMap.js';
import { renderStatusDistributionCard, renderSeverityDistributionCard } from '../components/distributionCards.js';
import { formatNumberWithCommas } from '../utils/format.js';

export function renderOverview(state) {
  const reports = state?.reports || [];
  const totalReports = reports.length;
  const submittedCount = reports.filter((r) => r.status === 'Submitted').length;
  const underReviewCount = reports.filter((r) => r.status === 'Under Review').length;
  const pendingCount = submittedCount + underReviewCount;
  const verifiedCount = reports.filter((r) => r.status === 'Verified').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;
  const assignedCount = reports.filter((r) => r.status === 'Assigned').length;
  const exceptionsCount = reports.filter((r) => r.status === 'Rejected' || r.status === 'Duplicate').length;

  const latestNewReport = (reports || []).find(
    (r) => (r.status === 'Submitted' || r.status === 'Under Review') &&
           r.code !== 'RW-2026-0842' &&
           !['RW-2026-0839','RW-2026-0838','RW-2026-0837','RW-2026-0836','RW-2026-0835','RW-2026-0798','RW-2026-0789','RW-2026-0771','RW-2026-0745','RW-2026-0723'].includes(r.code)
  );

  return `
    <div class="space-y-5">
      <!-- Page Header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">City road operations</h1>
          <p class="luba-page-subtitle">City of Malolos, Bulacan · All reports · Live Supabase database</p>
        </div>
        <button type="button" data-open-modal="export_dialog" class="luba-btn-secondary inline-flex items-center gap-2 px-4 py-2.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          Export summary
        </button>
      </div>

      <!-- Info Callout Banner -->
      ${renderBanner({
        variant: 'info',
        title: `${pendingCount} reports need a first review`,
        body: `${submittedCount} Submitted + ${underReviewCount} Under Review · Prioritize high-severity reports and roads with heavy traffic.`
      })}

      <!-- 5 KPI Cards Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        ${renderKpiCard({ label: 'Total reports', value: formatNumberWithCommas(totalReports), subtitle: 'All statuses · citywide' })}
        ${renderKpiCard({ label: 'Pending review', value: formatNumberWithCommas(pendingCount), subtitle: `${submittedCount} submitted · ${underReviewCount} under review` })}
        ${renderKpiCard({ label: 'Verified', value: formatNumberWithCommas(verifiedCount), subtitle: 'Ready for team assignment' })}
        ${renderKpiCard({ label: 'In progress', value: formatNumberWithCommas(inProgressCount), subtitle: 'Active work / repair review' })}
        ${renderKpiCard({ label: 'Resolved', value: formatNumberWithCommas(resolvedCount), subtitle: 'LGU-approved repairs only' })}
      </div>

      <!-- Status & Severity Distribution Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-6">
          ${renderStatusDistributionCard(state)}
        </div>

        <div class="lg:col-span-6 space-y-4">
          ${renderSeverityDistributionCard(state)}

          <div class="grid grid-cols-2 gap-4">
            ${renderKpiCard({ label: 'Assigned', value: formatNumberWithCommas(assignedCount), subtitle: 'Awaiting work start' })}
            ${renderKpiCard({ label: 'Closed exceptions', value: formatNumberWithCommas(exceptionsCount), subtitle: 'Rejected + duplicate' })}
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
          ${renderOverviewMapContainer({ mapViewType: 'real' })}
          <div class="flex items-center gap-2 text-xs">
            ${renderSeverityBadge('High')}
            ${renderSeverityBadge('Medium')}
            ${renderSeverityBadge('Low')}
            <span class="text-luba-textSubtle ml-1">Guinhawa / MacArthur Hwy corridor · City of Malolos GPS</span>
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
            <p class="text-sm font-bold text-luba-textPrimary">Paseo del Congreso</p>
            <p class="text-xs text-luba-textSubtle leading-relaxed">RW-2026-0840 · In Progress · Malolos Team Bravo</p>
            <button type="button" data-screen-jump="2" class="text-xs font-bold text-luba-cta hover:underline inline-flex items-center gap-1">
              View priority reports →
            </button>
          </div>
          ${
            latestNewReport
              ? `
          <div class="luba-card p-4 space-y-2 border-l-4 border-l-luba-info bg-sky-50/20">
            <div class="flex items-center justify-between">
              ${renderStatusBadge(latestNewReport.status || 'Submitted')}
              ${renderSeverityBadge(latestNewReport.severity || 'Medium')}
            </div>
            <p class="text-sm font-bold text-luba-textPrimary">${latestNewReport.road || 'Unspecified Road'}</p>
            <p class="text-xs text-luba-textSubtle leading-relaxed">${latestNewReport.code || ''} · ${latestNewReport.barangay || 'City of Malolos'} · ${latestNewReport.citizen?.name || latestNewReport.citizenName || 'Citizen'}</p>
            <button type="button" data-open-report="${latestNewReport.code}" class="text-xs font-bold text-luba-info hover:underline inline-flex items-center gap-1 cursor-pointer">
              Review new citizen report →
            </button>
          </div>
              `
              : ''
          }
        </div>
      </div>
    </div>
  `;
}

export { renderOverview as renderOverviewView };
