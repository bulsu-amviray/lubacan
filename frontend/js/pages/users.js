// Page component for Screen 18: User management
import { renderKpiCard } from '../components/card.js';
import { renderPillButton } from '../components/controls.js';
import { renderBanner } from '../components/banner.js';
import { renderStatusBadge } from '../components/badge.js';
import { formatNumberWithCommas } from '../utils/format.js';

export function renderUsersListView(state) {
  const tabs = ['All users', 'Citizens', 'LGU staff', 'Maintenance', 'Invitations'];
  const activeTab = state.userFilters?.tab || 'All users';
  const searchQuery = (state.userFilters?.search || '').toLowerCase().trim();
  const roleFilter = state.userFilters?.role || 'All roles';
  const statusFilter = state.userFilters?.status || 'All statuses';

  const allUsers = state.users || [];

  // Dynamic live KPI counters calculated from live database state
  const citizenCount = allUsers.filter((u) => (u.role || '').toLowerCase().includes('citizen')).length;
  const lguAdminCount = allUsers.filter((u) =>
    (u.role || '').toLowerCase().includes('admin') ||
    (u.role || '').toLowerCase().includes('reviewer') ||
    (u.role || '').toLowerCase().includes('lgu')
  ).length;
  const maintenanceCount = allUsers.filter((u) =>
    (u.role || '').toLowerCase().includes('maintenance') ||
    (u.role || '').toLowerCase().includes('lead') ||
    (u.role || '').toLowerCase().includes('crew')
  ).length;
  const pendingInvitationsCount = allUsers.filter((u) =>
    (u.status || '').toLowerCase() === 'invited' ||
    (u.status || '').toLowerCase() === 'pending'
  ).length;

  const filteredUsers = allUsers.filter((u) => {
    // 1. Tab filter
    if (activeTab === 'Citizens') {
      const isCitizen = (u.role || '').toLowerCase().includes('citizen');
      if (!isCitizen) return false;
    } else if (activeTab === 'LGU staff') {
      const isLguStaff = (u.role || '').toLowerCase().includes('lgu') ||
                         (u.role || '').toLowerCase().includes('admin') ||
                         (u.role || '').toLowerCase().includes('reviewer');
      if (!isLguStaff) return false;
    } else if (activeTab === 'Maintenance') {
      const isMaint = (u.role || '').toLowerCase().includes('maintenance') ||
                      (u.role || '').toLowerCase().includes('lead') ||
                      (u.role || '').toLowerCase().includes('crew');
      if (!isMaint) return false;
    } else if (activeTab === 'Invitations') {
      const isInvited = (u.status || '').toLowerCase() === 'invited';
      if (!isInvited) return false;
    }

    // 2. Role dropdown filter
    if (roleFilter !== 'All roles') {
      if ((u.role || '') !== roleFilter) return false;
    }

    // 3. Status dropdown filter
    if (statusFilter !== 'All statuses') {
      if ((u.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    // 4. Search filter
    if (searchQuery) {
      const matchName = (u.name || '').toLowerCase().includes(searchQuery);
      const matchEmail = (u.email || '').toLowerCase().includes(searchQuery);
      const matchArea = (u.area || u.department || '').toLowerCase().includes(searchQuery);
      if (!matchName && !matchEmail && !matchArea) return false;
    }

    return true;
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">User management</h1>
          <p class="luba-page-subtitle">Manage citizen accounts, LGU staff and maintenance access.</p>
        </div>
        <button type="button" data-open-modal="invite_staff" class="luba-btn-primary inline-flex items-center gap-2 px-4 py-2.5 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
          Invite staff member
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderKpiCard({ label: 'Citizen accounts', value: formatNumberWithCommas(citizenCount), subtitle: 'Verified email addresses' })}
        ${renderKpiCard({ label: 'LGU administrators', value: formatNumberWithCommas(lguAdminCount), subtitle: 'Role-based access' })}
        ${renderKpiCard({ label: 'Maintenance personnel', value: formatNumberWithCommas(maintenanceCount), subtitle: `Across ${state.teams?.length || 2} field teams` })}
        ${renderKpiCard({ label: 'Pending invitations', value: formatNumberWithCommas(pendingInvitationsCount), subtitle: 'Expire after 7 days' })}
      </div>

      <!-- 5 Role Filter Tabs -->
      <div class="flex flex-wrap gap-2">
        ${tabs
          .map((t) =>
            renderPillButton({
              label: t,
              active: activeTab === t,
              dataAttr: `data-user-tab="${t}"`
            })
          )
          .join('')}
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[260px] flex items-center gap-2 bg-white border border-luba-border rounded-control px-3.5 py-2.5">
          <svg class="w-4 h-4 text-luba-textSubtle shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="text" id="users-search-input" value="${state.userFilters?.search || ''}" placeholder="Search name or email address" class="w-full text-xs text-luba-textPrimary placeholder-luba-textSubtle focus:outline-none bg-transparent"/>
        </div>
        <label class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5 cursor-pointer">
          <select id="users-role-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary bg-transparent focus:outline-none cursor-pointer">
            ${['All roles', 'Citizen', 'LGU administrator', 'LGU reviewer', 'Maintenance lead', 'Maintenance crew']
              .map((r) => `<option value="${r}" ${roleFilter === r ? 'selected' : ''}>${r}</option>`)
              .join('')}
          </select>
        </label>
        <label class="luba-btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5 cursor-pointer">
          <select id="users-status-select" class="luba-clean-select text-xs font-bold text-luba-textPrimary bg-transparent focus:outline-none cursor-pointer">
            ${['All statuses', 'Active', 'Invited', 'Suspended']
              .map((st) => `<option value="${st}" ${statusFilter === st ? 'selected' : ''}>${st}</option>`)
              .join('')}
          </select>
        </label>
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
            ${filteredUsers.length > 0
              ? filteredUsers
                  .map(
                    (u) => `
                  <tr class="luba-table-row">
                    <td class="py-3.5 px-4">
                      <button type="button" data-open-user="${u.id}" class="font-bold text-luba-info hover:underline text-left cursor-pointer">${u.name}</button>
                    </td>
                    <td class="py-3.5 px-4 text-luba-textSecondary">${u.email}</td>
                    <td class="py-3.5 px-4 text-luba-textSecondary">${u.role}</td>
                    <td class="py-3.5 px-4 text-luba-textSecondary">${u.area || u.department || 'City of Malolos'}</td>
                    <td class="py-3.5 px-4">${renderStatusBadge(u.status)}</td>
                  </tr>
                `
                  )
                  .join('')
              : `
                <tr class="luba-table-row">
                  <td colspan="5" class="py-10 text-center text-xs text-luba-textSubtle">
                    No users found matching "${activeTab}".
                  </td>
                </tr>
              `}
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 text-xs text-luba-textSubtle">
        <span>Showing 1–${filteredUsers.length} of ${filteredUsers.length} results</span>
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
