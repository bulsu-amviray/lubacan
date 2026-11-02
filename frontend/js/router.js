// Route table, navigation handlers, active nav state, and view dispatching.

import { store, SCREEN_CATALOG } from './state/store.js';
import { updateSidebarNav } from './components/sidebar.js';
import { updateTopbarAndFooter } from './components/topbar.js';
import { initRealMalolosMap, initReportDetailMap, initOverviewMap, initDuplicateComparisonMap } from './components/realMalolosMap.js';
import { supabaseSync } from './services/supabaseSync.js';

// Page view renderers
import { renderOverviewView } from './pages/overview.js';
import { renderReportsListView } from './pages/reports.js';
import { renderReportDetailsView } from './pages/reportDetail.js';
import { renderVerificationReviewView } from './pages/verificationReview.js';
import { renderDuplicateComparisonView } from './pages/duplicateComparison.js';
import { renderAssignmentConfirmedView } from './pages/assignmentConfirmed.js';
import { renderRepairCompletionView } from './pages/repairCompletion.js';
import { renderReportAuditLogView } from './pages/reportAuditLog.js';
import { renderPotholeMapView } from './pages/potholeMap.js';
import { renderTeamsListView } from './pages/teams.js';
import { renderTeamDetailsView } from './pages/teamDetail.js';
import { renderAddPersonnelView } from './pages/addPersonnel.js';
import { renderCreateTeamView } from './pages/createTeam.js';
import { renderEditPersonnelView } from './pages/editPersonnel.js';
import { renderUsersListView } from './pages/users.js';
import { renderUserDetailsView } from './pages/userDetail.js';
import { renderAnalyticsView } from './pages/analytics.js';
import { renderAdminProfileView } from './pages/adminProfile.js';
import { renderWorkspaceSettingsView } from './pages/workspaceSettings.js';

// Modal background view renderers
import {
  renderApproveReportBgView,
  renderRejectReportBgView,
  renderDuplicateOutcomeBgView,
  renderAssignTeamBgView,
  renderAnalyticsModalBgView,
  renderAnalyticsErrorBgView,
  renderExportSuccessBgView
} from './pages/modalBackgrounds.js';

// Modal dialog renderers
import { renderApproveReportModal } from './modals/approveReport.js';
import { renderReviewOutcomeModal } from './modals/reviewOutcome.js';
import { renderAssignTeamModal } from './modals/assignTeam.js';
import { renderDateRangeModal } from './modals/dateRange.js';
import { renderExportReportsModal } from './modals/exportReports.js';
import { renderExportErrorModal } from './modals/exportError.js';
import { renderExportSuccessModal } from './modals/exportSuccess.js';
import { renderInviteStaffModal } from './modals/inviteStaff.js';
import { renderSupabaseSettingsModal } from './modals/supabaseSettings.js';

// Route view mapping table
const VIEW_RENDERERS = {
  overview: renderOverviewView,
  reports_list: renderReportsListView,
  report_details: renderReportDetailsView,
  verification_review: renderVerificationReviewView,
  approve_report_bg: renderApproveReportBgView,
  reject_report_bg: renderRejectReportBgView,
  duplicate_outcome_bg: renderDuplicateOutcomeBgView,
  duplicate_comparison: renderDuplicateComparisonView,
  assign_team_bg: renderAssignTeamBgView,
  assignment_confirmed: renderAssignmentConfirmedView,
  repair_completion: renderRepairCompletionView,
  report_audit_log: renderReportAuditLogView,
  pothole_map: renderPotholeMapView,
  teams_list: renderTeamsListView,
  team_details: renderTeamDetailsView,
  create_team: renderCreateTeamView,
  add_personnel: renderAddPersonnelView,
  edit_personnel: renderEditPersonnelView,
  users_list: renderUsersListView,
  user_details: renderUserDetailsView,
  analytics: renderAnalyticsView,
  analytics_modal_bg: renderAnalyticsModalBgView,
  analytics_error_bg: renderAnalyticsErrorBgView,
  export_success_bg: renderExportSuccessBgView,
  admin_profile: renderAdminProfileView,
  workspace_settings: renderWorkspaceSettingsView
};

// Modal portal mapping table
export function renderModalPortal(state) {
  if (!state.activeModal) return '';

  switch (state.activeModal) {
    case 'approve_report':
      return renderApproveReportModal(state);
    case 'reject_report':
    case 'duplicate_outcome':
      return renderReviewOutcomeModal(state);
    case 'assign_team':
      return renderAssignTeamModal(state);
    case 'date_range':
      return renderDateRangeModal(state);
    case 'export_dialog':
      return renderExportReportsModal(state);
    case 'export_error':
      return renderExportErrorModal();
    case 'export_success':
      return renderExportSuccessModal(state);
    case 'invite_staff':
      return renderInviteStaffModal();
    case 'firebase_settings':
    case 'supabase_settings':
      return renderSupabaseSettingsModal(state);
    default:
      return '';
  }
}

// Track previous view to only reset scroll on actual view transitions
let lastRenderedView = null;
let lastRenderedScreenId = null;
let lastRenderedReportCode = null;

export function renderApp() {
  const viewportEl = document.getElementById('main-viewport');
  const modalPortalEl = document.getElementById('modal-portal');
  if (!viewportEl) return;

  try {
    const state = store.getState();
    const activeScreen = SCREEN_CATALOG.find((s) => s.id === state.activeScreenId) || SCREEN_CATALOG[0];

    const isNavigation = (
      state.currentView !== lastRenderedView ||
      state.activeScreenId !== lastRenderedScreenId ||
      state.selectedReportCode !== lastRenderedReportCode
    );

    // Update topbar breadcrumb and footer operational status indicator
    try {
      updateTopbarAndFooter(activeScreen);
    } catch (topbarErr) {
      console.warn('Topbar update warning:', topbarErr);
    }

    // Update active sidebar navigation button and icon color
    try {
      updateSidebarNav(activeScreen.nav, state);
    } catch (sidebarErr) {
      console.warn('Sidebar nav update warning:', sidebarErr);
    }

    // Render active admin screen view
    const renderFn = VIEW_RENDERERS[state.currentView] || renderOverviewView;
    const viewHtml = renderFn(state);
    if (viewHtml !== undefined && viewHtml !== null) {
      viewportEl.innerHTML = viewHtml;
    }

    // ONLY scroll viewport to top on actual screen/report navigation, NEVER during normal view scrolling or state updates
    if (isNavigation) {
      const contentScroll = document.getElementById('app-content-scroll');
      if (contentScroll) {
        contentScroll.scrollTop = 0;
      }
    }

    // Post-render lifecycle hooks (Leaflet real map initialization)
    if (state.currentView === 'overview') {
      try {
        initOverviewMap(state);
      } catch (mapErr) {
        console.warn('Overview map init warning:', mapErr);
      }
    } else if (state.currentView === 'pothole_map') {
      try {
        initRealMalolosMap(state);
      } catch (mapErr) {
        console.warn('Pothole map init warning:', mapErr);
      }
    } else if (state.currentView === 'duplicate_comparison') {
      try {
        initDuplicateComparisonMap(state);
      } catch (mapErr) {
        console.warn('Duplicate comparison map init warning:', mapErr);
      }
    } else if (
      state.currentView === 'report_details' ||
      state.currentView === 'verification_review' ||
      state.currentView === 'repair_completion' ||
      state.currentView === 'assignment_confirmed' ||
      state.currentView === 'approve_report_bg' ||
      state.currentView === 'reject_report_bg' ||
      state.currentView === 'assign_team_bg'
    ) {
      try {
        initReportDetailMap(state);
      } catch (mapErr) {
        console.warn('Detail map init warning:', mapErr);
      }
      // Only fetch report photo when navigating to a new selectedReportCode
      if (state.selectedReportCode && state.selectedReportCode !== lastRenderedReportCode) {
        supabaseSync.fetchReportPhoto(state.selectedReportCode).catch(() => {});
      }
    }

    // Render modal dialog if active
    if (modalPortalEl) {
      try {
        modalPortalEl.innerHTML = renderModalPortal(state);
      } catch (modalErr) {
        console.warn('Modal render warning:', modalErr);
      }
    }

    // Record last rendered view and report code
    lastRenderedView = state.currentView;
    lastRenderedScreenId = state.activeScreenId;
    lastRenderedReportCode = state.selectedReportCode;
  } catch (fatalRenderErr) {
    console.error('Fatal renderApp error:', fatalRenderErr);
    viewportEl.innerHTML = `
      <div class="p-6 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-3 my-6">
        <h2 class="text-base font-bold flex items-center gap-2">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Screen Render Notice
        </h2>
        <p class="text-xs text-red-700">An unexpected state occurred while rendering this view. Your live database data is safe.</p>
        <pre class="text-[11px] font-mono bg-white p-3 rounded border border-red-100 overflow-x-auto text-red-800">${escapeHtmlText(fatalRenderErr?.stack || fatalRenderErr?.message || String(fatalRenderErr))}</pre>
        <button type="button" onclick="window.location.reload()" class="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition cursor-pointer">
          Reload Application
        </button>
      </div>
    `;
  }
}

function escapeHtmlText(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function syncScreenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawQuery = params.get('screen');
  if (rawQuery === 'create_team') {
    store.navigateToScreen('create_team');
    return;
  }
  const queryScreen = Number(rawQuery);
  if (queryScreen >= 1 && queryScreen <= 26) {
    store.navigateToScreen(queryScreen);
    return;
  }
  const hashMatch = window.location.hash.match(/^#screen-(\d+)$/);
  if (hashMatch) {
    const hashScreen = Number(hashMatch[1]);
    if (hashScreen >= 1 && hashScreen <= 26) {
      store.navigateToScreen(hashScreen);
    }
  }
}

export function initRouter() {
  store.subscribe(renderApp);
  window.addEventListener('hashchange', syncScreenFromUrl);
  syncScreenFromUrl();
  renderApp();
}
