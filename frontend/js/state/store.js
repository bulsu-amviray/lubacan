export const SCREEN_CATALOG = [
  { id: 1,  key: 'overview',                nav: 'overview',  breadcrumb: ['Administration', 'Overview'],       label: '1 · Operations overview',                   imageFile: 'Admin · Operations overview.png' },
  { id: 2,  key: 'reports_list',            nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '2 · Reports management',                    imageFile: 'Admin · Reports management.png' },
  { id: 3,  key: 'report_details',          nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '3 · Report details (RW-2026-0842)',         imageFile: 'Admin · Report details.png' },
  { id: 4,  key: 'verification_review',     nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '4 · Verification review',                   imageFile: 'Admin · Verification review.png' },
  { id: 5,  key: 'approve_report_modal',    nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '5 · Approve report confirmation (Modal)',   imageFile: 'Admin · Approve report confirmation.png' },
  { id: 6,  key: 'reject_report_modal',     nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '6 · Reject report confirmation (Modal)',    imageFile: 'Admin · Reject report confirmation.png' },
  { id: 7,  key: 'duplicate_outcome_modal', nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '7 · Rejection & duplicate dialog (Modal)',  imageFile: 'Admin · Rejection and duplicate outcome dialog.png' },
  { id: 8,  key: 'duplicate_comparison',    nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '8 · Duplicate report comparison',           imageFile: 'Admin · Duplicate report comparison.png' },
  { id: 9,  key: 'team_assignment_modal',   nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '9 · Team assignment modal (Modal)',         imageFile: 'Admin · Team assignment modal.png' },
  { id: 10, key: 'assignment_confirmed',    nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '10 · Assignment review & confirmation',     imageFile: 'Admin · Assignment review and confirmation.png' },
  { id: 11, key: 'repair_completion',       nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '11 · Repair completion review',             imageFile: 'Admin · Repair completion review.png' },
  { id: 12, key: 'report_audit_log',        nav: 'reports',   breadcrumb: ['Administration', 'Reports'],        label: '12 · Report status history & audit log',    imageFile: 'Admin · Report status history and audit log.png' },
  { id: 13, key: 'pothole_map',             nav: 'map',       breadcrumb: ['Administration', 'Pothole map'],    label: '13 · Pothole map',                          imageFile: 'Admin · Pothole map.png' },
  { id: 14, key: 'teams_list',              nav: 'teams',     breadcrumb: ['Administration', 'Teams'],          label: '14 · Maintenance team management',          imageFile: 'Admin · Maintenance team management.png' },
  { id: 15, key: 'team_details',            nav: 'teams',     breadcrumb: ['Administration', 'Teams'],          label: '15 · Maintenance team details (Team Alpha)',imageFile: 'Admin · Maintenance team details.png' },
  { id: 16, key: 'add_personnel',           nav: 'teams',     breadcrumb: ['Administration', 'Teams'],          label: '16 · Add maintenance personnel (Error state)', imageFile: 'Admin · Add maintenance personnel.png' },
  { id: 17, key: 'edit_personnel',          nav: 'teams',     breadcrumb: ['Administration', 'Teams'],          label: '17 · Edit maintenance personnel',           imageFile: 'Admin · Edit maintenance personnel.png' },
  { id: 18, key: 'users_list',              nav: 'users',     breadcrumb: ['Administration', 'Users'],          label: '18 · User management',                      imageFile: 'Admin · User management.png' },
  { id: 19, key: 'user_details',            nav: 'users',     breadcrumb: ['Administration', 'Users'],          label: '19 · User details & account management',    imageFile: 'Admin · User details and account management.png' },
  { id: 20, key: 'analytics',               nav: 'analytics', breadcrumb: ['Administration', 'Analytics'],      label: '20 · Analytics and exports',                imageFile: 'Admin · Analytics and exports.png' },
  { id: 21, key: 'date_range_modal',        nav: 'analytics', breadcrumb: ['Administration', 'Analytics'],      label: '21 · Date-range filters (Error modal)',     imageFile: 'Admin · Date-range filters.png' },
  { id: 22, key: 'export_dialog_modal',     nav: 'analytics', breadcrumb: ['Administration', 'Analytics'],      label: '22 · Export CSV or PDF dialog (Modal)',     imageFile: 'Admin · Export CSV or PDF dialog.png' },
  { id: 23, key: 'export_error_modal',      nav: 'analytics', breadcrumb: ['Administration', 'Analytics'],      label: '23 · Export generation error (Modal)',      imageFile: 'Admin · Export generation error.png' },
  { id: 24, key: 'export_success_modal',    nav: 'analytics', breadcrumb: ['Administration', 'Analytics'],      label: '24 · Export success & local download (Modal)', imageFile: 'Admin · Export success.png' },
  { id: 25, key: 'admin_profile',           nav: 'settings',  breadcrumb: ['Administration', 'Settings'],       label: '25 · Administrator profile',                imageFile: 'Admin · Administrator profile.png' },
  { id: 26, key: 'workspace_settings',      nav: 'settings',  breadcrumb: ['Administration', 'Settings'],       label: '26 · Workspace settings',                   imageFile: 'Admin · Workspace settings.png' }
];

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
    month: 'October 2026'
  },

  // Selected report for workflow views
  selectedReportCode: 'RW-2026-0842',

  // Verification Review form state (Screen 4 & 5)
  verificationForm: {
    checkPhoto: true,
    checkPin: true,
    checkJurisdiction: true,
    checkDuplicates: true,
    severity: 'High',
    notes: 'Location confirmed near IBP Road. Approx. 0.8 m wide and 12 cm deep. High risk to motorcycles; prioritize repair.',
    modalNotes: 'Location confirmed near IBP Road. High risk to motorcycles.\nRW-2026-0819 is on the opposite carriageway and is not a duplicate.'
  },

  // Set review outcome modal state (Screens 6 & 7)
  outcomeModal: {
    tab: 'reject', // 'reject' | 'duplicate'
    rejectionCategory: 'Outside Quezon City jurisdiction',
    rejectionReason: "The submitted location is on Marcos Highway in Marikina City, outside this Quezon City workspace. The blurred photo also does not clearly show the damage. Please report through the relevant LGU's official channel with clear evidence taken safely.",
    originalReport: 'RW-2026-0826 · Aurora Boulevard',
    duplicateReason: 'The same pothole is already tracked in RW-2026-0826. Your report has been linked so you can follow its repair updates.'
  },

  // Duplicate Comparison state (Screen 8)
  duplicateCompareForm: {
    reason: 'Different carriageways and site photos. Retain 0842 as distinct; do not link it to 0819.'
  },

  // Team Assignment state (Screens 9 & 10)
  assignmentForm: {
    teamName: 'QC North · Team Alpha',
    leadName: 'Engr. Paolo Santos',
    priority: 'High',
    targetCompletion: '21 Oct 2026 · 5:00 PM',
    instructions: 'Prioritize northbound service road. Set up safety cones and photograph the site before and after repair.'
  },

  // Repair Completion Inspection state (Screen 11)
  completionForm: {
    checkSameSite: true,
    checkFilledCompacted: true,
    checkFlushSafe: true,
    checkNotesConsistent: true,
    reviewNotes: 'Evidence matches the reported site. Patch is level, compacted and clear of debris. Repair accepted for resolution.'
  },

  // Report Activity Log filters (Screen 12)
  auditLogFilters: {
    status: 'All statuses',
    fromDate: '19 Oct 2026',
    toDate: '21 Oct 2026'
  },

  // Pothole Map filters (Screen 13)
  mapFilters: {
    search: 'Commonwealth Avenue',
    status: 'All statuses',
    severity: 'All severities',
    barangay: 'Batasan Hills',
    modePill: 'All statuses',
    selectedPinCode: 'RW-2026-0842'
  },

  // Teams management filters (Screen 14)
  teamFilters: {
    search: '',
    district: 'All districts',
    status: 'Active teams'
  },

  // Add Maintenance Personnel form state (Screen 16 - defaults to Figma error state)
  addPersonnelForm: {
    fullName: 'Andrea Cruz',
    email: 'andrea.cruz@example.com',
    mobileNumber: '+63 917 000',
    role: 'Maintenance crew',
    team: 'QC North · Team Alpha',
    sendEmail: true,
    crewOrLeadPill: 'Crew'
  },

  // Edit Maintenance Personnel form state (Screen 17)
  editPersonnelForm: {
    fullName: 'Engr. Paolo Santos',
    email: 'paolo.santos@example.com',
    mobileNumber: '+63 917 000 0210',
    role: 'Maintenance lead',
    team: 'QC North · Team Alpha',
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
    fullName: 'Ana Dela Cruz',
    email: 'ana.delacruz@example.com',
    role: 'LGU administrator · Quezon City',
    department: 'City Engineering',
    reviewQueueAlerts: true,
    completionReviewAlerts: true,
    dailyEmailSummary: false,
    signinSecurityNotices: true,
    savedBannerVisible: true
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
    lguCity: 'Quezon City',
    department: 'City Engineering Department',
    hotline: '122',
    timezone: 'Asia/Manila · UTC+8'
  },

  // Primary dataset matching all 26 Figma screens
  reports: [
    {
      code: 'RW-2026-0842',
      road: 'Commonwealth Avenue',
      barangay: 'Batasan Hills',
      severity: 'High',
      status: 'Under Review',
      reportedDate: '19 Oct 2026',
      coordinates: '14.6978° N, 121.0881° E',
      landmark: 'Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City',
      description: 'Deep pothole on the northbound service road near IBP Road. Motorcycles are swerving around it; water collects after rain.',
      citizen: {
        name: 'Mika Reyes',
        email: 'mika.reyes@example.com',
        mobile: '+63 917 000 0184'
      }
    },
    {
      code: 'RW-2026-0841',
      road: 'Elliptical Road',
      barangay: 'Central',
      severity: 'Medium',
      status: 'Assigned',
      reportedDate: '19 Oct 2026',
      coordinates: '14.6515° N, 121.0493° E',
      landmark: 'Near Quezon Memorial Circle East Gate, Brgy. Central, Quezon City',
      description: 'Medium surface depression along the outer lane near East Avenue approach.',
      citizen: {
        name: 'Luis Mendoza',
        email: 'luis.mendoza@example.com',
        mobile: '+63 917 000 0192'
      }
    },
    {
      code: 'RW-2026-0840',
      road: 'Batasan Road',
      barangay: 'Batasan Hills',
      severity: 'High',
      status: 'In Progress',
      reportedDate: '18 Oct 2026',
      coordinates: '14.6942° N, 121.0915° E',
      landmark: 'Westbound lane approaching Batasan-San Mateo intersection, Brgy. Batasan Hills',
      description: 'Severe asphalt crater on Batasan Road westbound lane causing heavy slowdowns.',
      citizen: {
        name: 'Mika Reyes',
        email: 'mika.reyes@example.com',
        mobile: '+63 917 000 0184'
      }
    },
    {
      code: 'RW-2026-0839',
      road: 'Aurora Boulevard',
      barangay: 'Cubao',
      severity: 'Low',
      status: 'Verified',
      reportedDate: '18 Oct 2026',
      coordinates: '14.6221° N, 121.0612° E',
      landmark: 'Near Anonas LRT Station, Brgy. Cubao, Quezon City',
      description: 'Shallow surface wear along the curb lane near pedestrian crossing.',
      citizen: {
        name: 'Bea Navarro',
        email: 'bea.navarro@example.com',
        mobile: '+63 917 000 0234'
      }
    },
    {
      code: 'RW-2026-0838',
      road: 'Commonwealth Avenue',
      barangay: 'Holy Spirit',
      severity: 'Medium',
      status: 'Submitted',
      reportedDate: '18 Oct 2026',
      coordinates: '14.6812° N, 121.0764° E',
      landmark: 'Near Don Antonio footbridge, Brgy. Holy Spirit, Quezon City',
      description: 'Cracked asphalt patch reopening along the middle lane.',
      citizen: {
        name: 'Ina Villanueva',
        email: 'ina.villanueva@example.com',
        mobile: '+63 917 000 0256'
      }
    },
    {
      code: 'RW-2026-0837',
      road: 'Visayas Avenue',
      barangay: 'Vasra',
      severity: 'Medium',
      status: 'Resolved',
      reportedDate: '17 Oct 2026',
      coordinates: '14.6579° N, 121.0428° E',
      landmark: 'Near Department of Agriculture gate, Brgy. Vasra, Quezon City',
      description: 'Pothole near the intersection crosswalk repaired and compacted.',
      citizen: {
        name: 'Luis Mendoza',
        email: 'luis.mendoza@example.com',
        mobile: '+63 917 000 0192'
      }
    },
    {
      code: 'RW-2026-0836',
      road: 'Quirino Highway',
      barangay: 'Novaliches',
      severity: 'High',
      status: 'Rejected',
      reportedDate: '17 Oct 2026',
      coordinates: '14.7224° N, 121.0401° E',
      landmark: 'Near Novaliches Proper boundary, Quezon City',
      description: 'Submitted photo was taken on a private commercial parking driveway outside LGU road maintenance scope.',
      citizen: {
        name: 'Bea Navarro',
        email: 'bea.navarro@example.com',
        mobile: '+63 917 000 0234'
      }
    },
    {
      code: 'RW-2026-0835',
      road: 'Aurora Boulevard',
      barangay: 'Project 4',
      severity: 'Low',
      status: 'Duplicate',
      reportedDate: '17 Oct 2026',
      coordinates: '14.6228° N, 121.0695° E',
      landmark: 'Aurora Boulevard, Project 4 (12 m from RW-2026-0826)',
      description: 'Duplicate citizen report of the same pothole on Aurora Boulevard, Project 4.',
      citizen: {
        name: 'Ina Villanueva',
        email: 'ina.villanueva@example.com',
        mobile: '+63 917 000 0256'
      }
    }
  ],

  auditLogEvents: [
    { time: '19 Oct · 09:24', actor: 'Mika Reyes',         status: 'Submitted',    note: 'Photo and road pin received.' },
    { time: '19 Oct · 09:31', actor: 'Ana Dela Cruz',      status: 'Under Review', note: 'Photo and location check opened.' },
    { time: '19 Oct · 10:15', actor: 'Ana Dela Cruz',      status: 'Verified',     note: 'High severity confirmed; 0819 distinct, 38 m opposite carriageway.' },
    { time: '19 Oct · 10:30', actor: 'Ana Dela Cruz',      status: 'Assigned',     note: 'Team Alpha · High priority · target 21 Oct, 5 PM.' },
    { time: '19 Oct · 10:36', actor: 'Engr. Paolo Santos', status: 'Assigned',     note: 'Assignment accepted; no work-start change.' },
    { time: '20 Oct · 08:05', actor: 'Engr. Paolo Santos', status: 'Assigned',     note: 'Before photo and inspection recorded.' },
    { time: '20 Oct · 08:10', actor: 'Engr. Paolo Santos', status: 'In Progress',  note: 'Safety checks complete; repair started.' },
    { time: '21 Oct · 10:35', actor: 'Engr. Paolo Santos', status: 'In Progress',  note: 'Work completed; 1.2 × 1 m patch; 4 bags / ~200 kg asphalt.' },
    { time: '21 Oct · 10:45', actor: 'Engr. Paolo Santos', status: 'In Progress',  note: 'Completion evidence submitted for admin review.' },
    { time: '21 Oct · 11:20', actor: 'Ana Dela Cruz',      status: 'Resolved',     note: 'Evidence accepted. Patch level and compacted; lane reopened.' }
  ],

  teams: [
    {
      code: 'QC-NORTH-ALPHA',
      title: 'QC North · Team Alpha',
      lead: 'Engr. Paolo Santos',
      serviceArea: 'Batasan Hills / Commonwealth',
      crewSize: '4 maintenance personnel',
      specialty: 'Asphalt patching',
      workload: '8 assigned · 3 in progress',
      status: 'Active'
    },
    {
      code: 'QC-NORTH-BRAVO',
      title: 'QC North · Team Bravo',
      lead: 'Engr. Jessa Aquino',
      serviceArea: 'Novaliches / Fairview',
      crewSize: '6 maintenance personnel',
      specialty: 'Road resurfacing',
      workload: '6 assigned · 4 in progress',
      status: 'Active'
    },
    {
      code: 'QC-CENTRAL-CHARLIE',
      title: 'QC Central · Team Charlie',
      lead: 'Engr. Adrian Flores',
      serviceArea: 'Central / Diliman',
      crewSize: '5 maintenance personnel',
      specialty: 'Concrete repair',
      workload: '4 assigned · 2 in progress',
      status: 'Active'
    },
    {
      code: 'QC-EAST-DELTA',
      title: 'QC East · Team Delta',
      lead: 'Engr. Nica Bautista',
      serviceArea: 'Cubao / Project 4',
      crewSize: '5 maintenance personnel',
      specialty: 'Asphalt patching',
      workload: '7 assigned · 2 in progress',
      status: 'Active'
    }
  ],

  teamAlphaCrew: [
    { name: 'Rico Villanueva', specialty: 'Asphalt placement',  availability: 'On duty' },
    { name: 'Mariel Garcia',   specialty: 'Traffic safety',     availability: 'On duty' },
    { name: 'Jun Mendoza',     specialty: 'Compactor operator', availability: 'On duty' },
    { name: 'Liza Bautista',   specialty: 'Site preparation',   availability: 'On duty' }
  ],

  users: [
    { id: 1, name: 'Mika Reyes',         email: 'mika.reyes@example.com',     role: 'Citizen',           area: 'Batasan Hills',    status: 'Active' },
    { id: 2, name: 'Luis Mendoza',       email: 'luis.mendoza@example.com',   role: 'Citizen',           area: 'Central',          status: 'Active' },
    { id: 3, name: 'Ana Dela Cruz',      email: 'ana.delacruz@example.com',   role: 'LGU administrator', area: 'City Engineering', status: 'Active' },
    { id: 4, name: 'Engr. Paolo Santos', email: 'paolo.santos@example.com',   role: 'Maintenance lead',  area: 'QC North · Alpha', status: 'Active' },
    { id: 5, name: 'Bea Navarro',        email: 'bea.navarro@example.com',    role: 'Citizen',           area: 'Cubao',            status: 'Active' },
    { id: 6, name: 'Carlo Ramos',        email: 'carlo.ramos@example.com',    role: 'Maintenance crew',  area: 'QC North · Bravo', status: 'Active' },
    { id: 7, name: 'Ina Villanueva',     email: 'ina.villanueva@example.com', role: 'Citizen',           area: 'Holy Spirit',      status: 'Active' },
    { id: 8, name: 'Marco Lim',          email: 'marco.lim@example.com',      role: 'LGU reviewer',      area: 'City Engineering', status: 'Invited' }
  ]
};

const listeners = new Set();
let state = structuredClone(initialState);

export const store = {
  getState() {
    return state;
  },
  setState(updater) {
    const nextPartial = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...nextPartial };
    listeners.forEach((fn) => fn(state));
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  navigateToScreen(screenId) {
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
