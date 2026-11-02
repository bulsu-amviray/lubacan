// Page component for Screen 16: Add maintenance personnel (validation error state)
import { PH_MOBILE_REGEX } from '../utils/validators.js';
import { SVG_CHEVRON_DOWN } from '../data/constants.js';
import { renderGreenCheckItem, renderPillButton } from '../components/controls.js';
import { renderBanner } from '../components/banner.js';

export function renderAddPersonnelView(state) {
  const f = state.addPersonnelForm;
  const isPhoneValid = PH_MOBILE_REGEX.test((f.mobileNumber || '').trim());

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Add maintenance personnel</h1>
          <p class="luba-page-subtitle">New invitation · Fictional demonstration · Required fields marked *</p>
        </div>
        <button type="button" data-screen-jump="15" class="luba-btn-secondary px-4 py-2.5 cursor-pointer">
          Back to teams
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-4">
          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Personnel details</h2>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Full name *</label>
              <input type="text" id="add-pers-name" value="${f.fullName || ''}" placeholder="Enter full name" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Work email *</label>
              <input type="email" id="add-pers-email" value="${f.email || ''}" placeholder="name@malolos.gov.ph" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
            </div>

            <div id="add-pers-mobile-box" class="${isPhoneValid ? 'luba-field-box' : 'luba-field-box-error'}">
              <label class="block text-[11px] text-luba-textMuted">Philippine mobile number *</label>
              <input type="text" id="add-pers-mobile" value="${f.mobileNumber}" placeholder="+63 917 000 0215" class="w-full text-xs text-luba-textPrimary mt-1 focus:outline-none"/>
              <p id="add-pers-mobile-msg" class="text-xs ${!isPhoneValid ? 'text-luba-danger' : 'text-luba-success'} mt-1.5">
                ${!isPhoneValid ? 'Enter a complete Philippine mobile number, for example +63 917 000 0215.' : 'Valid Philippine mobile number format confirmed.'}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Role *</label>
                <select id="add-pers-role" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
                  <option value="Maintenance crew" ${f.role === 'Maintenance crew' ? 'selected' : ''}>Maintenance crew</option>
                  <option value="Maintenance lead" ${f.role === 'Maintenance lead' ? 'selected' : ''}>Maintenance lead</option>
                  <option value="Citizen" ${f.role === 'Citizen' ? 'selected' : ''}>Citizen</option>
                  <option value="LGU administrator" ${f.role === 'LGU administrator' ? 'selected' : ''}>LGU administrator</option>
                </select>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Team *</label>
                <select id="add-pers-team" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
                  ${(state.teams || []).map((t) => `<option value="${t.title}" ${f.team === t.title ? 'selected' : ''}>${t.title}</option>`).join('')}
                  <option value="None (Citizen / General)" ${f.team === 'None (Citizen / General)' || f.role === 'Citizen' ? 'selected' : ''}>None (Citizen / General)</option>
                </select>
              </div>
            </div>

            <p class="text-[11px] text-luba-textSubtle">Role grants maintenance access only. Administrator privileges are not included.</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              id="btn-save-invite-personnel"
              class="px-5 py-2.5 luba-btn-primary font-bold shadow-sm cursor-pointer"
            >
              Save & send invitation
            </button>
            <button type="button" data-screen-jump="15" class="luba-btn-secondary px-4 py-2.5 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Invitation settings</h3>
            ${renderGreenCheckItem('Send invitation to work email', 'data-toggle-pers-invite="true"', f.sendEmail !== false)}
            <p class="text-xs text-luba-textSubtle leading-relaxed">Invitations expire after 7 days. The recipient sets their own password through the secure invitation link.</p>
            <div class="flex gap-2">
              ${renderPillButton({
                label: 'Crew',
                active: (f.crewOrLeadPill || 'Crew') === 'Crew',
                dataAttr: 'data-select-pers-pill="Crew"'
              })}
              ${renderPillButton({
                label: 'Lead',
                active: f.crewOrLeadPill === 'Lead',
                dataAttr: 'data-select-pers-pill="Lead"'
              })}
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
