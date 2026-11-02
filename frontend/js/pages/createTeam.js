// Page component for creating a new Maintenance Team (Team Profile & Operational Information)
import { renderStatusBadge } from '../components/badge.js';
import { renderGreenCheckItem, renderPillButton } from '../components/controls.js';
import { renderBanner } from '../components/banner.js';

export function renderCreateTeamView(state) {
  const f = state.createTeamForm || {
    teamName: '',
    district: 'Highway / Commercial Corridor',
    leadName: 'Engr. Paolo Santos',
    serviceArea: '',
    specialty: 'Asphalt patching & concrete re-blocking',
    serviceHours: '7:00 AM–4:00 PM PHT'
  };

  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Create maintenance team</h1>
          <p class="luba-page-subtitle">City of Malolos, Bulacan · Register a new field maintenance unit · Required fields marked *</p>
        </div>
        <button type="button" data-screen-jump="14" class="luba-btn-secondary px-4 py-2.5">
          Back to teams
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-4">
          <div class="luba-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-luba-textPrimary">Team operational details</h2>
              ${renderStatusBadge('Active')}
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Team name *</label>
              <input
                type="text"
                id="team-create-name"
                value="${f.teamName || ''}"
                placeholder="e.g. Malolos Team Charlie"
                class="w-full text-xs font-semibold text-luba-textPrimary mt-1 bg-transparent focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">District / Zone cluster *</label>
                <select id="team-create-district" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
                  <option value="Highway / Commercial Corridor" ${f.district === 'Highway / Commercial Corridor' ? 'selected' : ''}>Highway / Commercial Corridor</option>
                  <option value="Poblacion / Rural" ${f.district === 'Poblacion / Rural' ? 'selected' : ''}>Poblacion / Rural</option>
                  <option value="Outer / Rural" ${f.district === 'Outer / Rural' ? 'selected' : ''}>Outer / Rural</option>
                </select>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Assigned team lead *</label>
                <select id="team-create-lead" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
                  <option value="Engr. Paolo Santos" ${f.leadName === 'Engr. Paolo Santos' ? 'selected' : ''}>Engr. Paolo Santos</option>
                  <option value="Engr. Jessa Aquino" ${f.leadName === 'Engr. Jessa Aquino' ? 'selected' : ''}>Engr. Jessa Aquino</option>
                  <option value="Engr. Adrian Flores" ${f.leadName === 'Engr. Adrian Flores' ? 'selected' : ''}>Engr. Adrian Flores</option>
                  <option value="Engr. Nica Bautista" ${f.leadName === 'Engr. Nica Bautista' ? 'selected' : ''}>Engr. Nica Bautista</option>
                </select>
              </div>
            </div>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Service area coverage *</label>
              <input
                type="text"
                id="team-create-area"
                value="${f.serviceArea || ''}"
                placeholder="e.g. MacArthur Highway, Guinhawa, Tikay, Bulihan"
                class="w-full text-xs text-luba-textPrimary mt-1 bg-transparent focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Operational specialty *</label>
                <select id="team-create-specialty" class="w-full text-xs font-medium text-luba-textPrimary mt-1 bg-transparent focus:outline-none cursor-pointer">
                  <option value="Asphalt patching & concrete re-blocking" ${f.specialty === 'Asphalt patching & concrete re-blocking' ? 'selected' : ''}>Asphalt patching & concrete re-blocking</option>
                  <option value="Drainage cover restoration & patching" ${f.specialty === 'Drainage cover restoration & patching' ? 'selected' : ''}>Drainage cover restoration & patching</option>
                  <option value="Road surface re-blocking & joint sealing" ${f.specialty === 'Road surface re-blocking & joint sealing' ? 'selected' : ''}>Road surface re-blocking & joint sealing</option>
                  <option value="Emergency road pothole response" ${f.specialty === 'Emergency road pothole response' ? 'selected' : ''}>Emergency road pothole response</option>
                </select>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Service hours *</label>
                <input
                  type="text"
                  id="team-create-hours"
                  value="${f.serviceHours || '7:00 AM–4:00 PM PHT'}"
                  placeholder="7:00 AM–4:00 PM PHT"
                  class="w-full text-xs text-luba-textPrimary mt-1 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <p class="text-[11px] text-luba-textSubtle">This registers a maintenance team operational unit. Crew members can be added after creation from the team roster.</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              id="btn-save-new-team"
              class="px-5 py-2.5 luba-btn-primary font-bold shadow-sm"
            >
              Create & activate team
            </button>
            <button type="button" data-screen-jump="14" class="luba-btn-secondary px-4 py-2.5">
              Cancel
            </button>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Deployment settings</h3>
            ${renderGreenCheckItem('Auto-enable for repair assignment dispatch')}
            ${renderGreenCheckItem('Track team KPIs and SLA performance')}
            <p class="text-xs text-luba-textSubtle leading-relaxed">Teams created here immediately appear on the citywide maintenance management grid and become selectable for pothole work orders.</p>
            <div class="flex gap-2 pt-1">
              ${renderPillButton({ label: 'Initial size: 4 crew', active: true })}
              ${renderPillButton({ label: 'Active', active: false })}
            </div>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Task allocation & dispatch ready',
            body: 'Once activated, LGU administrators can assign incoming pothole reports to this team during the verification review stage.'
          })}
        </div>
      </div>
    </div>
  `;
}
