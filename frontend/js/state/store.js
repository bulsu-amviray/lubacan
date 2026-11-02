// Global reactive store and state manager for LUBA CanFindIT (City of Malolos, Bulacan).

import {
  initialReports,
  initialAuditLogEvents,
  initialTeams,
  initialTeamAlphaCrew,
  initialUsers
} from '../data/reports.js';
import { SCREEN_CATALOG } from '../data/constants.js';

export { SCREEN_CATALOG };

let storedSessionUser = null;
try {
  const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('luba_user') : null;
  if (raw) storedSessionUser = JSON.parse(raw);
} catch (e) {}

const initialState = {
  currentView: 'overview',
  activeModal: null, // 'approve_report' | 'reject_report' | 'duplicate_outcome' | 'assign_team' | 'date_range' | 'export_dialog' | 'export_error' | 'export_success'
  activeScreenId: 1,
  showReferenceImage: false,
  refMode: 'live', // 'live' | 'split' | 'png'
  toastMessage: null,

  // Reports management filters (Screen 2)
  reportFilters: {
    pill: 'All reports 1,284',
    search: '',
    status: 'All statuses',
    severity: 'All severities',
    jurisdiction: 'All jurisdictions',
    barangay: 'All barangays',
    month: 'October 2026'
  },

  // Selected report for workflow views
  selectedReportCode: 'RW-2026-0842',
  detailMapViewType: 'real',
  overviewMapViewType: 'real',
  reportsViewMode: 'split',
  reportsMapViewType: 'real',
  reportsSelectedPin: 'RW-2026-0842',

  // Verification Review form state (Screen 4 & 5)
  verificationForm: {
    checkPhoto: true,
    checkPin: true,
    checkJurisdiction: true,
    checkDuplicates: true,
    severity: 'High',
    notes: 'Location confirmed on MacArthur Highway (Manila North Road), Brgy. Guinhawa near BSU crossing. Approx. 0.8 m wide and 12 cm deep. High risk to motorcycles and public transport; DPWH corridor coordinate logged.',
    modalNotes: 'Location confirmed on MacArthur Highway, Brgy. Guinhawa. High risk to motorcycles and public transport.\nRW-2026-0819 is on the opposite carriageway in Brgy. Tikay and is not a duplicate.'
  },

  // Set review outcome modal state (Screens 6 & 7)
  outcomeModal: {
    tab: 'reject', // 'reject' | 'duplicate'
    rejectionCategory: 'Outside City of Malolos jurisdiction',
    rejectionReason: 'The submitted location is in Bocaue, outside the City of Malolos territorial boundary. Please report through the relevant municipality or provincial DPWH district office with clear evidence taken safely.',
    originalReport: 'RW-2026-0826 · MacArthur Highway',
    duplicateReason: 'The same pothole is already tracked in RW-2026-0826. Your report has been linked so you can follow its repair updates.'
  },

  // Duplicate Comparison state (Screen 8)
  duplicateCompareForm: {
    reason: 'Different carriageways and site photos. Retain 0842 as distinct; do not link it to 0819.'
  },

  // Team Assignment state (Screens 9 & 10)
  assignmentForm: {
    teamName: 'Malolos Team Alpha',
    leadName: 'Engr. Paolo Santos',
    priority: 'High',
    targetCompletion: '21 Oct 2026 · 5:00 PM',
    instructions: 'Prioritize MacArthur Highway northbound lane. Set up safety cones and coordinate with local traffic enforcers during asphalt compaction.'
  },

  // Repair Completion Inspection state (Screen 11)
  completionForm: {
    checkSameSite: true,
    checkFilledCompacted: true,
    checkFlushSafe: true,
    checkNotesConsistent: true,
    reviewNotes: 'Evidence matches the reported site on MacArthur Highway. Patch is level, compacted and clear of debris. Repair accepted for resolution.'
  },

  // Report Activity Log filters (Screen 12)
  auditLogFilters: {
    status: 'All statuses',
    fromDate: '19 Oct 2026',
    toDate: '21 Oct 2026'
  },

  // Pothole Map filters (Screen 13) - Default to all reports to match Reports Management
  mapFilters: {
    search: '',
    status: 'All statuses',
    severity: 'All severities',
    jurisdiction: 'All jurisdictions',
    barangay: 'All barangays',
    modePill: 'All statuses',
    selectedPinCode: 'RW-2026-0842'
  },

  // Teams management filters (Screen 14)
  teamFilters: {
    search: '',
    district: 'All zones',
    status: 'Active teams'
  },

  // Create Maintenance Team form state
  createTeamForm: {
    teamName: '',
    district: 'Highway / Commercial Corridor',
    leadName: 'Engr. Paolo Santos',
    serviceArea: '',
    specialty: 'Asphalt patching & concrete re-blocking',
    serviceHours: '7:00 AM–4:00 PM PHT'
  },

  // Add Maintenance Personnel form state (Screen 16)
  addPersonnelForm: {
    fullName: '',
    email: '',
    mobileNumber: '+63 917 000 0215',
    role: 'Maintenance crew',
    team: 'Malolos Team Alpha',
    sendEmail: true,
    crewOrLeadPill: 'Crew'
  },

  // Edit Maintenance Personnel form state (Screen 17)
  editPersonnelForm: {
    fullName: 'Engr. Paolo Santos',
    email: 'paolo.santos@malolos.gov.ph',
    mobileNumber: '+63 917 000 0210',
    role: 'Maintenance lead',
    team: 'Malolos Team Alpha',
    availability: 'On duty'
  },

  // Users management filters (Screen 18)
  userFilters: {
    tab: 'All users',
    search: '',
    role: 'All roles',
    status: 'All statuses'
  },

  // User Details Account Status Controls (Screen 19)
  selectedUserId: 1,
  userStatusForm: {
    currentStatus: 'Active',
    selectedStatus: 'Active',
    reason: 'Enter a specific account access reason',
    reasonTouched: false,
    acknowledgePrivilegeSeparation: false
  },

  // Analytics & Date-Range Modal state (Screens 20 & 21)
  analyticsState: {
    subTab: 'Overview',
    preset: 'Custom',
    fromDate: '21 Oct 2026',
    toDate: '19 Oct 2026'
  },

  // Export CSV / PDF Modal state (Screens 22, 23, 24)
  exportForm: {
    format: 'CSV',
    scope: 'All reports',
    includeIdRoadCoords: true,
    includeSeverityStatusTimestamps: true,
    includeAssignedTeamRepair: true,
    includePdfSummaryCharts: true,
    includeCitizenPii: false
  },

  // Administrator Profile state (Screen 25)
  adminProfileForm: {
    fullName: storedSessionUser?.fullName || 'System Administrator',
    email: storedSessionUser?.email || 'admin@malolos.gov.ph',
    role: storedSessionUser?.role || 'LGU administrator · City of Malolos',
    department: storedSessionUser?.department || 'City Engineering Office',
    reviewQueueAlerts: true,
    completionReviewAlerts: true,
    dailyEmailSummary: false,
    signinSecurityNotices: true,
    savedBannerVisible: true,
    feedbackTitle: 'Preferences saved · sample feedback',
    feedbackBody: `${storedSessionUser?.fullName || 'System Administrator'} · Personal notifications updated 28 Oct 2026, 8:45 PM PHT. Workspace rules are unchanged.`
  },

  // Workspace Settings state (Screen 26)
  workspaceSettingsForm: {
    activeTab: 'Reporting rules',
    duplicateRadius: '50 meters',
    highTarget: '48 hours',
    mediumTarget: '5 days',
    lowTarget: '14 days',
    requirePhoto: true,
    adminVerificationBeforeResolution: true,
    enableNearbyDuplicateChecks: true,
    statusChangeNotifications: true,
    requestPostRepairFeedback: true,
    emailUpdateDigest: false,
    lguCity: 'City of Malolos, Bulacan',
    department: 'City Engineering Office, City of Malolos',
    hotline: '0000-000-0000',
    timezone: 'Asia/Manila · UTC+8',
    workspaceId: 'MALOLOS-LGU-ENG'
  },

  reports: initialReports,
  auditLogEvents: initialAuditLogEvents,
  teams: initialTeams,
  teamAlphaCrew: initialTeamAlphaCrew,
  users: initialUsers
};

export const EXCLUDED_REPORT_CODES = new Set([
  'RW-2026-0839',
  'RW-2026-0838',
  'RW-2026-0837',
  'RW-2026-0836',
  'RW-2026-0835',
  'RW-2026-0798',
  'RW-2026-0789',
  'RW-2026-0771',
  'RW-2026-0745',
  'RW-2026-0723'
]);

const STORAGE_KEY = 'luba_admin_inputs_v1';

function filterExcludedReports(reportsList) {
  if (!Array.isArray(reportsList)) return [];
  return reportsList.filter((r) => r && !EXCLUDED_REPORT_CODES.has(r.code));
}

function mergeBaselineReports(reportsList) {
  const filtered = filterExcludedReports(reportsList);
  const existingCodes = new Set(filtered.map((r) => r.code));
  initialReports.forEach((ir) => {
    if (ir && ir.code && !existingCodes.has(ir.code) && !EXCLUDED_REPORT_CODES.has(ir.code)) {
      existingCodes.add(ir.code);
      filtered.push({ ...ir });
    }
  });

  // Sort newest reports first by numeric ID desc or creation time desc
  return filtered.sort((a, b) => {
    const idA = Number(a.id) || Number(String(a.code || '').replace(/\D/g, '')) || 0;
    const idB = Number(b.id) || Number(String(b.code || '').replace(/\D/g, '')) || 0;
    if (idB !== idA) return idB - idA;
    const timeA = new Date(a.createdAt || a.reportedDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.reportedDate || 0).getTime();
    return timeB - timeA;
  });
}

function mergeBaselineUsers(userList) {
  const list = Array.isArray(userList) ? [...userList] : [];
  const existingEmails = new Set(list.map((u) => (u.email || '').toLowerCase().trim()));
  initialUsers.forEach((iu) => {
    if (iu && iu.email && !existingEmails.has(iu.email.toLowerCase().trim())) {
      existingEmails.add(iu.email.toLowerCase().trim());
      list.push({ ...iu });
    }
  });
  return list;
}

function mergeBaselineTeams(teamsList) {
  const list = Array.isArray(teamsList) ? [...teamsList] : [];
  const existingCodes = new Set(list.map((t) => t.code));
  initialTeams.forEach((it) => {
    if (it && it.code && !existingCodes.has(it.code)) {
      existingCodes.add(it.code);
      list.push({ ...it });
    }
  });
  return list;
}

function loadPersistedState() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return structuredClone(initialState);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const loaded = {
          ...structuredClone(initialState),
          ...parsed,
          activeModal: null
        };
        // Always strip excluded sample reports and merge baseline reports
        loaded.reports = mergeBaselineReports(loaded.reports || initialState.reports);
        // Always ensure baseline and registered users are present
        loaded.users = mergeBaselineUsers(loaded.users || initialState.users);
        // Always ensure baseline teams and synced teams are present
        loaded.teams = mergeBaselineTeams(loaded.teams || initialState.teams);

        // Ensure map filters match all reports on load (clearing legacy restrictive defaults)
        if (loaded.mapFilters && (loaded.mapFilters.search === 'MacArthur Highway' || loaded.mapFilters.barangay === 'Guinhawa')) {
          loaded.mapFilters.search = '';
          loaded.mapFilters.barangay = 'All barangays';
        }

        // Reset reportFilters on initial boot so fresh reports from Supabase are never hidden by legacy filter state
        if (loaded.reportFilters) {
          loaded.reportFilters.search = '';
          loaded.reportFilters.status = 'All statuses';
          loaded.reportFilters.severity = 'All severities';
          loaded.reportFilters.jurisdiction = 'All jurisdictions';
          loaded.reportFilters.barangay = 'All barangays';
        }
        return loaded;
      }
    }
  } catch (err) {
    console.warn('[Store] Local persistence load notice:', err);
  }
  return structuredClone(initialState);
}

function persistState(stateToSave) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const data = {
      reports: filterExcludedReports(stateToSave.reports),
      teams: stateToSave.teams,
      teamAlphaCrew: stateToSave.teamAlphaCrew,
      users: stateToSave.users,
      reportFilters: stateToSave.reportFilters,
      mapFilters: stateToSave.mapFilters,
      teamFilters: stateToSave.teamFilters,
      userFilters: stateToSave.userFilters,
      selectedReportCode: stateToSave.selectedReportCode,
      selectedUserId: stateToSave.selectedUserId,
      verificationForm: stateToSave.verificationForm,
      outcomeModal: stateToSave.outcomeModal,
      duplicateCompareForm: stateToSave.duplicateCompareForm,
      assignmentForm: stateToSave.assignmentForm,
      completionForm: stateToSave.completionForm,
      addPersonnelForm: stateToSave.addPersonnelForm,
      editPersonnelForm: stateToSave.editPersonnelForm,
      createTeamForm: stateToSave.createTeamForm,
      userStatusForm: stateToSave.userStatusForm,
      analyticsState: stateToSave.analyticsState,
      detailMapViewType: stateToSave.detailMapViewType,
      overviewMapViewType: stateToSave.overviewMapViewType,
      reportsViewMode: stateToSave.reportsViewMode,
      reportsMapViewType: stateToSave.reportsMapViewType,
      exportForm: stateToSave.exportForm,
      adminProfileForm: stateToSave.adminProfileForm,
      workspaceSettingsForm: stateToSave.workspaceSettingsForm
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[Store] Local persistence write notice:', err);
  }
}

const listeners = new Set();
let state = loadPersistedState();

export const store = {
  getState() {
    return state;
  },
  setState(updater) {
    const prevState = { ...state };
    const nextPartial = typeof updater === 'function' ? updater(state) : updater;
    if (nextPartial && nextPartial.reports) {
      nextPartial.reports = filterExcludedReports(nextPartial.reports);
    }
    state = { ...state, ...nextPartial };
    persistState(state);

    listeners.forEach((fn) => fn(state));
  },
  setSilentState(updater) {
    const prevState = { ...state };
    const nextPartial = typeof updater === 'function' ? updater(state) : updater;
    if (nextPartial && nextPartial.reports) {
      nextPartial.reports = filterExcludedReports(nextPartial.reports);
    }
    state = { ...state, ...nextPartial };
    persistState(state);
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  navigateToScreen(screenId) {
    if (screenId === 'create_team') {
      this.setState({
        activeScreenId: 14,
        currentView: 'create_team',
        activeModal: null
      });
      return;
    }

    const numId = Number(screenId);
    const entry = SCREEN_CATALOG.find((s) => s.id === numId) || SCREEN_CATALOG[0];

    let currentView = entry.key;
    let activeModal = null;

    if (numId === 5) {
      currentView = 'approve_report_bg';
      activeModal = 'approve_report';
    } else if (numId === 6) {
      currentView = 'reject_report_bg';
      activeModal = 'reject_report';
      state.outcomeModal.tab = 'reject';
    } else if (numId === 7) {
      currentView = 'duplicate_outcome_bg';
      activeModal = 'duplicate_outcome';
      state.outcomeModal.tab = 'duplicate';
    } else if (numId === 9) {
      currentView = 'assign_team_bg';
      activeModal = 'assign_team';
    } else if (numId === 21) {
      currentView = 'analytics_modal_bg';
      activeModal = 'date_range';
    } else if (numId === 22) {
      currentView = 'analytics_modal_bg';
      activeModal = 'export_dialog';
    } else if (numId === 23) {
      currentView = 'analytics_error_bg';
      activeModal = 'export_error';
    } else if (numId === 24) {
      currentView = 'export_success_bg';
      activeModal = 'export_success';
    }

    this.setState({
      activeScreenId: entry.id,
      currentView,
      activeModal
    });
  }
};
