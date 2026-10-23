SET NAMES utf8mb4;
SET time_zone = '+08:00';
USE `luba_canfindit`;

-- 1. WORKSPACE SEED (Quezon City Engineering Department)
INSERT INTO `workspaces` (
  `workspace_id`, `workspace_code`, `lgu_name`, `department_name`, `public_hotline`,
  `timezone`, `duplicate_radius_meters`, `sla_high_hours`, `sla_medium_days`, `sla_low_days`,
  `require_photo`, `require_admin_verification_before_resolution`, `enable_nearby_duplicate_checks`,
  `notify_citizen_status_change`, `request_post_repair_feedback`, `send_email_update_digest`,
  `created_at`, `updated_at`
) VALUES (
  1, 'QC-LGU-ENG', 'Quezon City', 'City Engineering Department', '122',
  'Asia/Manila', 50, 48, 5, 14,
  1, 1, 1, 1, 1, 0,
  '2026-05-01 08:00:00', '2026-10-21 08:00:00'
);

-- 2. ROLES (5 Roles from Phase 3.2)
INSERT INTO `roles` (`role_id`, `role_slug`, `role_display_name`, `is_staff_role`, `grants_admin_console`, `description`) VALUES
  (1, 'lgu_admin', 'LGU administrator', 1, 1, 'Full Quezon City LGU operations, verification, assignment, user access, and workspace policy control.'),
  (2, 'lgu_reviewer', 'LGU reviewer', 1, 1, 'Reviews incoming citizen reports, checks duplicates, and confirms damage severity.'),
  (3, 'maintenance_lead', 'Maintenance lead', 1, 0, 'Supervises field repair crew, accepts assigned tasks, and submits repair completion evidence.'),
  (4, 'maintenance_crew', 'Maintenance crew', 1, 0, 'Executes field asphalt/concrete repair operations under a maintenance lead.'),
  (5, 'citizen', 'Citizen', 0, 0, 'Submits road damage reports and receives lifecycle status updates.');

-- 3. PERMISSIONS (15 Granular Permission Keys)
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

-- 4. BARANGAYS
INSERT INTO `barangays` (`barangay_id`, `workspace_id`, `barangay_name`, `district_name`, `center_lat`, `center_lng`) VALUES
  (1, 1, 'Batasan Hills', 'QC North',   14.6978000, 121.0881000),
  (2, 1, 'Central',       'QC Central', 14.6515000, 121.0493000),
  (3, 1, 'Cubao',         'QC East',    14.6195000, 121.0537000),
  (4, 1, 'Holy Spirit',   'QC North',   14.6812000, 121.0764000),
  (5, 1, 'Vasra',         'QC Central', 14.6579000, 121.0428000),
  (6, 1, 'Novaliches',    'QC North',   14.7224000, 121.0401000),
  (7, 1, 'Project 4',     'QC East',    14.6228000, 121.0695000),
  (8, 1, 'Fairview',      'QC North',   14.7131000, 121.0642000),
  (9, 1, 'Diliman',       'QC Central', 14.6538000, 121.0685000);

-- 5. ROAD CORRIDORS
INSERT INTO `road_corridors` (`corridor_id`, `workspace_id`, `road_name`, `primary_barangay_id`, `is_high_traffic`) VALUES
  (1, 1, 'Commonwealth Avenue', 1, 1),
  (2, 1, 'Batasan Road',        1, 1),
  (3, 1, 'Aurora Boulevard',    3, 1),
  (4, 1, 'Elliptical Road',     2, 1),
  (5, 1, 'Visayas Avenue',      5, 1),
  (6, 1, 'Quirino Highway',     6, 1);

-- 6. USERS (Matches "Admin · User management.png" & "Admin · Maintenance team details.png")
INSERT INTO `users` (
  `user_id`, `workspace_id`, `role_id`, `full_name`, `email`, `mobile_number`,
  `password_hash`, `department_or_area`, `barangay_id`, `account_status`, `is_email_verified`, `created_at`
) VALUES
  (1,  1, 5, 'Mika Reyes',          'mika.reyes@example.com',       '+63 917 000 0184', '$2b$10$demoHashCitizenMikaReyes0000000000000000000000000', 'Batasan Hills',    1, 'Active',  1, '2026-10-01 09:00:00'),
  (2,  1, 5, 'Luis Mendoza',        'luis.mendoza@example.com',     '+63 917 000 0192', '$2b$10$demoHashCitizenLuisMendoza00000000000000000000000', 'Central',          2, 'Active',  1, '2026-10-02 10:15:00'),
  (3,  1, 1, 'Ana Dela Cruz',       'ana.delacruz@example.com',     '+63 917 000 0101', '$2b$10$demoHashAdminAnaDelaCruz0000000000000000000000000', 'City Engineering', 2, 'Active',  1, '2026-05-01 08:00:00'),
  (4,  1, 3, 'Engr. Paolo Santos',  'paolo.santos@example.com',     '+63 917 000 0210', '$2b$10$demoHashLeadPaoloSantos00000000000000000000000000', 'QC North · Alpha', 1, 'Active',  1, '2026-05-10 08:00:00'),
  (5,  1, 5, 'Bea Navarro',         'bea.navarro@example.com',      '+63 917 000 0234', '$2b$10$demoHashCitizenBeaNavarro000000000000000000000000', 'Cubao',            3, 'Active',  1, '2026-10-04 11:30:00'),
  (6,  1, 4, 'Carlo Ramos',         'carlo.ramos@example.com',      '+63 917 000 0245', '$2b$10$demoHashCrewCarloRamos000000000000000000000000000', 'QC North · Bravo', 6, 'Active',  1, '2026-06-01 08:00:00'),
  (7,  1, 5, 'Ina Villanueva',      'ina.villanueva@example.com',   '+63 917 000 0256', '$2b$10$demoHashCitizenInaVillanueva000000000000000000000', 'Holy Spirit',      4, 'Active',  1, '2026-10-05 14:20:00'),
  (8,  1, 2, 'Marco Lim',           'marco.lim@example.com',        '+63 917 000 0267', NULL,                                                        'City Engineering', 2, 'Invited', 0, '2026-10-18 09:00:00'),
  (9,  1, 3, 'Engr. Jessa Aquino',  'jessa.aquino@example.com',     '+63 917 000 0211', '$2b$10$demoHashLeadJessaAquino00000000000000000000000000', 'QC North · Bravo', 6, 'Active',  1, '2026-05-10 08:00:00'),
  (10, 1, 3, 'Engr. Adrian Flores', 'adrian.flores@example.com',    '+63 917 000 0212', '$2b$10$demoHashLeadAdrianFlores0000000000000000000000000', 'QC Central · Charlie', 2, 'Active', 1, '2026-05-10 08:00:00'),
  (11, 1, 3, 'Engr. Nica Bautista', 'nica.bautista@example.com',    '+63 917 000 0213', '$2b$10$demoHashLeadNicaBautista0000000000000000000000000', 'QC East · Delta',  3, 'Active',  1, '2026-05-10 08:00:00'),
  (12, 1, 4, 'Rico Villanueva',     'rico.villanueva@example.com',  '+63 917 000 0301', '$2b$10$demoHashCrewRicoVillanueva00000000000000000000000', 'QC North · Alpha', 1, 'Active',  1, '2026-06-01 08:00:00'),
  (13, 1, 4, 'Mariel Garcia',       'mariel.garcia@example.com',    '+63 917 000 0302', '$2b$10$demoHashCrewMarielGarcia0000000000000000000000000', 'QC North · Alpha', 1, 'Active',  1, '2026-06-01 08:00:00'),
  (14, 1, 4, 'Jun Mendoza',         'jun.mendoza@example.com',      '+63 917 000 0303', '$2b$10$demoHashCrewJunMendoza000000000000000000000000000', 'QC North · Alpha', 1, 'Active',  1, '2026-06-01 08:00:00'),
  (15, 1, 4, 'Liza Bautista',       'liza.bautista@example.com',    '+63 917 000 0304', '$2b$10$demoHashCrewLizaBautista0000000000000000000000000', 'QC North · Alpha', 1, 'Active',  1, '2026-06-01 08:00:00');

-- Notification preferences for Ana Dela Cruz ("Admin · Administrator profile.png")
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

-- 7. MAINTENANCE TEAMS ("Admin · Maintenance team management.png")
INSERT INTO `maintenance_teams` (
  `team_id`, `workspace_id`, `team_code`, `district_name`, `team_name`, `lead_user_id`,
  `service_area_description`, `specialty`, `service_hours`, `team_status`
) VALUES
  (1, 1, 'QC-NORTH-ALPHA',   'QC North',   'Team Alpha',   4,  'Batasan Hills / Commonwealth', 'Asphalt patching', '7:00 AM–4:00 PM PHT', 'Active'),
  (2, 1, 'QC-NORTH-BRAVO',   'QC North',   'Team Bravo',   9,  'Novaliches / Fairview',        'Road resurfacing', '7:00 AM–4:00 PM PHT', 'Active'),
  (3, 1, 'QC-CENTRAL-CHARLIE','QC Central','Team Charlie', 10, 'Central / Diliman',            'Concrete repair',  '7:00 AM–4:00 PM PHT', 'Active'),
  (4, 1, 'QC-EAST-DELTA',    'QC East',    'Team Delta',   11, 'Cubao / Project 4',            'Asphalt patching', '7:00 AM–4:00 PM PHT', 'Active');

-- Team Alpha Crew ("Admin · Maintenance team details.png")
INSERT INTO `team_members` (`team_id`, `user_id`, `member_role`, `specialty`, `availability_status`) VALUES
  (1, 4,  'Lead', 'Asphalt patching',   'On duty'),
  (1, 12, 'Crew', 'Asphalt placement',  'On duty'),
  (1, 13, 'Crew', 'Traffic safety',     'On duty'),
  (1, 14, 'Crew', 'Compactor operator', 'On duty'),
  (1, 15, 'Crew', 'Site preparation',   'On duty'),
  (2, 9,  'Lead', 'Road resurfacing',   'On duty'),
  (2, 6,  'Crew', 'Asphalt placement',  'On duty'),
  (3, 10, 'Lead', 'Concrete repair',    'On duty'),
  (4, 11, 'Lead', 'Asphalt patching',   'On duty');

-- 8. POTHOLE REPORTS (Matches all Figma screens & tables)
INSERT INTO `pothole_reports` (
  `report_id`, `public_report_code`, `workspace_id`, `reporter_user_id`, `corridor_id`,
  `road_name`, `carriageway_direction`, `location_landmark`, `barangay_id`, `barangay_name`, `city_name`,
  `latitude`, `longitude`, `gps_accuracy_meters`, `description`,
  `citizen_severity`, `verified_severity`, `estimated_width_m`, `estimated_depth_cm`,
  `current_status`, `duplicate_of_report_id`, `rejection_category`, `citizen_visible_outcome_reason`,
  `submitted_at`, `first_reviewed_at`, `verified_at`, `verified_by_user_id`,
  `assigned_at`, `in_progress_at`, `resolved_at`, `resolved_by_user_id`, `closed_exception_at`
) VALUES
  (
    1, 'RW-2026-0842', 1, 1, 1,
    'Commonwealth Avenue', 'Northbound', 'Northbound service road, near IBP Road, Brgy. Batasan Hills, Quezon City', 1, 'Batasan Hills', 'Quezon City',
    14.6978000, 121.0881000, 8,
    'Deep pothole on the northbound service road near IBP Road. Motorcycles are swerving around it; water collects after rain.',
    'High', 'High', 0.80, 12.0,
    'Under Review', NULL, NULL, NULL,
    '2026-10-19 09:24:00', '2026-10-19 09:31:00', '2026-10-19 10:15:00', 3,
    '2026-10-19 10:30:00', '2026-10-20 08:10:00', NULL, NULL, NULL
  ),
  (
    2, 'RW-2026-0841', 1, 2, 4,
    'Elliptical Road', 'Outer Ring', 'Near Quezon Memorial Circle East Gate, Brgy. Central, Quezon City', 2, 'Central', 'Quezon City',
    14.6515000, 121.0493000, 6,
    'Medium surface depression along the outer lane near East Avenue approach.',
    'Medium', 'Medium', 0.55, 7.5,
    'Assigned', NULL, NULL, NULL,
    '2026-10-19 08:40:00', '2026-10-19 09:10:00', '2026-10-19 09:45:00', 3,
    '2026-10-19 10:05:00', NULL, NULL, NULL, NULL
  ),
  (
    3, 'RW-2026-0840', 1, 1, 2,
    'Batasan Road', 'Westbound', 'Westbound lane approaching Batasan-San Mateo intersection, Brgy. Batasan Hills', 1, 'Batasan Hills', 'Quezon City',
    14.6942000, 121.0915000, 9,
    'Severe asphalt crater on Batasan Road westbound lane causing heavy slowdowns.',
    'High', 'High', 0.95, 14.0,
    'In Progress', NULL, NULL, NULL,
    '2026-10-18 15:20:00', '2026-10-18 16:00:00', '2026-10-18 16:30:00', 3,
    '2026-10-18 17:00:00', '2026-10-19 08:00:00', NULL, NULL, NULL
  ),
  (
    4, 'RW-2026-0839', 1, 5, 3,
    'Aurora Boulevard', 'Eastbound', 'Near Anonas LRT Station, Brgy. Cubao, Quezon City', 3, 'Cubao', 'Quezon City',
    14.6221000, 121.0612000, 7,
    'Shallow surface wear along the curb lane near pedestrian crossing.',
    'Low', 'Low', 0.35, 4.0,
    'Verified', NULL, NULL, NULL,
    '2026-10-18 13:10:00', '2026-10-18 14:00:00', '2026-10-18 14:25:00', 3,
    NULL, NULL, NULL, NULL, NULL
  ),
  (
    5, 'RW-2026-0838', 1, 7, 1,
    'Commonwealth Avenue', 'Southbound', 'Near Don Antonio footbridge, Brgy. Holy Spirit, Quezon City', 4, 'Holy Spirit', 'Quezon City',
    14.6812000, 121.0764000, 10,
    'Cracked asphalt patch reopening along the middle lane.',
    'Medium', NULL, 0.50, 6.5,
    'Submitted', NULL, NULL, NULL,
    '2026-10-18 11:05:00', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL
  ),
  (
    6, 'RW-2026-0837', 1, 2, 5,
    'Visayas Avenue', 'Northbound', 'Near Department of Agriculture gate, Brgy. Vasra, Quezon City', 5, 'Vasra', 'Quezon City',
    14.6579000, 121.0428000, 6,
    'Pothole near the intersection crosswalk repaired and compacted.',
    'Medium', 'Medium', 0.60, 8.0,
    'Resolved', NULL, NULL, NULL,
    '2026-10-17 10:12:00', '2026-10-17 11:00:00', '2026-10-17 11:30:00', 3,
    '2026-10-17 13:00:00', '2026-10-18 07:30:00', '2026-10-18 16:40:00', 3, NULL
  ),
  (
    7, 'RW-2026-0836', 1, 5, 6,
    'Quirino Highway', 'Northbound', 'Near Novaliches Proper boundary, Quezon City', 6, 'Novaliches', 'Quezon City',
    14.7224000, 121.0401000, 12,
    'Submitted photo was taken on a private commercial parking driveway outside LGU road maintenance scope.',
    'High', NULL, NULL, NULL,
    'Rejected', NULL, 'Private property / non-LGU road', 'The reported surface is inside a private commercial lot off Quirino Highway.',
    '2026-10-17 09:00:00', '2026-10-17 10:15:00', NULL, NULL,
    NULL, NULL, NULL, NULL, '2026-10-17 10:30:00'
  ),
  (
    8, 'RW-2026-0826', 1, 5, 3,
    'Aurora Boulevard', 'Eastbound', 'Near JP Rizal intersection, Brgy. Project 4, Quezon City', 7, 'Project 4', 'Quezon City',
    14.6228000, 121.0695000, 6,
    'Primary report for Aurora Boulevard Project 4 pothole currently in progress.',
    'High', 'High', 0.75, 11.0,
    'In Progress', NULL, NULL, NULL,
    '2026-10-16 14:00:00', '2026-10-16 15:00:00', '2026-10-16 15:30:00', 3,
    '2026-10-16 16:00:00', '2026-10-17 08:00:00', NULL, NULL, NULL
  ),
  (
    9, 'RW-2026-0835', 1, 7, 3,
    'Aurora Boulevard', 'Eastbound', 'Aurora Boulevard, Project 4 (12 m from RW-2026-0826)', 7, 'Project 4', 'Quezon City',
    14.6228500, 121.0695800, 8,
    'Duplicate citizen report of the same pothole on Aurora Boulevard, Project 4.',
    'Low', NULL, NULL, NULL,
    'Duplicate', 8, NULL, 'The same pothole is already tracked in RW-2026-0826. Your report has been linked so you can follow its repair updates.',
    '2026-10-17 08:15:00', '2026-10-17 09:20:00', NULL, NULL,
    NULL, NULL, NULL, NULL, '2026-10-17 09:35:00'
  ),
  (
    10, 'RW-2026-0819', 1, 2, 1,
    'Commonwealth Avenue', 'Southbound', 'Opposite carriageway near IBP Road, Brgy. Batasan Hills, Quezon City', 1, 'Batasan Hills', 'Quezon City',
    14.6980000, 121.0884000, 7,
    'Southbound carriageway pothole 38 m opposite RW-2026-0842.',
    'High', 'High', 0.70, 10.5,
    'Assigned', NULL, NULL, NULL,
    '2026-10-18 16:10:00', '2026-10-18 16:40:00', '2026-10-18 17:05:00', 3,
    '2026-10-18 17:30:00', NULL, NULL, NULL, NULL
  ),
  (
    11, 'RW-2026-0844', 1, 2, NULL,
    'Marcos Highway', 'Eastbound', 'Marcos Highway, Marikina City', 7, 'Marikina boundary', 'Marikina City',
    14.6202000, 121.0951000, 15,
    'Pothole reported along Marcos Highway inside Marikina City jurisdiction.',
    'Medium', NULL, NULL, NULL,
    'Under Review', NULL, 'Outside Quezon City jurisdiction',
    'The submitted location is on Marcos Highway in Marikina City, outside this Quezon City workspace. The blurred photo also does not clearly show the damage. Please report through the relevant LGU''s official channel with clear evidence taken safely.',
    '2026-10-19 11:00:00', '2026-10-19 11:15:00', NULL, NULL,
    NULL, NULL, NULL, NULL, NULL
  ),
  (
    12, 'RW-2026-0828', 1, 1, 2,
    'Batasan Road', 'Eastbound', 'Near Sandiganbayan tunnel exit, Brgy. Batasan Hills', 1, 'Batasan Hills', 'Quezon City',
    14.6921000, 121.0894000, 8,
    'Edge spalling along Batasan Road eastbound.',
    'Medium', 'Medium', 0.50, 7.0,
    'Assigned', NULL, NULL, NULL,
    '2026-10-18 09:00:00', '2026-10-18 09:45:00', '2026-10-18 10:15:00', 3,
    '2026-10-18 11:00:00', NULL, NULL, NULL, NULL
  ),
  (
    13, 'RW-2026-0798', 1, 1, 2,
    'Batasan Road', 'Northbound', 'Batasan Hills Elementary School frontage', 1, 'Batasan Hills', 'Quezon City',
    14.6955000, 121.0902000, 7,
    'Pothole near school zone pedestrian lane.',
    'Medium', 'Medium', 0.45, 6.0,
    'Resolved', NULL, NULL, NULL,
    '2026-10-12 08:30:00', '2026-10-12 09:15:00', '2026-10-12 09:45:00', 3,
    '2026-10-12 10:30:00', '2026-10-13 08:00:00', '2026-10-14 15:20:00', 3, NULL
  ),
  (
    14, 'RW-2026-0771', 1, 1, 3,
    'Aurora Boulevard', 'Westbound', 'Near Katipunan flyover approach', 7, 'Project 4', 'Quezon City',
    14.6305000, 121.0731000, 8,
    'Asphalt rutting along westbound inner lane.',
    'High', 'High', 0.85, 11.5,
    'In Progress', NULL, NULL, NULL,
    '2026-10-10 14:15:00', '2026-10-10 15:00:00', '2026-10-10 15:40:00', 3,
    '2026-10-10 16:15:00', '2026-10-11 08:30:00', NULL, NULL, NULL
  ),
  (
    15, 'RW-2026-0723', 1, 1, 4,
    'Elliptical Road', 'Outer Ring', 'Near Maharlika Street junction', 2, 'Central', 'Quezon City',
    14.6502000, 121.0504000, 6,
    'Surface cavity near bus stop bay.',
    'Low', 'Low', 0.40, 5.0,
    'Resolved', NULL, NULL, NULL,
    '2026-10-05 07:45:00', '2026-10-05 08:30:00', '2026-10-05 09:00:00', 3,
    '2026-10-05 10:00:00', '2026-10-06 08:00:00', '2026-10-07 14:10:00', 3, NULL
  );

-- 9. REPORT MEDIA ("Admin · Report details.png", "Admin · Repair completion review.png")
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
  'Location confirmed near IBP Road. Approx. 0.8 m wide and 12 cm deep. High risk to motorcycles; prioritize repair.',
  '2026-10-19 10:15:00'
);

INSERT INTO `report_duplicate_comparisons` (
  `comparison_id`, `candidate_report_id`, `existing_report_id`, `reviewer_user_id`,
  `separation_meters`, `outcome`, `comparison_reason`, `created_at`
) VALUES (
  1, 1, 10, 3,
  38.0, 'KeepDistinct',
  'Different carriageways and site photos. Retain 0842 as distinct; do not link it to 0819.',
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
    'Prioritize northbound service road. Set up safety cones and photograph the site before and after repair.',
    '2026-10-19 10:36:00', '2026-10-20 08:10:00', 1, '2026-10-19 10:30:00'
  ),
  (
    2, 2, 1, 4, 3,
    'Medium', '2026-10-22 17:00:00',
    'Coordinate with QC traffic enforcers during off-peak hours.',
    NULL, NULL, 1, '2026-10-19 10:05:00'
  ),
  (
    3, 12, 1, 4, 3,
    'Medium', '2026-10-22 17:00:00',
    'Inspect curb drainage before applying hot-mix asphalt patch.',
    NULL, NULL, 1, '2026-10-18 11:00:00'
  ),
  (
    4, 3, 2, 9, 3,
    'High', '2026-10-21 17:00:00',
    'Full lane safety cone taper required along Batasan Road.',
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
  'Evidence matches the reported site. Patch is level, compacted and clear of debris. Repair accepted for resolution.',
  '2026-10-21 11:20:00'
);

-- 12. IMMUTABLE REPORT STATUS HISTORY (Exact 10 rows from "Admin · Report status history and audit log.png")
INSERT INTO `report_status_history` (
  `history_id`, `report_id`, `actor_user_id`, `actor_display_name`,
  `previous_status`, `recorded_status`, `event_type`, `reason_or_evidence_note`, `occurred_at`
) VALUES
  (1,  1, 1, 'Mika Reyes',         NULL,           'Submitted',    'CITIZEN_SUBMISSION',   'Photo and road pin received.',                                                       '2026-10-19 09:24:00'),
  (2,  1, 3, 'Ana Dela Cruz',      'Submitted',    'Under Review', 'REVIEW_OPENED',        'Photo and location check opened.',                                                   '2026-10-19 09:31:00'),
  (3,  1, 3, 'Ana Dela Cruz',      'Under Review', 'Verified',     'REPORT_VERIFIED',      'High severity confirmed; 0819 distinct, 38 m opposite carriageway.',                 '2026-10-19 10:15:00'),
  (4,  1, 3, 'Ana Dela Cruz',      'Verified',     'Assigned',     'TEAM_ASSIGNED',        'Team Alpha · High priority · target 21 Oct, 5 PM.',                                  '2026-10-19 10:30:00'),
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
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'WORKSPACE_SETTINGS', 'UPDATE_WORKSPACE_POLICY', 'workspace', 'QC-LGU-ENG', 'Confirmed 50m duplicate detection radius and 48h High SLA target.', '127.0.0.1', '2026-10-21 08:00:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'REPORT_WORKFLOW',    'VERIFY_REPORT',           'report',    'RW-2026-0842', 'High severity confirmed; 0819 distinct, 38 m opposite carriageway.', '127.0.0.1', '2026-10-19 10:15:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'REPORT_WORKFLOW',    'ASSIGN_REPAIR_TEAM',      'report',    'RW-2026-0842', 'Assigned QC North · Team Alpha (Engr. Paolo Santos) with target 21 Oct 2026 5:00 PM.', '127.0.0.1', '2026-10-19 10:30:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'REPORT_WORKFLOW',    'APPROVE_REPAIR',          'report',    'RW-2026-0842', 'Evidence accepted. Patch level and compacted; lane reopened.', '127.0.0.1', '2026-10-21 11:20:00'),
  (1, 3, 'Ana Dela Cruz', 'LGU administrator', 'DATA_EXPORT',        'EXPORT_CSV_PDF',          'export',    'EXP-QC-20261021-1202', 'Generated citywide CSV and PDF snapshot (PII excluded).', '127.0.0.1', '2026-10-21 12:02:00');

-- 14. DATA EXPORTS SEED ("Admin · Export generation error.png" & "Admin · Export success.png")
INSERT INTO `data_exports` (
  `support_reference`, `workspace_id`, `requested_by_user_id`, `export_format`, `export_scope`,
  `include_citizen_pii`, `row_count`, `export_status`, `error_message`, `created_at`, `completed_at`
) VALUES
  ('EXP-QC-20261021-1202', 1, 3, 'BOTH', 'AllReports', 0, 1284, 'Completed', NULL, '2026-10-21 12:02:00', '2026-10-21 12:02:04'),
  ('EXP-QC-20261021-1203', 1, 3, 'CSV',  'AllReports', 0, 1284, 'Failed', 'The export service timed out before generation finished.', '2026-10-21 12:03:00', NULL);
