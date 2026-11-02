// Page component for Screen 26: Workspace settings
import { renderPillButton, renderToggleSwitch } from '../components/controls.js';
import { renderBanner } from '../components/banner.js';
import { SVG_CHEVRON_DOWN } from '../data/constants.js';

export function renderWorkspaceSettingsView(state) {
  const ws = state.workspaceSettingsForm;
  return `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="luba-page-title">Workspace settings</h1>
          <p class="luba-page-subtitle">City Engineering Office, City of Malolos · Changes apply to this LGU workspace.</p>
        </div>
        <button type="button" data-save-workspace="true" class="luba-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5">
          ✓ Save changes
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        ${['General', 'Reporting rules', 'Notifications', 'Security & access', 'Audit log']
          .map((t) =>
            renderPillButton({
              label: t,
              active: ws.activeTab === t,
              dataAttr: `data-ws-tab="${t}"`
            })
          )
          .join('')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Report review & repair policy</h2>

            <div class="luba-field-box">
              <label class="block text-[11px] text-luba-textMuted">Duplicate detection radius</label>
              <p class="text-xs font-medium text-luba-textPrimary mt-1 flex items-center gap-1">50 meters ${SVG_CHEVRON_DOWN}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">High priority target</label>
                <p class="text-xs font-medium text-luba-textPrimary mt-1">48 hours</p>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Medium priority target</label>
                <p class="text-xs font-medium text-luba-textPrimary mt-1">5 days</p>
              </div>
              <div class="luba-field-box">
                <label class="block text-[11px] text-luba-textMuted">Low priority target</label>
                <p class="text-xs font-medium text-luba-textPrimary mt-1">14 days</p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Require at least one photo</p>
                <p class="text-xs text-luba-textSubtle">Citizen reports must include visible road damage.</p>
              </div>
              ${renderToggleSwitch(ws.requirePhoto, 'data-toggle-ws="requirePhoto"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Admin verification before resolution</p>
                <p class="text-xs text-luba-textSubtle">A team's completion submission stays In Progress until approved.</p>
              </div>
              ${renderToggleSwitch(ws.adminVerificationBeforeResolution, 'data-toggle-ws="adminVerificationBeforeResolution"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Enable nearby duplicate checks</p>
                <p class="text-xs text-luba-textSubtle">Warn citizens before submitting a similar report.</p>
              </div>
              ${renderToggleSwitch(ws.enableNearbyDuplicateChecks, 'data-toggle-ws="enableNearbyDuplicateChecks"')}
            </div>
          </div>

          <div class="luba-card p-6 space-y-4">
            <h2 class="text-lg font-bold text-luba-textPrimary">Citizen notifications</h2>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Status change notifications</p>
                <p class="text-xs text-luba-textSubtle">Notify citizens when their report moves through the workflow.</p>
              </div>
              ${renderToggleSwitch(ws.statusChangeNotifications, 'data-toggle-ws="statusChangeNotifications"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Request post-repair feedback</p>
                <p class="text-xs text-luba-textSubtle">Send a feedback prompt after LGU-approved resolution.</p>
              </div>
              ${renderToggleSwitch(ws.requestPostRepairFeedback, 'data-toggle-ws="requestPostRepairFeedback"')}
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-luba-textPrimary">Email update digest</p>
                <p class="text-xs text-luba-textSubtle">Send a daily summary of ongoing reports.</p>
              </div>
              ${renderToggleSwitch(ws.emailUpdateDigest, 'data-toggle-ws="emailUpdateDigest"')}
            </div>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="luba-card p-5 space-y-3.5">
            <h3 class="text-base font-bold text-luba-textPrimary">Service jurisdiction</h3>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">LGU / city</p>
              <p class="text-xs text-luba-textPrimary mt-1">City of Malolos, Bulacan</p>
            </div>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Department</p>
              <p class="text-xs text-luba-textPrimary mt-1">City Engineering Office, City of Malolos</p>
            </div>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Public service hotline</p>
              <p class="text-xs text-luba-textPrimary mt-1">0000-000-0000</p>
            </div>
            <div class="luba-field-box">
              <p class="text-[11px] text-luba-textMuted">Time zone</p>
              <p class="text-xs text-luba-textPrimary mt-1">Asia/Manila · UTC+8</p>
            </div>
          </div>

          <div class="luba-card p-5 space-y-3.5 border border-emerald-200/80 bg-emerald-50/20">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-luba-textPrimary flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Supabase Cloud Sync</span>
              </h3>
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">PostgreSQL</span>
            </div>
            <p class="text-xs text-luba-textSubtle leading-relaxed">
              Connect your own Supabase project for unlimited realtime sync, zero quota cuts, and instant multi-device status updates.
            </p>
            <button
              type="button"
              data-open-modal="supabase_settings"
              class="w-full luba-btn-primary py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              ⚡ Configure Supabase Database
            </button>
          </div>

          ${renderBanner({
            variant: 'info',
            title: 'Accountability by design',
            body: "All verification, assignment and resolution decisions are logged with the administrator's name and timestamp."
          })}

          ${renderBanner({
            variant: 'success',
            title: 'Settings are up to date',
            body: 'Last saved by Ana Dela Cruz · 21 Oct 2026, 8:00 AM'
          })}
        </div>
      </div>
    </div>
  `;
}
