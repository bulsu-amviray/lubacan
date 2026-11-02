-- ============================================================================
-- LUBA CanFindIT · InfinityFree MySQL Database Import
-- Tailored for InfinityFree phpMyAdmin (No 'CREATE DATABASE' / 'USE' commands)
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+08:00';
SET FOREIGN_KEY_CHECKS = 0;

-- 1. DROP EXISTING TABLES (Clean Slate)
DROP TABLE IF EXISTS `data_exports`;
DROP TABLE IF EXISTS `system_audit_logs`;
DROP TABLE IF EXISTS `report_status_history`;
DROP TABLE IF EXISTS `repair_completions`;
DROP TABLE IF EXISTS `repair_assignments`;
DROP TABLE IF EXISTS `report_duplicate_comparisons`;
DROP TABLE IF EXISTS `report_verifications`;
DROP TABLE IF EXISTS `report_media`;
DROP TABLE IF EXISTS `pothole_reports`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `maintenance_teams`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `user_invitations`;
DROP TABLE IF EXISTS `user_notification_preferences`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `road_corridors`;
DROP TABLE IF EXISTS `barangays`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `workspaces`;

-- 2. CREATE TABLES
CREATE TABLE `workspaces` (
  `workspace_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_code` VARCHAR(32) NOT NULL,
  `lgu_name` VARCHAR(120) NOT NULL DEFAULT 'City of Malolos, Bulacan',
  `department_name` VARCHAR(160) NOT NULL DEFAULT 'City Engineering Office, City of Malolos',
  `public_hotline` VARCHAR(32) NOT NULL DEFAULT '0000-000-0000',
  `timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Manila',
  `duplicate_radius_meters` SMALLINT UNSIGNED NOT NULL DEFAULT 50,
  `sla_high_hours` SMALLINT UNSIGNED NOT NULL DEFAULT 48,
  `sla_medium_days` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `sla_low_days` TINYINT UNSIGNED NOT NULL DEFAULT 14,
  `require_photo` TINYINT(1) NOT NULL DEFAULT 1,
  `require_admin_verification_before_resolution` TINYINT(1) NOT NULL DEFAULT 1,
  `enable_nearby_duplicate_checks` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_citizen_status_change` TINYINT(1) NOT NULL DEFAULT 1,
  `request_post_repair_feedback` TINYINT(1) NOT NULL DEFAULT 1,
  `send_email_update_digest` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`workspace_id`),
  UNIQUE KEY `uk_workspaces_code` (`workspace_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `role_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_slug` VARCHAR(32) NOT NULL,
  `role_display_name` VARCHAR(64) NOT NULL,
  `is_staff_role` TINYINT(1) NOT NULL DEFAULT 0,
  `grants_admin_console` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uk_roles_slug` (`role_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `permission_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `permission_key` VARCHAR(64) NOT NULL,
  `module_name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `uk_permissions_key` (`permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` TINYINT UNSIGNED NOT NULL,
  `permission_id` SMALLINT UNSIGNED NOT NULL,
  `granted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `barangays` (
  `barangay_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `barangay_name` VARCHAR(64) NOT NULL,
  `district_cluster` VARCHAR(48) NOT NULL,
  `is_priority_corridor` TINYINT(1) NOT NULL DEFAULT 0,
  `center_latitude` DECIMAL(10, 7) NOT NULL,
  `center_longitude` DECIMAL(10, 7) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`barangay_id`),
  UNIQUE KEY `uk_barangay_workspace_name` (`workspace_id`, `barangay_name`),
  CONSTRAINT `fk_barangays_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `road_corridors` (
  `corridor_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `road_name` VARCHAR(120) NOT NULL,
  `jurisdiction_level` ENUM('City', 'DPWH-National', 'Barangay', 'Private') NOT NULL DEFAULT 'City',
  `dpwh_district_office` VARCHAR(120) NULL,
  `is_primary_arterial` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`corridor_id`),
  UNIQUE KEY `uk_corridor_workspace_road` (`workspace_id`, `road_name`),
  CONSTRAINT `fk_road_corridors_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `role_id` TINYINT UNSIGNED NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `mobile_number` VARCHAR(32) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `department_or_area` VARCHAR(120) NULL,
  `account_status` ENUM('Active', 'Invited', 'Suspended') NOT NULL DEFAULT 'Active',
  `status_reason` VARCHAR(255) NULL,
  `email_verified_at` DATETIME NULL,
  `avatar_url` VARCHAR(255) NULL,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_users_email` (`email`),
  CONSTRAINT `fk_users_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `maintenance_teams` (
  `team_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `team_code` VARCHAR(32) NOT NULL,
  `district_name` VARCHAR(80) NOT NULL,
  `team_name` VARCHAR(80) NOT NULL,
  `lead_user_id` BIGINT UNSIGNED NOT NULL,
  `service_area_description` VARCHAR(255) NOT NULL,
  `specialty` VARCHAR(120) NOT NULL DEFAULT 'Asphalt patching & concrete re-blocking',
  `service_hours` VARCHAR(48) NOT NULL DEFAULT '7:00 AM–4:00 PM PHT',
  `team_status` ENUM('Active', 'Inactive', 'On Leave') NOT NULL DEFAULT 'Active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `uk_teams_code` (`team_code`),
  CONSTRAINT `fk_teams_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teams_lead_user` FOREIGN KEY (`lead_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pothole_reports` (
  `report_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `public_report_code` VARCHAR(32) NOT NULL,
  `citizen_user_id` BIGINT UNSIGNED NULL,
  `citizen_raw_name` VARCHAR(120) NOT NULL,
  `citizen_raw_email` VARCHAR(160) NOT NULL,
  `citizen_raw_mobile` VARCHAR(32) NULL,
  `road_name` VARCHAR(160) NOT NULL,
  `barangay_name` VARCHAR(64) NOT NULL,
  `jurisdiction` ENUM('City', 'DPWH-National', 'Barangay', 'Private') NOT NULL DEFAULT 'City',
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `landmark` VARCHAR(255) NULL,
  `description` TEXT NOT NULL,
  `severity` ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  `current_status` ENUM('Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Duplicate', 'Forwarded to DPWH') NOT NULL DEFAULT 'Submitted',
  `priority` ENUM('High', 'Normal', 'Low') NOT NULL DEFAULT 'Normal',
  `target_completion_date` DATE NULL,
  `assigned_team_id` INT UNSIGNED NULL,
  `is_duplicate_of_report_id` BIGINT UNSIGNED NULL,
  `rejection_category` VARCHAR(64) NULL,
  `rejection_reason` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `uk_pothole_report_code` (`public_report_code`),
  CONSTRAINT `fk_reports_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_assigned_team` FOREIGN KEY (`assigned_team_id`) REFERENCES `maintenance_teams` (`team_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `report_media` (
  `media_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` BIGINT UNSIGNED NOT NULL,
  `media_stage` ENUM('Citizen Submission', 'Inspection', 'Pre-Repair', 'Post-Repair Completed') NOT NULL DEFAULT 'Citizen Submission',
  `file_url` VARCHAR(255) NOT NULL,
  `uploaded_by_user_id` BIGINT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`media_id`),
  CONSTRAINT `fk_media_report` FOREIGN KEY (`report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `report_status_history` (
  `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` BIGINT UNSIGNED NOT NULL,
  `actor_user_id` BIGINT UNSIGNED NULL,
  `actor_name_snapshot` VARCHAR(120) NOT NULL,
  `status_from` VARCHAR(48) NULL,
  `status_to` VARCHAR(48) NOT NULL,
  `stage_label` VARCHAR(64) NOT NULL,
  `internal_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  CONSTRAINT `fk_history_report` FOREIGN KEY (`report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `system_audit_logs` (
  `audit_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `actor_user_id` BIGINT UNSIGNED NULL,
  `actor_name` VARCHAR(120) NOT NULL,
  `actor_role` VARCHAR(48) NOT NULL,
  `action_type` VARCHAR(64) NOT NULL,
  `target_entity_type` VARCHAR(48) NOT NULL,
  `target_entity_id` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  CONSTRAINT `fk_audit_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. INSERT SEED DATA
INSERT INTO `workspaces` (`workspace_id`, `workspace_code`, `lgu_name`, `department_name`, `public_hotline`, `timezone`)
VALUES (1, 'MALOLOS-LGU-ENG', 'City of Malolos, Bulacan', 'City Engineering Office, City of Malolos', '0000-00-0000', 'Asia/Manila');

INSERT INTO `roles` (`role_id`, `role_slug`, `role_display_name`, `is_staff_role`, `grants_admin_console`, `description`) VALUES
  (1, 'lgu_admin', 'LGU administrator', 1, 1, 'Full City of Malolos LGU operations control.'),
  (2, 'lgu_reviewer', 'LGU reviewer', 1, 1, 'Reviews incoming citizen reports.'),
  (3, 'maintenance_lead', 'Maintenance lead', 1, 0, 'Supervises field repair crew.'),
  (4, 'maintenance_crew', 'Maintenance crew', 1, 0, 'Executes field asphalt/concrete repair operations.'),
  (5, 'citizen', 'Citizen', 0, 0, 'Submits road damage reports.');

INSERT INTO `permissions` (`permission_id`, `permission_key`, `module_name`, `description`) VALUES
  (1,  'overview.view', 'overview', 'View city road operations overview dashboard'),
  (2,  'analytics.view', 'analytics', 'View road performance analytics and KPI summaries'),
  (3,  'reports.view', 'reports', 'View pothole reports list and details'),
  (4,  'reports.verify', 'reports', 'Approve, reject, or flag duplicate citizen reports'),
  (5,  'reports.assign', 'reports', 'Assign verified reports to maintenance teams'),
  (6,  'repairs.submit', 'repairs', 'Submit repair completion evidence'),
  (7,  'repairs.approve', 'repairs', 'Mark reports Resolved'),
  (8,  'map.view', 'map', 'View citywide pothole map'),
  (9,  'teams.view', 'teams', 'View maintenance teams'),
  (10, 'teams.manage', 'teams', 'Create teams and edit assignments'),
  (11, 'users.view', 'users', 'View user directory'),
  (12, 'settings.manage', 'settings', 'Configure workspace settings');

INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `permission_id` FROM `permissions`;

-- Sample Malolos City Barangays
INSERT INTO `barangays` (`workspace_id`, `barangay_name`, `district_cluster`, `is_priority_corridor`, `center_latitude`, `center_longitude`) VALUES
  (1, 'Guinhawa', 'Highway / Commercial Corridor', 1, 14.8524000, 120.8168000),
  (1, 'Bulihan', 'Highway / Commercial Corridor', 1, 14.8625000, 120.8220000),
  (1, 'Tikay', 'Highway / Commercial Corridor', 1, 14.8475000, 120.8315000),
  (1, 'Catmon', 'Poblacion / Urban Core', 0, 14.8430000, 120.8115000),
  (1, 'San Vicente', 'Poblacion / Urban Core', 0, 14.8510000, 120.8140000),
  (1, 'Mabolo', 'Poblacion / Urban Core', 0, 14.8380000, 120.8120000);

-- Initial Users
INSERT INTO `users` (`user_id`, `workspace_id`, `role_id`, `full_name`, `email`, `mobile_number`, `password_hash`, `department_or_area`, `account_status`) VALUES
  (1, 1, 1, 'Ana Dela Cruz', 'ana.delacruz@malolos.gov.ph', '+63 917 000 0101', '$2b$10$w09lH3cM2cQJ35L1w4o0z.r0w4Qz4qE9iZ2pZ9lZ7yQ3w5e8r1t4y', 'City Engineering Office', 'Active'),
  (2, 1, 3, 'Engr. Paolo Santos', 'paolo.santos@malolos.gov.ph', '+63 917 000 0210', '$2b$10$w09lH3cM2cQJ35L1w4o0z.r0w4Qz4qE9iZ2pZ9lZ7yQ3w5e8r1t4y', 'Malolos Team Alpha', 'Active'),
  (3, 1, 3, 'Engr. Jessa Aquino', 'jessa.aquino@malolos.gov.ph', '+63 917 000 0211', '$2b$10$w09lH3cM2cQJ35L1w4o0z.r0w4Qz4qE9iZ2pZ9lZ7yQ3w5e8r1t4y', 'Malolos Team Bravo', 'Active'),
  (4, 1, 5, 'Mika Reyes', 'mika.reyes@malolos.gov.ph', '+63 917 000 0184', '$2b$10$w09lH3cM2cQJ35L1w4o0z.r0w4Qz4qE9iZ2pZ9lZ7yQ3w5e8r1t4y', 'Guinhawa', 'Active');

-- Initial Maintenance Teams
INSERT INTO `maintenance_teams` (`team_id`, `workspace_id`, `team_code`, `district_name`, `team_name`, `lead_user_id`, `service_area_description`, `specialty`, `team_status`) VALUES
  (1, 1, 'MALOLOS-ALPHA', 'Highway / Commercial Corridor', 'Malolos Team Alpha', 2, 'Highway / Commercial Corridor (Guinhawa / Bulihan / Tikay)', 'Asphalt patching & concrete re-blocking', 'Active'),
  (2, 1, 'MALOLOS-BRAVO', 'Poblacion / Rural', 'Malolos Team Bravo', 3, 'Poblacion / Rural (San Vicente / Mabolo / Catmon)', 'Drainage cover restoration & patching', 'Active');

SET FOREIGN_KEY_CHECKS = 1;
