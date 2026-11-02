// Page component for Screen 17: Edit maintenance personnel
import { renderStatusBadge } from '../components/badge.js';
import { SVG_CHEVRON_DOWN } from '../data/constants.js';
import { renderPillButton } from '../components/controls.js';
import { renderBanner } from '../components/banner.js';

export function renderEditPersonnelView(state) {
  const f = state.editPersonnelForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Edit maintenance personnel</h1>
          <p class="luba-page-subtitle">Engr. Paolo Santos · Malolos Team Alpha</p>
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
              <input type="text" id="edit-pers-name" value="${f.fullName}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Work email *</label>
              <input type="email" id="edit-pers-email" value="${f.email}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Mobile number *</label>
              <input type="text" id="edit-pers-mobile" value="${f.mobileNumber}" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Role *</label>
                <select id="edit-pers-role" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
                  <option value="Maintenance team" ${f.role === 'Maintenance team' || f.role === 'Maintenance lead' ? 'selected' : ''}>Maintenance team</option>
                  <option value="Maintenance crew" ${f.role === 'Maintenance crew' ? 'selected' : ''}>Maintenance crew</option>
                  <option value="Citizen" ${f.role === 'Citizen' ? 'selected' : ''}>Citizen</option>
                  <option value="LGU administrator" ${f.role === 'LGU administrator' ? 'selected' : ''}>LGU administrator</option>
                </select>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Team *</label>
                <select id="edit-pers-team" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
                  ${(state.teams || []).map((t) => `<option value="${t.title}" ${f.team === t.title ? 'selected' : ''}>${t.title}</option>`).join('')}
                  <option value="None (Citizen / General)" ${f.team === 'None (Citizen / General)' || f.role === 'Citizen' ? 'selected' : ''}>None (Citizen / General)</option>
                </select>
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
            <button type="button" data-screen-jump="12" class="luba-btn-secondary w-full py-2.5">
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
