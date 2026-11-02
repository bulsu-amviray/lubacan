// Initial sample datasets for reports, audit log events, teams, crew roster, and users for City of Malolos, Bulacan.

export const initialReports = [
  {
    code: 'RW-2026-0842',
    road: 'MacArthur Highway (Manila North Road)',
    barangay: 'Guinhawa',
    jurisdiction: 'DPWH-National',
    severity: 'High',
    status: 'Under Review',
    reportedDate: '19 Oct 2026',
    coordinates: '14.8524° N, 120.8168° E',
    landmark: 'Northbound lane near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan',
    description: 'Deep asphalt pothole along MacArthur Highway northbound lane. Motorcycles and jeepneys swerve into oncoming traffic; water collects during rain.',
    citizen: {
      name: 'Mika Reyes',
      email: 'mika.reyes@malolos.gov.ph',
      mobile: '+63 917 000 0184'
    }
  },
  {
    code: 'RW-2026-0841',
    road: 'Capitol Compound Road',
    barangay: 'Guinhawa',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Assigned',
    reportedDate: '19 Oct 2026',
    coordinates: '14.8512° N, 120.8145° E',
    landmark: 'Provincial Capitol building approach road, Brgy. Guinhawa, City of Malolos',
    description: 'Surface depression and broken pavement near the government center exit gate.',
    citizen: {
      name: 'Luis Mendoza',
      email: 'luis.mendoza@malolos.gov.ph',
      mobile: '+63 917 000 0192'
    }
  },
  {
    code: 'RW-2026-0840',
    road: 'Paseo del Congreso',
    barangay: 'San Vicente (Poblacion)',
    jurisdiction: 'City',
    severity: 'High',
    status: 'In Progress',
    reportedDate: '18 Oct 2026',
    coordinates: '14.8465° N, 120.8122° E',
    landmark: 'Barasoain Church plaza frontage, Brgy. San Vicente (Poblacion)',
    description: 'Damaged concrete slab and edge subsidence causing traffic slowdown along Paseo del Congreso.',
    citizen: {
      name: 'Mika Reyes',
      email: 'mika.reyes@malolos.gov.ph',
      mobile: '+63 917 000 0184'
    }
  },
  {
    code: 'RW-2026-0819',
    road: 'MacArthur Highway (Manila North Road)',
    barangay: 'Tikay',
    jurisdiction: 'DPWH-National',
    severity: 'High',
    status: 'Verified',
    reportedDate: '15 Oct 2026',
    coordinates: '14.8521° N, 120.8171° E',
    landmark: 'Southbound carriageway (38 m opposite RW-2026-0842), Brgy. Tikay, City of Malolos',
    description: 'Distinct south-bound lane pavement depression on opposite carriageway.',
    citizen: {
      name: 'Luis Mendoza',
      email: 'luis.mendoza@malolos.gov.ph',
      mobile: '+63 917 000 0192'
    }
  },
  {
    code: 'RW-2026-7083',
    road: 'Panasahan',
    barangay: 'Catmon',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8230° N, 120.8250° E',
    landmark: 'Panasahan, City of Malolos',
    description: 'Reported pothole via citizen mobile app.',
    citizen: {
      name: 'Alexa Viray',
      email: 'alexam@gmail.com',
      mobile: '09236648115'
    }
  },
  {
    code: 'RW-2026-0589',
    road: 'Panasahan',
    barangay: 'Catmon',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8229° N, 120.8256° E',
    landmark: 'Maja, Panasahan, City of Malolos',
    description: 'bitak bitak, may butas pothole',
    citizen: {
      name: 'Alexa Viray',
      email: 'alexam@gmail.com',
      mobile: '09236648115'
    }
  },
  {
    code: 'RW-2026-9200',
    road: 'GrandRoyale',
    barangay: 'Lugam',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8600° N, 120.8100° E',
    landmark: 'Grand Royale, City of Malolos',
    description: 'Reported pothole via citizen mobile app.',
    citizen: {
      name: 'Juan Dela Cruz',
      email: 'juan@gmail.com',
      mobile: '+63 917 111 9200'
    }
  },
  {
    code: 'RW-2026-7854',
    road: 'Malolos',
    barangay: 'Catmon',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8435° N, 120.8113° E',
    landmark: 'Catmon, City of Malolos',
    description: 'Reported pothole via citizen mobile app.',
    citizen: {
      name: 'Dokito Lee',
      email: 'dikito@gmail.com',
      mobile: '09346675228'
    }
  },
  {
    code: 'RW-2026-2140',
    road: 'San Juan',
    barangay: 'San Juan',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8420° N, 120.8100° E',
    landmark: 'San Juan, City of Malolos',
    description: 'Pothole along San Juan road reported by citizen.',
    citizen: {
      name: 'Alexa Viray',
      email: 'alexa.viray@gmail.com',
      mobile: '+63 917 444 4361'
    }
  },
  {
    code: 'RW-2026-8862',
    road: 'Blas Ople Diversion Road',
    barangay: 'Bulihan',
    jurisdiction: 'DPWH-National',
    severity: 'High',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8550° N, 120.8230° E',
    landmark: 'Blas Ople Diversion Road, Brgy. Bulihan',
    description: 'Pavement cavity along Blas Ople Diversion Road.',
    citizen: {
      name: 'Min Yoongi',
      email: 'min@gmail.com',
      mobile: '+63 917 888 8862'
    }
  },
  {
    code: 'RW-2026-5453',
    road: 'wooadmd',
    barangay: 'Catmon',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8430° N, 120.8110° E',
    landmark: 'Catmon, City of Malolos',
    description: 'Citizen report from Catmon.',
    citizen: {
      name: 'John Emhar Boncalos',
      email: 'deathrun536@gmail.com',
      mobile: '+63 917 555 5453'
    }
  },
  {
    code: 'RW-2026-6445',
    road: 'test',
    barangay: 'Catmon',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8432° N, 120.8115° E',
    landmark: 'Catmon, City of Malolos',
    description: 'Citizen test report from mobile.',
    citizen: {
      name: 'John Emhar Boncalos',
      email: 'deathrun536@gmail.com',
      mobile: '+63 917 555 5453'
    }
  },
  {
    code: 'RW-2026-2168',
    road: 'highway',
    barangay: 'Canalate',
    jurisdiction: 'City',
    severity: 'High',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8385° N, 120.8060° E',
    landmark: 'Canalate, City of Malolos',
    description: 'Road damage along highway corridor.',
    citizen: {
      name: 'casey regalario',
      email: 'casey@gmail.com',
      mobile: '+63 917 222 2168'
    }
  },
  {
    code: 'RW-2026-4361',
    road: 'jshehehsbsbs',
    barangay: 'Catmon',
    jurisdiction: 'City',
    severity: 'Medium',
    status: 'Submitted',
    reportedDate: '30 Oct 2026',
    coordinates: '14.8430° N, 120.8110° E',
    landmark: 'Catmon, City of Malolos',
    description: 'Citizen pothole submission.',
    citizen: {
      name: 'Alexa Viray',
      email: 'alexam@gmail.com',
      mobile: '+63 917 444 4361'
    }
  }
];

// Ensure every report has a valid photoUrl representing the citizen's uploaded photo
initialReports.forEach((r) => {
  if (!r.photoUrl) {
    r.photoUrl = './assets/pothole-citizen.jpg';
  }
});

export const initialAuditLogEvents = [
  { time: '19 Oct · 09:24', actor: 'Mika Reyes',         status: 'Submitted',    note: 'Photo and road pin received in Brgy. Guinhawa.' },
  { time: '19 Oct · 09:31', actor: 'Ana Dela Cruz',      status: 'Under Review', note: 'Photo and location check opened. Road flagged as DPWH National Road.' },
  { time: '19 Oct · 10:15', actor: 'Ana Dela Cruz',      status: 'Verified',     note: 'High severity confirmed; RW-2026-0819 distinct, 38 m opposite carriageway.' },
  { time: '19 Oct · 10:30', actor: 'Ana Dela Cruz',      status: 'Assigned',     note: 'Malolos Team Alpha · High priority · target 21 Oct, 5 PM.' },
  { time: '19 Oct · 10:36', actor: 'Engr. Paolo Santos', status: 'Assigned',     note: 'Assignment accepted; crew dispatched for site preparation.' },
  { time: '20 Oct · 08:05', actor: 'Engr. Paolo Santos', status: 'Assigned',     note: 'Before photo and site inspection recorded at MacArthur Hwy.' },
  { time: '20 Oct · 08:10', actor: 'Engr. Paolo Santos', status: 'In Progress',  note: 'Traffic safety cones placed; cold asphalt patching started.' },
  { time: '21 Oct · 10:35', actor: 'Engr. Paolo Santos', status: 'In Progress',  note: 'Work completed; 1.2 × 1 m patch compacted flush with pavement.' },
  { time: '21 Oct · 10:45', actor: 'Engr. Paolo Santos', status: 'In Progress',  note: 'Completion evidence submitted for City Engineering Office review.' },
  { time: '21 Oct · 11:20', actor: 'Ana Dela Cruz',      status: 'Resolved',     note: 'Evidence accepted. Patch level and compacted; MacArthur Hwy lane reopened.' }
];

export const initialTeams = [
  {
    code: 'MALOLOS-ALPHA',
    title: 'Malolos Team Alpha',
    lead: 'Engr. Paolo Santos',
    serviceArea: 'Highway / Commercial Corridor (Guinhawa / Bulihan / Tikay / Sumapang Matanda)',
    crewSize: '4 maintenance personnel',
    specialty: 'Asphalt patching & concrete re-blocking',
    workload: '8 assigned · 3 in progress',
    status: 'Active',
    phone: '+63 917 000 0210',
    email: 'paolo.santos@malolos.gov.ph'
  },
  {
    code: 'MALOLOS-BRAVO',
    title: 'Malolos Team Bravo',
    lead: 'Engr. Jessa Aquino',
    serviceArea: 'Poblacion / Rural (Barasoain / San Vicente / Santo Rosario / Mabolo / Atlag)',
    crewSize: '6 maintenance personnel',
    specialty: 'Drainage cover restoration & patching',
    workload: '6 assigned · 4 in progress',
    status: 'Active',
    phone: '+63 917 000 0211',
    email: 'jessa.aquino@malolos.gov.ph'
  }
];

// Ensure every report has a valid photoUrl representing the citizen's uploaded photo
initialReports.forEach((r) => {
  if (!r.photoUrl) {
    r.photoUrl = './assets/pothole-citizen.jpg';
  }
});

export const initialTeamAlphaCrew = [
  { name: 'Rico Villanueva', specialty: 'Asphalt placement',  availability: 'On duty' },
  { name: 'Mariel Garcia',   specialty: 'Traffic safety',     availability: 'On duty' },
  { name: 'Jun Mendoza',     specialty: 'Compactor operator', availability: 'On duty' },
  { name: 'Liza Bautista',   specialty: 'Site preparation',   availability: 'On duty' }
];

export const initialUsers = [
  { id: 27, name: 'Alexa Viray', email: 'alexam@gmail.com', mobile: '09236648115', role: 'Citizen', area: 'Catmon', status: 'Active' },
  { id: 'usr-juan', name: 'Juan Dela Cruz', email: 'juan@gmail.com', mobile: '+63 917 111 9200', role: 'Citizen', area: 'Lugam', status: 'Active' },
  { id: 14, name: 'System Administrator', email: 'admin@malolos.gov.ph', mobile: '+63 917 000 0001', role: 'LGU administrator', area: 'City Engineering Office', status: 'Active' },
  { id: 1, name: 'Mika Reyes',         email: 'mika.reyes@malolos.gov.ph',     mobile: '+63 917 000 0184', role: 'Citizen',           area: 'Guinhawa',                        status: 'Active' },
  { id: 2, name: 'Luis Mendoza',       email: 'luis.mendoza@malolos.gov.ph',   mobile: '+63 917 000 0192', role: 'Citizen',           area: 'San Vicente (Poblacion)',          status: 'Active' },
  { id: 3, name: 'Ana Dela Cruz',      email: 'ana.delacruz@malolos.gov.ph',   mobile: '+63 917 000 0101', role: 'LGU administrator', area: 'City Engineering Office',          status: 'Active' },
  { id: 4, name: 'Engr. Paolo Santos', email: 'paolo.santos@malolos.gov.ph',   mobile: '+63 917 000 0210', role: 'Maintenance lead',  area: 'Malolos Team Alpha',               status: 'Active' },
  { id: 5, name: 'Bea Navarro',        email: 'bea.navarro@malolos.gov.ph',    mobile: '+63 917 000 0234', role: 'Citizen',           area: 'Mabolo',                          status: 'Active' },
  { id: 6, name: 'Carlo Ramos',        email: 'carlo.ramos@malolos.gov.ph',    mobile: '+63 917 000 0245', role: 'Maintenance crew',  area: 'Malolos Team Bravo',               status: 'Active' },
  { id: 7, name: 'Ina Villanueva',     email: 'ina.villanueva@malolos.gov.ph', mobile: '+63 917 000 0256', role: 'Citizen',           area: 'Bulihan',                         status: 'Active' },
  { id: 8, name: 'Marco Lim',          email: 'marco.lim@malolos.gov.ph',      mobile: '+63 917 000 0267', role: 'LGU reviewer',      area: 'City Engineering Office',          status: 'Invited' },
  { id: 9, name: 'Min Yoongi',         email: 'min@gmail.com',                 mobile: '+63 917 888 8862', role: 'Citizen',           area: 'Dakila',                          status: 'Active' },
  { id: 10, name: 'John Emhar Boncalos', email: 'john.boncalos@gmail.com',     mobile: '+63 917 555 5453', role: 'Citizen',           area: 'Guinhawa',                        status: 'Active' },
  { id: 11, name: 'casey regalario',   email: 'casey.regalario@gmail.com',     mobile: '+63 917 222 2168', role: 'Citizen',           area: 'Catmon',                          status: 'Active' },
  { id: 12, name: 'Alexa Viray',       email: 'alexa.viray@gmail.com',         mobile: '+63 917 444 4361', role: 'Citizen',           area: 'Mojon',                           status: 'Active' }
];
