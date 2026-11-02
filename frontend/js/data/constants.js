// Constants, icon micro-templates, screen catalog, and status/severity token maps.

export const SVG_CHEVRON_DOWN = `<svg class="w-3 h-3 text-luba-textPrimary inline-block ml-1" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>`;
export const SVG_CHEVRON_UP = `<svg class="w-3 h-3 text-luba-textPrimary inline-block ml-1" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 15l-6-6-6 6"/></svg>`;
export const SVG_CLOSE_X = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>`;

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

export const SCREENS_WITH_OPERATIONAL_DOT = new Set([1, 2, 3, 4, 7, 9, 11, 14, 18, 20, 24, 26]);

// City of Malolos, Bulacan: 51 Barangays
export const MALOLOS_BARANGAYS = [
  'Anilao', 'Atlag', 'Babatnin', 'Bagna', 'Bagong Bayan (Poblacion)', 'Balayong', 'Balite',
  'Bangkal', 'Barihan', 'Bulihan', 'Bungahan', 'Caingin', 'Calero', 'Caliligawan',
  'Canalate', 'Caniogan', 'Catmon', 'Cofradia', 'Dakila', 'Guinhawa', 'Liang',
  'Ligas', 'Longos', 'Look 1st', 'Look 2nd', 'Lugam', 'Mabolo', 'Mambog',
  'Masile', 'Matimbo', 'Mojon', 'Namayan', 'Niugan', 'Pamarawan', 'Panasahan',
  'Pinagbakahan', 'San Agustin', 'San Gabriel', 'San Juan', 'San Pablo',
  'San Vicente (Poblacion)', 'Santiago', 'Santisima Trinidad', 'Santo Cristo',
  'Santo Niño (Poblacion)', 'Santo Rosario (Poblacion)', 'Santor', 'Sumapang Bata',
  'Sumapang Matanda', 'Taal', 'Tikay'
];

// Placeholder Zone Clusters
export const MALOLOS_ZONE_CLUSTERS = {
  Poblacion: ['Bagong Bayan (Poblacion)', 'San Vicente (Poblacion)', 'Santo Niño (Poblacion)', 'Santo Rosario (Poblacion)'],
  'Highway Corridor': ['Guinhawa', 'Bulihan', 'Tikay', 'Sumapang Matanda'],
  'Outer / Rural': MALOLOS_BARANGAYS.filter((b) =>
    !['Bagong Bayan (Poblacion)', 'San Vicente (Poblacion)', 'Santo Niño (Poblacion)', 'Santo Rosario (Poblacion)',
      'Guinhawa', 'Bulihan', 'Tikay', 'Sumapang Matanda'].includes(b)
  )
};

// Road Corridors and Jurisdiction
export const MALOLOS_ROAD_CORRIDORS = [
  { name: 'MacArthur Highway (Manila North Road)', jurisdiction: 'DPWH-National', primaryBarangays: ['Guinhawa', 'Bulihan', 'Tikay', 'Sumapang Matanda'] },
  { name: 'Paseo del Congreso', jurisdiction: 'City', primaryBarangays: ['San Vicente (Poblacion)', 'Santo Niño (Poblacion)', 'Catmon'] },
  { name: 'Blas Ople Diversion Road', jurisdiction: 'DPWH-National', primaryBarangays: ['Bulihan', 'Dakila', 'Mojon'] },
  { name: 'Malolos–Bulakan Road', jurisdiction: 'DPWH-National', primaryBarangays: ['Catmon', 'San Gabriel', 'Panasahan'] },
  { name: 'Fausta Road / Mabolo–San Jose Road', jurisdiction: 'City', primaryBarangays: ['Mabolo', 'Santo Cristo'] },
  { name: 'Capitol Compound Road', jurisdiction: 'City', primaryBarangays: ['Guinhawa'] }
];

export const MALOLOS_LGU_CONFIG = {
  city: 'City of Malolos, Bulacan',
  shortCity: 'City of Malolos',
  department: 'City Engineering Office, City of Malolos',
  workspaceId: 'MALOLOS-LGU-ENG',
  hotline: '0000-000-0000',
  emailDomain: 'malolos.gov.ph',
  mapCenter: { lat: 14.8433, lng: 120.8113, label: 'Malolos City Hall area' }
};
