// Modal component for Screen 9: Team assignment & DPWH forwarding modal (City of Malolos)
import { renderModalShell } from '../components/modal.js';
import { renderStatusBadge, renderSeverityBadge } from '../components/badge.js';
import { renderBanner } from '../components/banner.js';
import { SVG_CHEVRON_UP } from '../data/constants.js';

export function renderAssignTeamModal(state) {
  const currentCode = (state && state.selectedReportCode) || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || {
    code: currentCode,
    road: 'MacArthur Highway (Manila North Road)',
    barangay: 'Guinhawa',
    jurisdiction: 'DPWH-National',
    severity: 'High',
    status: 'Verified'
  };

  const isDpwh = report.jurisdiction === 'DPWH-National';
  const allTeams = (state && state.teams && state.teams.length > 0) ? state.teams : [];
  const af = state.assignmentForm || {};

  // Find currently selected team
  const selectedTeamTitle = af.teamName || report.assignedTeam || (isDpwh ? 'DPWH Bulacan 1st District Engineering Office' : (allTeams[0]?.title || 'Malolos Team Alpha'));
  const matchedTeam = allTeams.find((t) => t.title === selectedTeamTitle || t.code === selectedTeamTitle);
  const isSelectedDpwh = selectedTeamTitle === 'DPWH Bulacan 1st District Engineering Office';

  return renderModalShell({
    title: isDpwh ? 'Forward Report to DPWH' : 'Assign Maintenance Team',
    subtitle: `${report.code} · ${report.road}, Brgy. ${report.barangay}`,
    bodyHtml: `
      <div class="flex items-center gap-2">
        ${renderStatusBadge(report.status || 'Verified')}
        ${renderSeverityBadge(report.severity || 'Medium')}
        <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
          isDpwh
            ? 'bg-amber-100 text-amber-800 border border-amber-200'
            : 'bg-blue-50 text-luba-info border border-luba-infoBorder'
        }">${report.jurisdiction || 'City'}</span>
        <span class="text-xs text-luba-textSubtle">Target resolution: within 48 hours</span>
      </div>

      ${
        isDpwh
          ? renderBanner({
              variant: 'warning',
              title: 'National Highway Corridor Notice',
              body: `${report.road} is under DPWH Bulacan 1st District Engineering Office. Forwarding transmits the verified GPS coordinates, photo evidence, and safety notes directly to DPWH.`
            })
          : renderBanner({
              variant: 'info',
              title: 'City Road Repair Dispatch',
              body: `${report.road} is under City of Malolos City Engineering Office jurisdiction. Malolos Team Alpha is on-duty and available for immediate dispatch.`
            })
      }

      <!-- Assigned Maintenance Unit Selector (Synced with registered teams) -->
      <div class="luba-field-box">
        <label for="assign-team-select" class="block text-[11px] text-luba-textMuted font-medium mb-1">Assigned maintenance unit</label>
        <div class="relative">
          <select id="assign-team-select" class="w-full text-xs text-luba-textPrimary font-semibold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-6">
            ${isDpwh ? `<option value="DPWH Bulacan 1st District Engineering Office" ${selectedTeamTitle === 'DPWH Bulacan 1st District Engineering Office' ? 'selected' : ''}>DPWH Bulacan 1st District Engineering Office (National Road Liaison)</option>` : ''}
            ${allTeams.map((t) => `
              <option value="${t.title}" ${selectedTeamTitle === t.title ? 'selected' : ''}>
                ${t.title} (${t.serviceArea?.split('(')[0]?.trim() || t.serviceArea || 'Maintenance Unit'})
              </option>
            `).join('')}
          </select>
          <span class="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-luba-textSubtle">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </span>
        </div>
      </div>

      <!-- Real-Time Team Summary Card -->
      <div class="bg-luba-canvas border border-luba-border rounded-control p-3.5 space-y-1.5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-luba-textPrimary flex items-center gap-2">
            <span class="w-4 h-4 rounded-full border border-luba-success text-luba-success inline-flex items-center justify-center text-[10px]">✓</span>
            ${isSelectedDpwh ? 'National DEO Liaison Desk · Bulacan 1st' : (matchedTeam ? `${matchedTeam.title} · ${matchedTeam.serviceArea?.split('(')[0]?.trim() || 'Service Corridor'}` : 'Malolos Team Alpha · Highway Corridor')}
          </p>
          ${renderStatusBadge(isSelectedDpwh ? 'Active' : (matchedTeam?.status || 'Active'))}
        </div>
        <p class="text-xs text-luba-textSubtle pl-6">
          ${isSelectedDpwh ? 'Automated digital dispatch via LGU-DPWH coordination protocol' : (matchedTeam ? `${matchedTeam.crewSize || '4 crew members'} · ${matchedTeam.specialty || 'Asphalt patching'}` : '4 crew members · Asphalt patching & concrete re-blocking')}
        </p>
        ${matchedTeam?.workload ? `<p class="text-[11px] text-luba-cta pl-6 font-semibold">Active team workload: ${matchedTeam.workload}</p>` : ''}
      </div>

      <p class="text-xs text-luba-textPrimary">
        ${isSelectedDpwh ? 'DEO Contact · Bulacan 1st District Engineering Office ((044) 791-0018)' : (matchedTeam ? `Team lead · ${matchedTeam.lead || 'Maintenance Lead'} ${matchedTeam.phone ? `(${matchedTeam.phone})` : ''}` : 'Team lead · Engr. Paolo Santos (+63 917 000 0210)')}
      </p>

      <div class="luba-field-box">
        <label class="block text-[11px] text-luba-textMuted">Target completion schedule</label>
        <p class="text-xs text-luba-textPrimary mt-1 font-medium">Within 48 hours · 5:00 PM PHT</p>
      </div>

      <div class="luba-field-box">
        <label class="block text-[11px] text-luba-textMuted mb-1">Dispatch / Forwarding instructions</label>
        <textarea id="assign-instructions-input" rows="2" class="w-full text-xs text-luba-textPrimary focus:outline-none resize-none">${state.assignmentForm.instructions}</textarea>
      </div>

      <div class="space-y-2 pt-1">
        ${
          isSelectedDpwh
            ? `<button type="button" data-confirm-forward-dpwh="true" class="luba-btn-primary bg-amber-600 hover:bg-amber-700 text-white w-full py-3 inline-flex items-center justify-center gap-2 font-bold shadow-sm cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                Confirm & Forward to DPWH
              </button>`
            : `<button type="button" data-confirm-assign-team="true" class="luba-btn-primary w-full py-3 inline-flex items-center justify-center gap-2 font-bold shadow-sm cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                Confirm Assignment (${matchedTeam?.title || selectedTeamTitle})
              </button>`
        }

        <button type="button" data-close-modal="true" class="luba-btn-secondary w-full py-2">
          Cancel
        </button>
      </div>
    `
  });
}
