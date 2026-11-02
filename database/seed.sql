SET NAMES utf8mb4;
SET time_zone = '+08:00';
USE `luba_canfindit`;

-- 1. WORKSPACE SEED (City of Malolos Engineering Office)
INSERT INTO `workspaces` (
  `workspace_id`, `workspace_code`, `lgu_name`, `department_name`, `public_hotline`,
  `timezone`, `duplicate_radius_meters`, `sla_high_hours`, `sla_medium_days`, `sla_low_days`,
  `require_photo`, `require_admin_verification_before_resolution`, `enable_nearby_duplicate_checks`,
  `notify_citizen_status_change`, `request_post_repair_feedback`, `send_email_update_digest`,
  `created_at`, `updated_at`
) VALUES (
  1, 'MALOLOS-LGU-ENG', 'City of Malolos, Bulacan', 'City Engineering Office, City of Malolos', '0000-00-0000',
  'Asia/Manila', 50, 48, 5, 14,
  1, 1, 1, 1, 1, 0,
  '2026-05-01 08:00:00', '2026-10-21 08:00:00'
);

-- 2. ROLES
INSERT INTO `roles` (`role_id`, `role_slug`, `role_display_name`, `is_staff_role`, `grants_admin_console`, `description`) VALUES
  (1, 'lgu_admin', 'LGU administrator', 1, 1, 'Full City of Malolos LGU operations, verification, assignment, user access, and workspace policy control.'),
  (2, 'lgu_reviewer', 'LGU reviewer', 1, 1, 'Reviews incoming citizen reports, checks duplicates, and confirms damage severity.'),
  (3, 'maintenance_lead', 'Maintenance lead', 1, 0, 'Supervises field repair crew, accepts assigned tasks, and submits repair completion evidence.'),
  (4, 'maintenance_crew', 'Maintenance crew', 1, 0, 'Executes field asphalt/concrete repair operations under a maintenance lead.'),
  (5, 'citizen', 'Citizen', 0, 0, 'Submits road damage reports and receives lifecycle status updates.');

-- 3. PERMISSIONS (16 Granular Permission Keys)
INSERT INTO `permissions` (`permission_id`, `permission_key`, `module_name`, `description`) VALUES
  (1,  'overview.view',               'overview',  'View city road operations overview dashboard'),
  (2,  'analytics.view',              'analytics', 'View road performance analytics and KPI summaries'),
  (3,  'reports.view',                'reports',   'View pothole reports list and details'),
  (4,  'reports.view_restricted_pii', 'reports',   'View restricted citizen name, email, and mobile number'),
  (5,  'reports.verify',              'reports',   'Approve, reject, or flag duplicate citizen reports'),
  (6,  'reports.compare_duplicates',  'reports',   'Perform spatial and photo duplicate comparisons'),
  (7,  'reports.assign',              'reports',   'Assign verified reports to maintenance teams and update priority'),
  (8,  'repairs.submit',              'repairs',   'Submit before/after repair completion evidence'),
  (9,  'repairs.approve',             'repairs',   'Inspect repair evidence and mark reports Resolved or return for rework'),
  (10, 'map.view',                    'map',       'View citywide pothole map and pin inspector'),
  (11, 'teams.view',                  'teams',     'View maintenance teams and crew workload'),
  (12, 'teams.manage',                'teams',     'Create teams, invite maintenance personnel, and edit assignments'),
  (13, 'users.view',                  'users',     'View user directory and citizen account details'),
  (14, 'users.manage_status',         'users',     'Activate or suspend user accounts with mandatory audit reason'),
  (15, 'exports.generate',            'exports',   'Generate and download CSV and PDF report exports'),
  (16, 'settings.manage',             'settings',  'Configure workspace reporting rules, SLAs, and jurisdiction policies');

-- Grant all permissions to lgu_admin (role_id = 1)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `permission_id` FROM `permissions`;

-- Grant reviewer permissions to lgu_reviewer (role_id = 2)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 10), (2, 11);

-- Grant lead permissions to maintenance_lead (role_id = 3)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
  (3, 3), (3, 8), (3, 10), (3, 11);

-- Grant crew permissions to maintenance_crew (role_id = 4)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
  (4, 3), (4, 10);

-- Grant citizen permissions to citizen (role_id = 5)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
  (5, 3);

-- 4. ALL 51 OFFICIAL BARANGAYS OF THE CITY OF MALOLOS
INSERT INTO `barangays` (`barangay_id`, `workspace_id`, `barangay_name`, `district_name`, `center_lat`, `center_lng`) VALUES
  (1,  1, 'Anilao',             'Outer / Rural',     14.8562000, 120.8041000),
  (2,  1, 'Atlag',              'Outer / Rural',     14.8321000, 120.8245000),
  (3,  1, 'Babatnin',           'Outer / Rural',     14.7712000, 120.8410000),
  (4,  1, 'Bagna',              'Outer / Rural',     14.8398000, 120.8285000),
  (5,  1, 'Bagong Bayan',       'Poblacion',         14.8441000, 120.8124000),
  (6,  1, 'Balayong',           'Outer / Rural',     14.8490000, 120.8320000),
  (7,  1, 'Balite',             'Outer / Rural',     14.8621000, 120.8270000),
  (8,  1, 'Bangkal',            'Outer / Rural',     14.8682000, 120.8080000),
  (9,  1, 'Barihan',            'Outer / Rural',     14.8710000, 120.8340000),
  (10, 1, 'Bulihan',            'Highway Corridor',  14.8552000, 120.8234000),
  (11, 1, 'Bungahan',           'Outer / Rural',     14.8790000, 120.8260000),
  (12, 1, 'Caingin',            'Outer / Rural',     14.8420000, 120.8190000),
  (13, 1, 'Calero',             'Outer / Rural',     14.8345000, 120.8180000),
  (14, 1, 'Caliligawan',        'Outer / Rural',     14.7810000, 120.8380000),
  (15, 1, 'Canalate',           'Outer / Rural',     14.8385000, 120.8060000),
  (16, 1, 'Caniogan',           'Outer / Rural',     14.8480000, 120.8160000),
  (17, 1, 'Catmon',             'Outer / Rural',     14.8475000, 120.8105000),
  (18, 1, 'Cofradia',           'Outer / Rural',     14.8590000, 120.8150000),
  (19, 1, 'Dakila',             'Outer / Rural',     14.8610000, 120.8410000),
  (20, 1, 'Guinhawa',           'Highway Corridor',  14.8482000, 120.8175000),
  (21, 1, 'Liang',              'Outer / Rural',     14.8465000, 120.8090000),
  (22, 1, 'Ligas',              'Outer / Rural',     14.8690000, 120.8520000),
  (23, 1, 'Longos',             'Outer / Rural',     14.8625000, 120.8290000),
  (24, 1, 'Look 1st',           'Outer / Rural',     14.8510000, 120.8010000),
  (25, 1, 'Look 2nd',           'Outer / Rural',     14.8540000, 120.7960000),
  (26, 1, 'Lugam',              'Outer / Rural',     14.8605000, 120.8030000),
  (27, 1, 'Mabolo',             'Outer / Rural',     14.8415000, 120.8020000),
  (28, 1, 'Mambog',             'Outer / Rural',     14.8360000, 120.8350000),
  (29, 1, 'Masile',             'Outer / Rural',     14.7780000, 120.8450000),
  (30, 1, 'Matimbo',            'Outer / Rural',     14.8300000, 120.8300000),
  (31, 1, 'Mojon',              'Outer / Rural',     14.8580000, 120.8120000),
  (32, 1, 'Namayan',            'Outer / Rural',     14.7650000, 120.8420000),
  (33, 1, 'Niugan',             'Outer / Rural',     14.8450000, 120.8250000),
  (34, 1, 'Pamarawan',          'Outer / Rural',     14.7590000, 120.8390000),
  (35, 1, 'Panasahan',          'Outer / Rural',     14.8280000, 120.8170000),
  (36, 1, 'Pinagbakahan',       'Outer / Rural',     14.8720000, 120.8180000),
  (37, 1, 'San Agustin',        'Outer / Rural',     14.8495000, 120.8070000),
  (38, 1, 'San Gabriel',        'Outer / Rural',     14.8430000, 120.8080000),
  (39, 1, 'San Juan',           'Outer / Rural',     14.8370000, 120.8130000),
  (40, 1, 'San Pablo',          'Outer / Rural',     14.8520000, 120.8100000),
  (41, 1, 'San Vicente',        'Poblacion',         14.8433000, 120.8113000),
  (42, 1, 'Santiago',           'Outer / Rural',     14.8455000, 120.8035000),
  (43, 1, 'Santisima Trinidad', 'Outer / Rural',     14.8715000, 120.8280000),
  (44, 1, 'Santo Cristo',       'Outer / Rural',     14.8460000, 120.8120000),
  (45, 1, 'Santo Niño',         'Poblacion',         14.8425000, 120.8100000),
  (46, 1, 'Santo Rosario',      'Poblacion',         14.8450000, 120.8135000),
  (47, 1, 'Santor',             'Outer / Rural',     14.8750000, 120.8380000),
  (48, 1, 'Sumapang Bata',      'Outer / Rural',     14.8585000, 120.8310000),
  (49, 1, 'Sumapang Matanda',   'Highway Corridor',  14.8620000, 120.8350000),
  (50, 1, 'Taal',               'Outer / Rural',     14.8390000, 120.8160000),
  (51, 1, 'Tikay',              'Highway Corridor',  14.8590000, 120.8420000);

-- 5. ROAD CORRIDORS & JURISDICTION
INSERT INTO `road_corridors` (`corridor_id`, `workspace_id`, `road_name`, `primary_barangay_id`, `is_high_traffic`) VALUES
  (1, 1, 'MacArthur Highway (Manila North Road)', 20, 1),
  (2, 1, 'Paseo del Congreso',                    41, 1),
  (3, 1, 'Blas Ople Diversion Road',              15, 1),
  (4, 1, 'Malolos–Bulakan Road',                  2,  1),
  (5, 1, 'Fausta Road / Mabolo–San Jose Road',    27, 1),
  (6, 1, 'Capitol Compound Road',                 20, 0);

-- 6. USERS
INSERT INTO `users` (
  `user_id`, `workspace_id`, `role_id`, `full_name`, `email`, `mobile_number`,
  `password_hash`, `department_or_area`, `barangay_id`, `account_status`, `is_email_verified`, `created_at`
) VALUES
  (1,  1, 5, 'Mika Reyes',          'mika.reyes@example.com',       '+63 917 000 0184', '$2b$10$demoHashCitizenMikaReyes0000000000000000000000000', 'Guinhawa',           20, 'Active',  1, '2026-10-01 09:00:00'),
  (2,  1, 5, 'Luis Mendoza',        'luis.mendoza@example.com',     '+63 917 000 0192', '$2b$10$demoHashCitizenLuisMendoza00000000000000000000000', 'San Vicente',       41, 'Active',  1, '2026-10-02 10:15:00'),
  (3,  1, 1, 'Ana Dela Cruz',       'ana.delacruz@malolos.gov.ph',  '+63 917 000 0101', '$2b$10$demoHashAdminAnaDelaCruz0000000000000000000000000', 'City Engineering',  41, 'Active',  1, '2026-05-01 08:00:00'),
  (4,  1, 3, 'Engr. Paolo Santos',  'paolo.santos@malolos.gov.ph',  '+63 917 000 0210', '$2b$10$demoHashLeadPaoloSantos00000000000000000000000000', 'Malolos Team Alpha', 20, 'Active',  1, '2026-05-10 08:00:00'),
  (5,  1, 5, 'Bea Navarro',         'bea.navarro@example.com',      '+63 917 000 0234', '$2b$10$demoHashCitizenBeaNavarro000000000000000000000000', 'San Gabriel',       38, 'Active',  1, '2026-10-04 11:30:00'),
  (6,  1, 4, 'Carlo Ramos',         'carlo.ramos@malolos.gov.ph',   '+63 917 000 0245', '$2b$10$demoHashCrewCarloRamos000000000000000000000000000', 'Malolos Team Bravo', 41, 'Active',  1, '2026-06-01 08:00:00'),
  (7,  1, 5, 'Ina Villanueva',      'ina.villanueva@example.com',   '+63 917 000 0256', '$2b$10$demoHashCitizenInaVillanueva000000000000000000000', 'Bulihan',           10, 'Active',  1, '2026-10-05 14:20:00'),
  (8,  1, 2, 'Marco Lim',           'marco.lim@malolos.gov.ph',     '+63 917 000 0267', NULL,                                                        'City Engineering',  41, 'Invited', 0, '2026-10-18 09:00:00'),
  (9,  1, 3, 'Engr. Jessa Aquino',  'jessa.aquino@malolos.gov.ph',  '+63 917 000 0211', '$2b$10$demoHashLeadJessaAquino00000000000000000000000000', 'Malolos Team Bravo', 41, 'Active',  1, '2026-05-10 08:00:00'),
  (10, 1, 4, 'Rico Villanueva',     'rico.villanueva@malolos.gov.ph','+63 917 000 0301', '$2b$10$demoHashCrewRicoVillanueva00000000000000000000000', 'Malolos Team Alpha', 20, 'Active',  1, '2026-06-01 08:00:00'),
  (11, 1, 4, 'Mariel Garcia',       'mariel.garcia@malolos.gov.ph', '+63 917 000 0302', '$2b$10$demoHashCrewMarielGarcia0000000000000000000000000', 'Malolos Team Alpha', 20, 'Active',  1, '2026-06-01 08:00:00'),
  (12, 1, 4, 'Jun Mendoza',         'jun.mendoza@malolos.gov.ph',   '+63 917 000 0303', '$2b$10$demoHashCrewJunMendoza000000000000000000000000000', 'Malolos Team Alpha', 20, 'Active',  1, '2026-06-01 08:00:00'),
  (13, 1, 4, 'Liza Bautista',       'liza.bautista@malolos.gov.ph', '+63 917 000 0304', '$2b$10$demoHashCrewLizaBautista0000000000000000000000000', 'Malolos Team Alpha', 20, 'Active',  1, '2026-06-01 08:00:00'),
  (14, 1, 1, 'System Administrator', 'admin@malolos.gov.ph',        '+63 917 000 0001', '$2b$10$TxdD3N25Ug1dmtV4J/BpA.5LkN1wwaOnq3t2z2bKyqP1NbHLwURG2', 'City Engineering Office', 41, 'Active', 1, '2026-05-01 08:00:00');

-- Notification preferences for administrators
INSERT INTO `user_notification_preferences` (
  `user_id`, `review_queue_alerts`, `completion_review_alerts`, `daily_email_summary`, `signin_security_notices`, `updated_at`
) VALUES (
  14, 1, 1, 1, 1, '2026-10-21 12:05:00'
);

-- Notification preferences for Ana Dela Cruz
INSERT INTO `user_notification_preferences` (
  `user_id`, `review_queue_alerts`, `completion_review_alerts`, `daily_email_summary`, `signin_security_notices`, `updated_at`
) VALUES (
  3, 1, 1, 0, 1, '2026-10-21 12:05:00'
);

-- Pending invitation for Marco Lim
INSERT INTO `user_invitations` (
  `invitation_id`, `user_id`, `invited_by_user_id`, `role_id`, `team_id`, `token_hash`, `send_to_work_email`, `expires_at`, `created_at`
) VALUES (
  1, 8, 3, 2, NULL, 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0', 1, '2026-10-25 09:00:00', '2026-10-18 09:00:00'
);

-- 7. MAINTENANCE TEAMS (City of Malolos Teams)
INSERT INTO `maintenance_teams` (
  `team_id`, `workspace_id`, `team_code`, `district_name`, `team_name`, `lead_user_id`,
  `service_area_description`, `specialty`, `service_hours`, `team_status`
) VALUES
  (1, 1, 'MALOLOS-ALPHA', 'Highway / Commercial Corridor', 'Malolos Team Alpha', 4, 'MacArthur Highway, Guinhawa, Tikay, Bulihan', 'Asphalt patching & concrete re-blocking', '7:00 AM–4:00 PM PHT', 'Active'),
  (2, 1, 'MALOLOS-BRAVO', 'Poblacion / Rural',             'Malolos Team Bravo', 9, 'Paseo del Congreso, San Vicente, Santo Rosario, Outer Barangays', 'Drainage cover restoration & patching', '7:00 AM–4:00 PM PHT', 'Active');

-- Team Alpha & Bravo Crew Members
INSERT INTO `team_members` (`team_id`, `user_id`, `member_role`, `specialty`, `availability_status`) VALUES
  (1, 4,  'Lead', 'Asphalt patching & concrete re-blocking', 'On duty'),
  (1, 10, 'Crew', 'Asphalt placement',                       'On duty'),
  (1, 11, 'Crew', 'Traffic safety',                          'On duty'),
  (1, 12, 'Crew', 'Compactor operator',                      'On duty'),
  (1, 13, 'Crew', 'Site preparation',                        'On duty'),
  (2, 9,  'Lead', 'Drainage cover restoration & patching',   'On duty'),
  (2, 6,  'Crew', 'Site preparation',                        'On duty');

-- 8. POTHOLE REPORTS
INSERT INTO `pothole_reports` (
  `report_id`, `public_report_code`, `workspace_id`, `reporter_user_id`, `corridor_id`,
  `road_name`, `jurisdiction`, `carriageway_direction`, `location_landmark`, `barangay_id`, `barangay_name`, `city_name`,
  `latitude`, `longitude`, `gps_accuracy_meters`, `description`,
  `citizen_severity`, `verified_severity`, `estimated_width_m`, `estimated_depth_cm`,
  `current_status`, `duplicate_of_report_id`, `rejection_category`, `citizen_visible_outcome_reason`,
  `submitted_at`, `first_reviewed_at`, `verified_at`, `verified_by_user_id`,
  `assigned_at`, `in_progress_at`, `resolved_at`, `resolved_by_user_id`, `closed_exception_at`
) VALUES
  (
    1, 'RW-2026-0842', 1, 1, 1,
    'MacArthur Highway', 'DPWH-National', 'Northbound', 'Northbound lane, near Bulihan junction, Brgy. Guinhawa, City of Malolos', 20, 'Guinhawa', 'City of Malolos',
    14.8482000, 120.8175000, 8,
    'Deep pothole on the northbound lane of MacArthur Highway near Bulihan junction. Heavy trucks and tricycles swerving.',
    'High', 'High', 0.80, 12.0,
    'Under Review', NULL, NULL, NULL,
    '2026-10-19 09:24:00', '2026-10-19 09:31:00', '2026-10-19 10:15:00', 3,
    '2026-10-19 10:30:00', '2026-10-20 08:10:00', NULL, NULL, NULL
  ),
  (
    2, 'RW-2026-0841', 1, 2, 2,
    'Paseo del Congreso', 'City', 'Eastbound', 'Near Malolos City Hall / Plaza, Brgy. San Vicente, City of Malolos', 41, 'San Vicente', 'City of Malolos',
    14.8433000, 120.8113000, 6,
    'Medium surface depression along Paseo del Congreso near City Hall.',
    'Medium', 'Medium', 0.55, 7.5,
    'Assigned', NULL, NULL, NULL,
    '2026-10-19 08:40:00', '2026-10-19 09:10:00', '2026-10-19 09:45:00', 3,
    '2026-10-19 10:05:00', NULL, NULL, NULL, NULL
  ),
  (
    3, 'RW-2026-0840', 1, 1, 1,
    'MacArthur Highway', 'DPWH-National', 'Westbound', 'Westbound lane approaching Tikay flyover junction, Brgy. Tikay', 51, 'Tikay', 'City of Malolos',
    14.8590000, 120.8420000, 9,
    'Severe crater on MacArthur Highway westbound lane causing heavy slowdowns.',
    'High', 'High', 0.95, 14.0,
    'In Progress', NULL, NULL, NULL,
    '2026-10-18 15:20:00', '2026-10-18 16:00:00', '2026-10-18 16:30:00', 3,
    '2026-10-18 17:00:00', '2026-10-19 08:00:00', NULL, NULL, NULL
  ),
  (
    8, 'RW-2026-0826', 1, 5, 5,
    'Fausta Road', 'City', 'Eastbound', 'Near Mabolo junction, Brgy. Mabolo, City of Malolos', 27, 'Mabolo', 'City of Malolos',
    14.8415000, 120.8020000, 6,
    'Primary report for Fausta Road Mabolo pothole currently in progress.',
    'High', 'High', 0.75, 11.0,
    'In Progress', NULL, NULL, NULL,
    '2026-10-16 14:00:00', '2026-10-16 15:00:00', '2026-10-16 15:30:00', 3,
    '2026-10-16 16:00:00', '2026-10-17 08:00:00', NULL, NULL, NULL
  ),
  (
    10, 'RW-2026-0819', 1, 2, 1,
    'MacArthur Highway', 'DPWH-National', 'Southbound', 'Opposite carriageway near Tikay crossing, Brgy. Tikay, City of Malolos', 51, 'Tikay', 'City of Malolos',
    14.8592000, 120.8423000, 7,
    'Southbound carriageway pothole 38 m opposite RW-2026-0842 candidate.',
    'High', 'High', 0.70, 10.5,
    'Assigned', NULL, NULL, NULL,
    '2026-10-18 16:10:00', '2026-10-18 16:40:00', '2026-10-18 17:05:00', 3,
    '2026-10-18 17:30:00', NULL, NULL, NULL, NULL
  ),
  (
    11, 'RW-2026-0844', 1, 2, NULL,
    'Bocaue–San Jose Road', 'DPWH-National', 'Eastbound', 'Bocaue–San Jose Road, Outside City Jurisdiction', 27, 'Outside Jurisdiction', 'Bocaue',
    14.8012000, 120.8651000, 15,
    'Pothole reported along Bocaue–San Jose Road outside Malolos City jurisdiction.',
    'Medium', NULL, NULL, NULL,
    'Under Review', NULL, 'Outside City of Malolos jurisdiction',
    'The submitted location is on Bocaue–San Jose Road, outside this City of Malolos workspace. Please report through the DPWH Bulacan 1st District Engineering Office.',
    '2026-10-19 11:00:00', '2026-10-19 11:15:00', NULL, NULL,
    NULL, NULL, NULL, NULL, NULL
  ),
  (
    12, 'RW-2026-0828', 1, 1, 3,
    'Blas Ople Diversion Road', 'DPWH-National', 'Eastbound', 'Near Canalate bridge approach, Brgy. Canalate', 15, 'Canalate', 'City of Malolos',
    14.8385000, 120.8060000, 8,
    'Edge spalling along Blas Ople Diversion Road eastbound.',
    'Medium', 'Medium', 0.50, 7.0,
    'Assigned', NULL, NULL, NULL,
    '2026-10-18 09:00:00', '2026-10-18 09:45:00', '2026-10-18 10:15:00', 3,
    '2026-10-18 11:00:00', NULL, NULL, NULL, NULL
  );

-- 9. REPORT MEDIA
INSERT INTO `report_media` (`media_id`, `report_id`, `uploaded_by_user_id`, `media_stage`, `file_url`, `file_size_bytes`, `mime_type`, `captured_at`) VALUES
  (1, 1,  1, 'CitizenSubmission', '/assets/pothole-citizen.jpg', 2516582, 'image/jpeg', '2026-10-19 09:24:00'),
  (2, 1,  4, 'BeforeRepair',      '/assets/pothole-before.jpg',  2411724, 'image/jpeg', '2026-10-20 08:05:00'),
  (3, 1,  4, 'AfterRepair',       '/assets/pothole-after.jpg',   2306867, 'image/jpeg', '2026-10-21 10:35:00'),
  (4, 10, 2, 'CitizenSubmission', '/assets/pothole-existing.jpg',2450000, 'image/jpeg', '2026-10-18 16:10:00');

-- 10. REPORT VERIFICATION & DUPLICATE COMPARISON RECORDS
INSERT INTO `report_verifications` (
  `verification_id`, `report_id`, `reviewer_user_id`,
  `check_photo_shows_damage`, `check_road_pin_match`, `check_within_jurisdiction`, `check_nearby_duplicates`,
  `compared_nearby_report_id`, `decision`, `confirmed_severity`, `verification_notes`, `created_at`
) VALUES (
  1, 1, 3,
  1, 1, 1, 1,
  10, 'Approved', 'High',
  'Location confirmed on MacArthur Highway near Bulihan junction. Approx. 0.8 m wide and 12 cm deep. High risk to motorists; DPWH corridor.',
  '2026-10-19 10:15:00'
);

INSERT INTO `report_duplicate_comparisons` (
  `comparison_id`, `candidate_report_id`, `existing_report_id`, `reviewer_user_id`,
  `separation_meters`, `outcome`, `comparison_reason`, `created_at`
) VALUES (
  1, 1, 10, 3,
  38.0, 'KeepDistinct',
  'Different carriageways and site photos along MacArthur Highway. Retain 0842 as distinct; do not link it to 0819.',
  '2026-10-19 10:10:00'
);

-- 11. REPAIR ASSIGNMENTS & REPAIR COMPLETIONS
INSERT INTO `repair_assignments` (
  `assignment_id`, `report_id`, `team_id`, `lead_user_id`, `assigned_by_user_id`,
  `assignment_priority`, `target_completion_at`, `instructions_to_team`,
  `accepted_by_lead_at`, `work_started_at`, `is_active`, `created_at`
) VALUES
  (
    1, 1, 1, 4, 3,
    'High', '2026-10-21 17:00:00',
    'Prioritize MacArthur Highway northbound lane. Set up safety cones, notify traffic enforcers, and photograph site before and after repair.',
    '2026-10-19 10:36:00', '2026-10-20 08:10:00', 1, '2026-10-19 10:30:00'
  ),
  (
    2, 2, 2, 9, 3,
    'Medium', '2026-10-22 17:00:00',
    'Coordinate with Malolos traffic management during off-peak hours along Paseo del Congreso.',
    NULL, NULL, 1, '2026-10-19 10:05:00'
  ),
  (
    3, 12, 1, 4, 3,
    'Medium', '2026-10-22 17:00:00',
    'Inspect curb drainage before applying hot-mix asphalt patch on Blas Ople Diversion Road.',
    NULL, NULL, 1, '2026-10-18 11:00:00'
  ),
  (
    4, 3, 1, 4, 3,
    'High', '2026-10-21 17:00:00',
    'Full lane safety cone taper required along MacArthur Highway westbound approaching Tikay.',
    '2026-10-18 17:30:00', '2026-10-19 08:00:00', 1, '2026-10-18 17:00:00'
  );

INSERT INTO `repair_completions` (
  `completion_id`, `assignment_id`, `report_id`, `submitted_by_user_id`,
  `work_started_at`, `work_completed_at`, `submitted_for_review_at`,
  `repair_notes`, `materials_used`, `patch_dimensions`,
  `before_media_id`, `after_media_id`,
  `check_same_site`, `check_fully_filled_compacted`, `check_surface_flush_safe`, `check_notes_location_consistent`,
  `review_status`, `reviewed_by_user_id`, `admin_review_notes`, `reviewed_at`
) VALUES (
  1, 1, 1, 4,
  '2026-10-20 08:10:00', '2026-10-21 10:35:00', '2026-10-21 10:45:00',
  'Removed loose aggregate, dried base and placed hot-mix asphalt. Compacted a 1.2 × 1.0 m patch flush with the road. Site cleared; lane reopened.',
  'Hot-mix asphalt · 4 bags / approx. 200 kg', '1.2 × 1.0 m',
  2, 3,
  1, 1, 1, 1,
  'AwaitingApproval', 3,
  'Evidence matches the reported site on MacArthur Highway. Patch is level, compacted and clear of debris. Repair accepted for resolution.',
  '2026-10-21 11:20:00'
);

-- 12. IMMUTABLE REPORT STATUS HISTORY
INSERT INTO `report_status_history` (
  `history_id`, `report_id`, `actor_user_id`, `actor_display_name`,
  `previous_status`, `recorded_status`, `event_type`, `reason_or_evidence_note`, `occurred_at`
) VALUES
  (1,  1, 1, 'Mika Reyes',         NULL,           'Submitted',    'CITIZEN_SUBMISSION',   'Photo and road pin received on MacArthur Highway.',                                   '2026-10-19 09:24:00'),
  (2,  1, 3, 'Ana Dela Cruz',      'Submitted',    'Under Review', 'REVIEW_OPENED',        'Photo and location check opened.',                                                   '2026-10-19 09:31:00'),
  (3,  1, 3, 'Ana Dela Cruz',      'Under Review', 'Verified',     'REPORT_VERIFIED',      'High severity confirmed; 0819 distinct, 38 m opposite carriageway.',                 '2026-10-19 10:15:00'),
  (4,  1, 3, 'Ana Dela Cruz',      'Verified',     'Assigned',     'TEAM_ASSIGNED',        'Malolos Team Alpha · High priority · target 21 Oct, 5 PM.',                          '2026-10-19 10:30:00'),
  (5,  1, 4, 'Engr. Paolo Santos', 'Assigned',     'Assigned',     'ASSIGNMENT_ACCEPTED',  'Assignment accepted; no work-start change.',                                         '2026-10-19 10:36:00'),
  (6,  1, 4, 'Engr. Paolo Santos', 'Assigned',     'Assigned',     'BEFORE_PHOTO_LOGGED',  'Before photo and inspection recorded.',                                              '2026-10-20 08:05:00'),
  (7,  1, 4, 'Engr. Paolo Santos', 'Assigned',     'In Progress',  'REPAIR_STARTED',       'Safety checks complete; repair started.',                                            '2026-10-20 08:10:00'),
  (8,  1, 4, 'Engr. Paolo Santos', 'In Progress',  'In Progress',  'WORK_COMPLETED_FIELD', 'Work completed; 1.2 × 1 m patch; 4 bags / ~200 kg asphalt.',                         '2026-10-21 10:35:00'),
  (9,  1, 4, 'Engr. Paolo Santos', 'In Progress',  'In Progress',  'COMPLETION_SUBMITTED', 'Completion evidence submitted for admin review.',                                    '2026-10-21 10:45:00'),
  (10, 1, 3, 'Ana Dela Cruz',      'In Progress',  'Resolved',     'REPAIR_APPROVED',      'Evidence accepted. Patch level and compacted; lane reopened.',                       '2026-10-21 11:20:00');

-- 13. SYSTEM AUDIT LOGS SEED
INSERT INTO `system_audit_logs` (
  `workspace_id`, `actor_user_id`, `actor_name`, `actor_role`, `action_category`,
  `action_code`, `target_entity_type`, `target_entity_id`, `reason`, `ip_address`, `created_at`
) VALUES
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'WORKSPACE_SETTINGS', 'UPDATE_WORKSPACE_POLICY', 'workspace', 'MALOLOS-LGU-ENG', 'Confirmed 50m duplicate detection radius and 48h High SLA target for City of Malolos.', '127.0.0.1', '2026-10-21 08:00:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'REPORT_WORKFLOW',    'VERIFY_REPORT',           'report',    'RW-2026-0842', 'High severity confirmed; 0819 distinct, 38 m opposite carriageway on MacArthur Hwy.', '127.0.0.1', '2026-10-19 10:15:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'REPORT_WORKFLOW',    'ASSIGN_REPAIR_TEAM',      'report',    'RW-2026-0842', 'Assigned Malolos Team Alpha (Engr. Paolo Santos) with target 21 Oct 2026 5:00 PM.', '127.0.0.1', '2026-10-19 10:30:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'REPORT_WORKFLOW',    'APPROVE_REPAIR',          'report',    'RW-2026-0842', 'Evidence accepted. Patch level and compacted; lane reopened.', '127.0.0.1', '2026-10-21 11:20:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'DATA_EXPORT',        'EXPORT_CSV_PDF',          'export',    'EXP-MALOLOS-20261021-1202', 'Generated citywide CSV and PDF snapshot for City of Malolos (PII excluded).', '127.0.0.1', '2026-10-21 12:02:00');

-- 14. DATA EXPORTS SEED
INSERT INTO `data_exports` (
  `support_reference`, `workspace_id`, `requested_by_user_id`, `export_format`, `export_scope`,
  `include_citizen_pii`, `row_count`, `export_status`, `error_message`, `created_at`, `completed_at`
) VALUES
  ('EXP-MALOLOS-20261021-1202', 1, 3, 'BOTH', 'AllReports', 0, 1284, 'Completed', NULL, '2026-10-21 12:02:00', '2026-10-21 12:02:04'),
  ('EXP-MALOLOS-20261021-1203', 1, 3, 'CSV',  'AllReports', 0, 1284, 'Failed', 'The export service timed out before generation finished.', '2026-10-21 12:03:00', NULL);

-- 15. CITIZEN POST-REPAIR FEEDBACK SEED (FR-17)
INSERT INTO `report_feedback` (
  `feedback_id`, `report_id`, `citizen_user_id`, `rating`, `feedback_text`, `submitted_at`
) VALUES
  (1, 6, 2, 5, 'Quick response! The pothole on Capitol Compound Road was cleanly patched and the lane is now safe for tricycles and motorcycles.', '2026-10-18 18:30:00');
