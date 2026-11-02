// Page renderer for Screen 15: Maintenance Team Details (Team Alpha, lead info, availability & workload, crew table, assigned task list) for City of Malolos, Bulacan.

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge } from '../components/badge.js';
import { formatLiveSnapshotDate } from '../utils/format.js';

export function renderTeamDetail(state) {
  const selectedCode = state.selectedTeamCode || 'MALOLOS-ALPHA';
  const team = (state.teams || []).find((t) => t.code === selectedCode || t.title === selectedCode) || state.teams?.[0] || {
    code: 'MALOLOS-ALPHA',
    title: 'Malolos Team Alpha',
    lead: 'Engr. Paolo Santos',
    serviceArea: 'Highway / Commercial Corridor',
    specialty: 'Asphalt patching & concrete re-blocking',
    workload: '8 assigned · 3 in progress',
    status: 'Active',
    email: 'paolo.santos@malolos.gov.ph',
    phone: '+63 917 000 0210'
  };

  // Find all live reports assigned to this specific team
  const assignedReports = (state.reports || []).filter(
    (r) => r.assignedTeam === team.title || r.assignedTeam === team.code
  );
  const assignedCount = assignedReports.filter((r) => r.status === 'Assigned').length;
  const inProgressCount = assignedReports.filter((r) => r.status === 'In Progress').length;
  const dynamicWorkload = assignedReports.length > 0
    ? `${assignedCount} Assigned · ${inProgressCount} In Progress`
    : (team.workload || '0 Assigned · 0 In Progress');

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">${team.title}</h1>
          <p class="luba-page-subtitle">${team.serviceArea} · ${team.specialty} · ${formatLiveSnapshotDate()}</p>
        </div>
        <button type="button" data-screen-jump="14" class="luba-btn-secondary px-4 py-2.5">
          Back to teams
        </button>
      </div>

      <div class="flex items-center gap-2.5">
        ${renderStatusBadge(team.status || 'Active')}
        <button type="button" data-screen-jump="26" class="luba-btn-secondary px-3.5 py-2">
          Manage team
        </button>
        <button type="button" data-screen-jump="16" class="luba-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
          Add personnel
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-7 luba-card p-5 space-y-2">
          <h2 class="text-lg font-bold text-luba-textPrimary">${team.lead}</h2>
          <p class="text-xs font-bold text-luba-textPrimary">Maintenance lead · ${team.title}</p>
          <p class="text-xs text-luba-textSubtle">${team.email || (team.lead.toLowerCase().includes('jessa') ? 'jessa.aquino@malolos.gov.ph' : 'paolo.santos@malolos.gov.ph')}</p>
          <p class="text-xs text-luba-textSubtle">${team.phone || '+63 917 000 0210'} · Active contact</p>
          <p class="text-[11px] text-luba-textSubtle pt-1">Lead supervises ${team.crewSize || 'maintenance personnel'}.</p>
        </div>
        <div class="lg:col-span-5 luba-card p-5 space-y-2">
          <h2 class="text-lg font-bold text-luba-textPrimary">Availability & workload</h2>
          <p class="text-xs text-luba-textSubtle">Available for scheduled assignments in ${team.serviceArea}</p>
          <p class="text-xs font-bold text-luba-cta">${dynamicWorkload}</p>
          <p class="text-[11px] text-luba-textSubtle">Tasks await maintenance team field execution and admin review.</p>
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
                <td class="py-3.5 px-4">${renderStatusBadge(c.availability || 'On duty')}</td>
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

      <!-- Assigned Task List (Live Synced with Assigned Reports) -->
      <div class="luba-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-luba-textPrimary">Assigned task list · ${team.title}</h3>
          <span class="text-xs text-luba-textSubtle">${assignedReports.length} total assignments</span>
        </div>
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
              ${assignedReports.length > 0
                ? assignedReports
                    .map(
                      (r) => `
                    <tr class="luba-table-row">
                      <td class="py-3 px-4 font-bold text-luba-info">
                        <button type="button" data-open-report="${r.code}" class="hover:underline cursor-pointer">${r.code}</button>
                      </td>
                      <td class="py-3 px-4 text-luba-textSecondary font-medium">${r.road}</td>
                      <td class="py-3 px-4">${renderStatusBadge(r.status)}</td>
                      <td class="py-3 px-4 text-luba-textSecondary">${r.targetCompletion || 'Within 48 hours'}</td>
                    </tr>
                  `
                    )
                    .join('')
                : `
                    <tr class="luba-table-row">
                      <td class="py-3 px-4 font-bold text-luba-info">
                        <button type="button" data-open-report="RW-2026-0841" class="hover:underline cursor-pointer">RW-2026-0841</button>
                      </td>
                      <td class="py-3 px-4 text-luba-textSecondary">Capitol Compound Road</td>
                      <td class="py-3 px-4">${renderStatusBadge('Assigned')}</td>
                      <td class="py-3 px-4 text-luba-textSecondary">22 Oct · 5 PM</td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
        <p class="text-[11px] text-luba-textSubtle">Showing active tasks dispatched to ${team.title}. Current open workload: ${dynamicWorkload}.</p>
      </div>

      ${renderBanner({
        variant: 'info',
        title: 'Protect ongoing task ownership',
        body: 'Team or lead changes require an explicit handover. Existing tasks are not silently reassigned when personnel details change.'
      })}
    </div>
  `;
}

export { renderTeamDetail as renderTeamDetailsView };
