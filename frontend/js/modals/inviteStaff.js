// Modal dialog component: Invite staff member (User Management Screen 18)
import { renderModalShell } from '../components/modal.js';

export function renderInviteStaffModal() {
  return renderModalShell({
    title: 'Invite staff member',
    subtitle: 'Send an email invitation to join the City of Malolos road operations workspace.',
    bodyHtml: `
      <form id="form-invite-staff" class="space-y-4">
        <div class="luba-field-box">
          <label class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">Full name *</label>
          <input type="text" id="modal-staff-name" required placeholder="e.g. Maria Santos" class="w-full text-xs text-luba-textPrimary mt-1 bg-transparent border-0 p-0 focus:outline-none placeholder:text-luba-textSubtle" />
        </div>

        <div class="luba-field-box">
          <label class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">Work email *</label>
          <input type="email" id="modal-staff-email" required placeholder="name@malolos.gov.ph" class="w-full text-xs text-luba-textPrimary mt-1 bg-transparent border-0 p-0 focus:outline-none placeholder:text-luba-textSubtle" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="luba-field-box">
            <label class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">Role *</label>
            <select id="modal-staff-role" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
              <option value="LGU reviewer">LGU reviewer</option>
              <option value="LGU administrator">LGU administrator</option>
              <option value="Maintenance lead">Maintenance lead</option>
              <option value="Maintenance crew">Maintenance crew</option>
            </select>
          </div>

          <div class="luba-field-box">
            <label class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">Department / Area *</label>
            <input type="text" id="modal-staff-area" value="City Engineering Office" class="w-full text-xs text-luba-textPrimary mt-1 bg-transparent border-0 p-0 focus:outline-none" />
          </div>
        </div>

        <p class="text-[11px] text-luba-textSubtle leading-relaxed">
          Invitations expire after 7 days. The recipient sets their own password through the secure invitation link.
        </p>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button type="button" data-close-modal="true" class="luba-btn-secondary px-4 py-2 cursor-pointer">
            Cancel
          </button>
          <button type="button" id="btn-submit-modal-invite" class="luba-btn-primary px-5 py-2 font-bold cursor-pointer">
            Send invitation
          </button>
        </div>
      </form>
    `
  });
}
