// Page renderer for Screen 14: Maintenance Teams Management (KPI summary cards, district filters, team card grid) for City of Malolos, Bulacan.

import { renderKpiCard } from '../components/card.js';
import { renderStatusBadge } from '../components/badge.js';
import { formatLiveSnapshotDate } from '../utils/format.js';

export function renderTeams(state) {
  const teamFilter = state.teamFilters?.district || 'All teams';
  const statusFilter = state.teamFilters?.status || 'Active teams';
  const searchQuery = (state.teamFilters?.search || '').toLowerCase().trim();

  const filteredTeams = (state.teams || []).filter((t) => {
    // 1. Team Name filter
    if (teamFilter && teamFilter !== 'All teams' && teamFilter !== 'All zones') {
      if ((t.title || '').toLowerCase() !== teamFilter.toLowerCase()) return false;
    }

    // 2. Status filter
    if (statusFilter && statusFilter !== 'All statuses') {
      if (statusFilter === 'Active teams' && (t.status || '') !== 'Active') return false;
      if (statusFilter === 'Inactive' && (t.status || '') === 'Active') return false;
    }

    // 3. Search query
    if (searchQuery) {
      const matchTitle = (t.title || '').toLowerCase().includes(searchQuery);
      const matchLead = (t.lead || '').toLowerCase().includes(searchQuery);
      const matchArea = (t.serviceArea || '').toLowerCase().includes(searchQuery);
      const matchSpec = (t.specialty || '').toLowerCase().includes(searchQuery);
      if (!matchTitle && !matchLead && !matchArea && !matchSpec) return false;
    }

    return true;
  });

  const allReports = state.reports || [];
  const assignedReportsCount = allReports.filter((r) => r.status === 'Assigned').length;
  const inProgressReportsCount = allReports.filter((r) => r.status === 'In Progress').length;
  const activeTeamsCount = (state.teams || []).filter((t) => (t.status || 'Active') === 'Active').length;

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Maintenance teams</h1>
          <p class="luba-page-subtitle">City of Malolos, Bulacan · Crew availability, service zones and workload · ${formatLiveSnapshotDate()}</p>
        </div>
        <button type="button" data-screen-jump="create_team" class="luba-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5">
          + Create team
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderKpiCard({ label: 'Active teams', value: String(activeTeamsCount || state.teams?.length || 2), subtitle: 'Highway & Poblacion zones' })}
        ${renderKpiCard({ label: 'Field personnel', value: String((state.users || []).filter((u) => (u.role || '').toLowerCase().includes('maintenance')).length || '14'), subtitle: 'Team leads and crew' })}
        ${renderKpiCard({ label: 'Assigned reports', value: String(assignedReportsCount || '14'), subtitle: 'Citywide · all teams' })}
        ${renderKpiCard({ label: 'In progress', value: String(inProgressReportsCount || '7'), subtitle: 'Includes repairs awaiting review' })}
      </div>

      <!-- Filters: Search, All Zones / Team Names, Status -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[260px] flex items-center gap-2 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input
            type="text"
            id="teams-search-input"
            value="${state.teamFilters?.search || ''}"
            placeholder="Search team, lead or service area"
            class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle focus:outline-none bg-transparent"
          />
        </div>

        <!-- Filter by Team Name -->
        <label class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5 cursor-pointer">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <select id="teams-zone-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary bg-transparent focus:outline-none cursor-pointer">
            <option value="All teams" ${teamFilter === 'All teams' || teamFilter === 'All zones' ? 'selected' : ''}>All teams</option>
            ${(state.teams || []).map((t) => `<option value="${t.title}" ${teamFilter === t.title ? 'selected' : ''}>${t.title}</option>`).join('')}
          </select>
        </label>

        <!-- Status Filter -->
        <label class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5 cursor-pointer">
          <svg class="w-3.5 h-3.5 text-luba-textPrimary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          <select id="teams-status-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary bg-transparent focus:outline-none cursor-pointer">
            <option value="All statuses" ${statusFilter === 'All statuses' ? 'selected' : ''}>All statuses</option>
            <option value="Active teams" ${statusFilter === 'Active teams' ? 'selected' : ''}>Active teams</option>
            <option value="Inactive" ${statusFilter === 'Inactive' ? 'selected' : ''}>Inactive teams</option>
          </select>
        </label>
      </div>

      <!-- Teams Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        ${filteredTeams.length > 0
          ? filteredTeams
              .map(
                (t) => `
              <div class="luba-card p-5 space-y-3">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-luba-infoPillBg text-luba-info flex items-center justify-center font-bold">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M2 18h20M4 18v-5a8 8 0 0116 0v5M10 8V5a2 2 0 014 0v3"/></svg>
                    </div>
                    <div>
                      <h2 class="text-base font-bold text-luba-textPrimary">${t.title}${t.unsynced ? ' <span class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 align-middle" title="Saved only in this browser. Syncing to Supabase...">Not synced</span>' : ''}</h2>
                      <p class="text-xs text-luba-textSubtle">${t.lead}</p>
                    </div>
                  </div>
                  ${renderStatusBadge(t.status || 'Active')}
                </div>
                <div class="space-y-1.5 text-xs text-luba-textSecondary pt-1">
                  <p>Service area · ${t.serviceArea}</p>
                  <p>Crew size · ${t.crewSize || '4 maintenance personnel'}</p>
                  <p>Specialty · ${t.specialty}</p>
                </div>
                <div class="flex items-center justify-between pt-2 text-xs">
                  <span class="font-bold text-luba-cta">${t.workload || '0 assigned · 0 in progress'}</span>
                  <button type="button" data-view-team="${t.code}" class="font-bold text-luba-info hover:underline cursor-pointer">Manage team →</button>
                </div>
              </div>
            `
              )
              .join('')
          : `
            <div class="lg:col-span-2 luba-card p-10 text-center text-xs text-luba-textSubtle">
              No maintenance teams found matching "${teamFilter}".
            </div>
          `}
      </div>

      <p class="text-xs text-luba-textSubtle">Showing ${filteredTeams.length} of ${state.teams?.length || 2} teams · City of Malolos Engineering divisions</p>
    </div>
  `;
}

export { renderTeams as renderTeamsListView };
