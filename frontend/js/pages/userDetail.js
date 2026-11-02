// Page component for Screen 19: User details and account management
import { renderStatusBadge } from '../components/badge.js';
import { renderBanner } from '../components/banner.js';
import { renderPillButton } from '../components/controls.js';

export function renderUserDetailsView(state) {
  const uf = state.userStatusForm;
  const rawId = state.selectedUserId;
  const selectedId = isNaN(Number(rawId)) ? rawId : Number(rawId);
  const user = (state.users || []).find((u) => u.id === selectedId || String(u.id) === String(rawId)) || {
    id: 1,
    name: 'Mika Reyes',
    email: 'mika.reyes@malolos.gov.ph',
    mobile: '+63 917 000 0184',
    role: 'Citizen',
    area: 'Guinhawa',
    status: 'Active'
  };

  const hasChangedStatus = uf.selectedStatus !== uf.currentStatus;
  const hasValidReason = uf.reasonTouched && uf.reason.trim().length >= 5;
  const canConfirm = hasChangedStatus && hasValidReason && uf.acknowledgePrivilegeSeparation;

  const isCitizen = user.role === 'Citizen';
  const roleSubtitle = isCitizen
    ? 'Citizen account · Joined October 2026 · City of Malolos'
    : `${user.role} account · Joined October 2026 · City of Malolos`;

  const userArea = user.area || user.department_or_area || 'City of Malolos';
  const areaDisplay = userArea.toLowerCase().includes('malolos') ? userArea : `${userArea}, City of Malolos`;
  const mobileDisplay = user.mobile || user.mobile_number || (user.id === 2 ? '+63 917 000 0192' : user.id === 1 ? '+63 917 000 0184' : '+63 917 000 0215');

  // Filter recent reports submitted by this user
  const userReports = (state.reports || []).filter((r) => {
    if (!r.citizen) return false;
    return (
      (r.citizen.name && r.citizen.name.toLowerCase() === user.name.toLowerCase()) ||
      (r.citizen.email && r.citizen.email.toLowerCase() === user.email.toLowerCase())
    );
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">${user.name}</h1>
          <p class="luba-page-subtitle">${roleSubtitle}</p>
        </div>
        <button type="button" data-screen-jump="18" class="luba-btn-secondary px-4 py-2.5 cursor-pointer">
          Back to users
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-7 space-y-5">
          <div class="luba-card p-6 space-y-3">
            <h2 class="text-lg font-bold text-luba-textPrimary">Account details</h2>
            <div class="flex gap-2">
              ${renderStatusBadge(user.status || uf.currentStatus)}
              ${renderStatusBadge('Verified email')}
            </div>
            <div class="space-y-2 text-xs text-luba-textSecondary pt-1">
              <p>Email · ${user.email}</p>
              <p>Mobile · ${mobileDisplay}</p>
              <p>Barangay · ${areaDisplay}</p>
              <p>Role · ${user.role} · Read-only in this view</p>
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
                ${userReports.length > 0
                  ? userReports
                      .map(
                        (r) => `
                        <tr class="luba-table-row">
                          <td class="py-3.5 px-4 font-bold text-luba-info">
                            <button type="button" data-open-report="${r.code}" class="font-bold text-luba-info hover:underline text-left cursor-pointer">${r.code}</button>
                          </td>
                          <td class="py-3.5 px-4 text-luba-textSecondary">${r.road}</td>
                          <td class="py-3.5 px-4 text-luba-textSecondary">${r.status}</td>
                        </tr>
                      `
                      )
                      .join('')
                  : `
                    <tr class="luba-table-row">
                      <td colspan="3" class="py-8 px-4 text-center text-xs text-luba-textSubtle">
                        No recent reports recorded for ${user.name}.
                      </td>
                    </tr>
                  `}
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
              <input type="checkbox" id="chk-priv-sep" ${uf.acknowledgePrivilegeSeparation ? 'checked' : ''} class="w-4 h-4 rounded border-luba-textMuted accent-luba-navy cursor-pointer"/>
              <span>I understand account status does not edit privileges</span>
            </label>

            <button
              type="button"
              id="btn-confirm-user-status"
              ${!canConfirm ? 'disabled' : ''}
              class="w-full py-2.5 ${canConfirm ? 'luba-btn-primary cursor-pointer' : 'luba-btn-disabled'}"
            >
              Confirm status change
            </button>

            <button type="button" data-reset-user-status="true" class="luba-btn-secondary w-full py-2.5 cursor-pointer">
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
