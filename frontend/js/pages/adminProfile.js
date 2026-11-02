// Page component for Screen 25: Administrator profile
import { renderStatusBadge } from '../components/badge.js';
import { renderToggleSwitch } from '../components/controls.js';

export function renderAdminProfileView(state) {
  const pf = state.adminProfileForm;
  return `
    <div class="space-y-6 max-w-[1204px] mx-auto pb-10">
      <!-- Page Header: Title, Subtitle and Back to Report button -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-luba-textPrimary tracking-tight">My administrator profile</h1>
          <p class="text-sm text-luba-textSubtle mt-1">Personal account preferences · Not workspace system settings</p>
        </div>
        <button type="button" data-screen-jump="3" class="px-5 py-2.5 rounded-lg border border-luba-border bg-white text-sm font-semibold text-luba-textPrimary hover:bg-luba-canvas transition shadow-xs cursor-pointer">
          Back to report
        </button>
      </div>

      <!-- Main Two-Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column (7 cols): User Info Card & Saved Feedback Banner -->
        <div class="lg:col-span-7 space-y-5">
          <div class="bg-white rounded-xl border border-luba-border p-6 shadow-xs space-y-5">
            <div>
              <h2 id="profile-heading-name" class="text-xl font-bold text-luba-textPrimary">${pf.fullName || 'Ana Dela Cruz'}</h2>
              <div class="mt-2.5">
                ${renderStatusBadge('Active')}
              </div>
            </div>

            <div class="space-y-3.5">
              <div class="rounded-lg border border-[#DEE6EE] px-4 py-2.5 bg-white focus-within:border-luba-info focus-within:ring-1 focus-within:ring-luba-info transition">
                <label for="profile-fullname" class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">Full name</label>
                <input id="profile-fullname" type="text" value="${pf.fullName || 'Ana Dela Cruz'}" class="w-full text-sm font-medium text-luba-textPrimary mt-0.5 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-luba-textSubtle" placeholder="Enter full name" />
              </div>

              <div class="rounded-lg border border-[#DEE6EE] px-4 py-2.5 bg-white focus-within:border-luba-info focus-within:ring-1 focus-within:ring-luba-info transition">
                <label for="profile-email" class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">Work email</label>
                <input id="profile-email" type="email" value="${pf.email || 'ana.delacruz@example.com'}" class="w-full text-sm font-medium text-luba-textPrimary mt-0.5 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-luba-textSubtle" placeholder="Enter work email" />
              </div>

              <div class="rounded-lg border border-[#DEE6EE] px-4 py-2.5 bg-white focus-within:border-luba-info focus-within:ring-1 focus-within:ring-luba-info transition">
                <label for="profile-role" class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">LGU role (managed access)</label>
                <input id="profile-role" type="text" value="${pf.role || 'LGU administrator · Quezon City'}" class="w-full text-sm font-medium text-luba-textPrimary mt-0.5 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-luba-textSubtle" placeholder="Enter LGU role" />
              </div>

              <div class="rounded-lg border border-[#DEE6EE] px-4 py-2.5 bg-white focus-within:border-luba-info focus-within:ring-1 focus-within:ring-luba-info transition">
                <label for="profile-department" class="block text-[11px] font-medium text-luba-textMuted uppercase tracking-wider">Department</label>
                <input id="profile-department" type="text" value="${pf.department || 'City Engineering'}" class="w-full text-sm font-medium text-luba-textPrimary mt-0.5 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-luba-textSubtle" placeholder="Enter department" />
              </div>
            </div>

            <p class="text-xs text-luba-textSubtle leading-relaxed pt-1">
              Changes to your name, work email, role, and department will be saved upon clicking Save preferences.
            </p>
          </div>

          <!-- Preferences Saved Feedback Banner -->
          ${pf.savedBannerVisible !== false ? `
            <div class="bg-[#EAF5EE] border border-[#C6E6D5] rounded-xl p-4 transition-all">
              <p class="text-sm font-bold text-[#197653]">${pf.feedbackTitle || 'Preferences saved · sample feedback'}</p>
              <p class="text-xs text-[#197653] mt-1 leading-relaxed">${pf.feedbackBody || 'Ana Dela Cruz · Personal notifications updated 21 Oct 2026, 12:05 PM PHT. Workspace rules are unchanged.'}</p>
            </div>
          ` : ''}
        </div>

        <!-- Right Column (5 cols): Notifications, Security & Action Buttons -->
        <div class="lg:col-span-5 space-y-5">
          
          <!-- My Notifications Card -->
          <div class="bg-white rounded-xl border border-luba-border p-6 shadow-xs space-y-6">
            <h3 class="text-xl font-bold text-luba-textPrimary">My notifications</h3>

            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-luba-textPrimary">Review queue alerts</p>
                <p class="text-xs text-luba-textSubtle mt-0.5">New high-severity reports awaiting review.</p>
              </div>
              ${renderToggleSwitch(pf.reviewQueueAlerts, 'data-toggle-profile="reviewQueueAlerts"', false, true)}
            </div>

            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-luba-textPrimary">Completion review alerts</p>
                <p class="text-xs text-luba-textSubtle mt-0.5">Team submissions needing LGU verification.</p>
              </div>
              ${renderToggleSwitch(pf.completionReviewAlerts, 'data-toggle-profile="completionReviewAlerts"', false, true)}
            </div>

            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-luba-textPrimary">Daily email summary</p>
                <p class="text-xs text-luba-textSubtle mt-0.5">Personal operations digest.</p>
              </div>
              ${renderToggleSwitch(pf.dailyEmailSummary, 'data-toggle-profile="dailyEmailSummary"', false, true)}
            </div>
          </div>

          <!-- Security Card -->
          <div class="bg-white rounded-xl border border-luba-border p-6 shadow-xs space-y-4">
            <h3 class="text-xl font-bold text-luba-textPrimary">Security</h3>

            <div class="flex items-center justify-between text-sm font-medium text-luba-textPrimary py-1 cursor-pointer hover:text-luba-cta transition select-none" data-change-password="true">
              <span>Change password</span>
              <svg class="w-4 h-4 text-luba-textMuted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </div>

            <div class="flex items-center justify-between gap-4 pt-1">
              <div>
                <p class="text-sm font-semibold text-luba-textPrimary">Sign-in security notices</p>
                <p class="text-xs text-luba-textSubtle mt-0.5">Essential notices to your work email.</p>
              </div>
              ${renderToggleSwitch(true, '', true, true)}
            </div>

            <p class="text-xs text-luba-textSubtle leading-relaxed">
              Security notices cannot be disabled. Never share passwords or verification links.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3 pt-1">
            <button type="button" data-save-profile="true" class="w-full bg-[#D95820] hover:bg-[#c24c18] active:scale-[0.99] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center">
              Save preferences
            </button>

            <button type="button" data-sign-out="true" class="w-full bg-white hover:bg-luba-canvas active:scale-[0.99] border border-luba-border text-luba-textPrimary font-semibold text-sm py-2.5 px-4 rounded-xl transition cursor-pointer inline-flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-luba-textPrimary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Sign out</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}
