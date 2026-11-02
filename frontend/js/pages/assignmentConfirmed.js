// Page renderer for Screen 10: Assignment Review and Confirmation (team details, editable assignment priority, notification log) for City of Malolos, Bulacan.

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge } from '../components/badge.js';
import { renderPillButton } from '../components/controls.js';
import { SVG_CHEVRON_UP } from '../data/constants.js';
import { getReportPhotoUrl } from '../utils/format.js';

export function renderAssignmentConfirmed(state) {
  const af = state.assignmentForm || {};
  const currentCode = state.selectedReportCode || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || state.reports?.[0] || {};
  const allTeams = state.teams || [];
  const assignedTeamName = report.assignedTeam || af.teamName || 'Malolos Team Alpha';
  const matchedTeam = allTeams.find((t) => t.title === assignedTeamName || t.code === assignedTeamName);

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Assignment confirmed</h1>
          <p class="luba-page-subtitle">${report.code || currentCode} · City of Malolos · Assigned 19 October 2026 at 10:30 AM PHT</p>
        </div>
      </div>

      ${renderBanner({
        variant: 'success',
        title: 'Verified → Assigned / Dispatched',
        body: `${state.adminProfileForm?.fullName || 'Administrator'} assigned ${matchedTeam?.title || assignedTeamName}. Work has not started; accepting the task does not mark it In Progress.`
      })}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="${getReportPhotoUrl(report)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Assigned pothole" class="w-full h-[304px] object-cover"/>
          </div>

          <div class="luba-card p-5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-luba-textPrimary">RW-2026-0842</span>
              ${renderStatusBadge('Assigned')}
            </div>
            <h2 class="text-lg font-bold text-luba-textPrimary">MacArthur Highway (Manila North Road)</h2>
            <p class="text-xs text-luba-textSubtle">Northbound lane near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan</p>
            <p class="text-xs font-medium text-luba-danger">High severity · 0.8 m wide · 12 cm deep · DPWH-National Road</p>
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
              <p class="text-xs font-bold text-luba-textPrimary">${matchedTeam?.title || assignedTeamName}</p>
              <p class="text-xs text-luba-textSubtle mt-0.5">Lead · ${matchedTeam?.lead || af.leadName || 'Engr. Paolo Santos'}</p>
              <p class="text-xs text-luba-textSubtle mt-0.5">${matchedTeam?.email || 'maintenance@malolos.gov.ph'} · ${matchedTeam?.crewSize || '4 crew'}</p>
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
          <button type="button" data-screen-jump="15" data-view-team="${matchedTeam?.code || 'MALOLOS-ALPHA'}" class="luba-btn-secondary w-full py-2.5">
            View ${matchedTeam?.title || 'Team Alpha'}
          </button>
        </div>
      </div>
    </div>
  `;
}

export { renderAssignmentConfirmed as renderAssignmentConfirmedView };
