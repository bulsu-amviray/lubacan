SET NAMES utf8mb4;
SET time_zone = '+08:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `luba_canfindit`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `luba_canfindit`;

-- Drop existing tables if re-running schema setup
DROP TRIGGER IF EXISTS `trg_prevent_report_history_update`;
DROP TRIGGER IF EXISTS `trg_prevent_report_history_delete`;
DROP TRIGGER IF EXISTS `trg_prevent_system_audit_update`;
DROP TRIGGER IF EXISTS `trg_prevent_system_audit_delete`;

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

-- 1. WORKSPACES & LGU JURISDICTION SETTINGS ("Admin · Workspace settings.png")
CREATE TABLE `workspaces` (
  `workspace_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_code` VARCHAR(32) NOT NULL,
  `lgu_name` VARCHAR(120) NOT NULL DEFAULT 'Quezon City',
  `department_name` VARCHAR(160) NOT NULL DEFAULT 'City Engineering Department',
  `public_hotline` VARCHAR(32) NOT NULL DEFAULT '122',
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
  `updated_by_user_id` BIGINT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`workspace_id`),
  UNIQUE KEY `uk_workspaces_code` (`workspace_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RBAC ROLES & PERMISSIONS ("Admin · User management.png")
CREATE TABLE `roles` (
  `role_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_slug` VARCHAR(40) NOT NULL COMMENT 'lgu_admin, lgu_reviewer, maintenance_lead, maintenance_crew, citizen',
  `role_display_name` VARCHAR(80) NOT NULL,
  `is_staff_role` TINYINT(1) NOT NULL DEFAULT 0,
  `grants_admin_console` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uk_roles_slug` (`role_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `permission_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `permission_key` VARCHAR(80) NOT NULL,
  `module_name` VARCHAR(40) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `uk_permissions_key` (`permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` TINYINT UNSIGNED NOT NULL,
  `permission_id` SMALLINT UNSIGNED NOT NULL,
  `granted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BARANGAYS & ROAD CORRIDORS ("Admin · Pothole map.png", "Admin · Analytics and exports.png")
CREATE TABLE `barangays` (
  `barangay_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `barangay_name` VARCHAR(100) NOT NULL,
  `district_name` VARCHAR(60) NOT NULL,
  `center_lat` DECIMAL(10,7) NULL,
  `center_lng` DECIMAL(10,7) NULL,
  PRIMARY KEY (`barangay_id`),
  UNIQUE KEY `uk_barangay_workspace_name` (`workspace_id`, `barangay_name`),
  KEY `idx_barangay_district` (`district_name`),
  CONSTRAINT `fk_barangay_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `road_corridors` (
  `corridor_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `road_name` VARCHAR(140) NOT NULL,
  `primary_barangay_id` SMALLINT UNSIGNED NULL,
  `is_high_traffic` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`corridor_id`),
  UNIQUE KEY `uk_corridor_workspace_road` (`workspace_id`, `road_name`),
  CONSTRAINT `fk_corridor_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`),
  CONSTRAINT `fk_corridor_barangay` FOREIGN KEY (`primary_barangay_id`) REFERENCES `barangays` (`barangay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. USERS, PREFERENCES, INVITATIONS & SESSIONS ("Admin · User details and account management.png")
CREATE TABLE `users` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `role_id` TINYINT UNSIGNED NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `mobile_number` VARCHAR(24) NULL COMMENT 'Format: +63 9XX XXX XXXX',
  `password_hash` VARCHAR(255) NULL COMMENT 'Bcrypt hash (NULL while status = Invited)',
  `department_or_area` VARCHAR(120) NULL,
  `barangay_id` SMALLINT UNSIGNED NULL,
  `account_status` ENUM('Active', 'Suspended', 'Invited') NOT NULL DEFAULT 'Active',
  `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `last_status_reason` TEXT NULL,
  `last_status_changed_by` BIGINT UNSIGNED NULL,
  `last_status_changed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role_status` (`role_id`, `account_status`),
  KEY `idx_users_name` (`full_name`),
  CONSTRAINT `fk_users_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `fk_users_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`barangay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_notification_preferences` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `review_queue_alerts` TINYINT(1) NOT NULL DEFAULT 1,
  `completion_review_alerts` TINYINT(1) NOT NULL DEFAULT 1,
  `daily_email_summary` TINYINT(1) NOT NULL DEFAULT 0,
  `signin_security_notices` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Locked to 1 by security policy',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_unp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_invitations` (
  `invitation_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `invited_by_user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` TINYINT UNSIGNED NOT NULL,
  `team_id` INT UNSIGNED NULL,
  `token_hash` CHAR(64) NOT NULL,
  `send_to_work_email` TINYINT(1) NOT NULL DEFAULT 1,
  `expires_at` DATETIME NOT NULL COMMENT 'Expires 7 days after creation',
  `accepted_at` DATETIME NULL,
  `revoked_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invitation_id`),
  UNIQUE KEY `uk_invitations_token` (`token_hash`),
  CONSTRAINT `fk_inv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_actor` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_inv_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_sessions` (
  `session_id` CHAR(36) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `refresh_token_hash` CHAR(64) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `idx_sessions_user_active` (`user_id`, `revoked_at`, `expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MAINTENANCE TEAMS & PERSONNEL ("Admin · Maintenance team details.png")
CREATE TABLE `maintenance_teams` (
  `team_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `team_code` VARCHAR(32) NOT NULL,
  `district_name` VARCHAR(60) NOT NULL,
  `team_name` VARCHAR(80) NOT NULL,
  `lead_user_id` BIGINT UNSIGNED NOT NULL,
  `service_area_description` VARCHAR(160) NOT NULL,
  `specialty` VARCHAR(100) NOT NULL,
  `service_hours` VARCHAR(60) NOT NULL DEFAULT '7:00 AM–4:00 PM PHT',
  `team_status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `uk_teams_code` (`team_code`),
  CONSTRAINT `fk_teams_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`),
  CONSTRAINT `fk_teams_lead` FOREIGN KEY (`lead_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `team_members` (
  `team_member_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_id` INT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `member_role` ENUM('Lead', 'Crew') NOT NULL DEFAULT 'Crew',
  `specialty` VARCHAR(100) NOT NULL DEFAULT 'General road maintenance',
  `availability_status` ENUM('On duty', 'Unavailable', 'On leave') NOT NULL DEFAULT 'On duty',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_member_id`),
  UNIQUE KEY `uk_team_user` (`team_id`, `user_id`),
  CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `maintenance_teams` (`team_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. POTHOLE REPORTS & WORKFLOW ENTITIES ("Admin · Report details.png", "Admin · Verification review.png")
CREATE TABLE `pothole_reports` (
  `report_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `public_report_code` VARCHAR(24) NOT NULL COMMENT 'e.g., RW-2026-0842',
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `reporter_user_id` BIGINT UNSIGNED NOT NULL,
  `corridor_id` INT UNSIGNED NULL,
  `road_name` VARCHAR(140) NOT NULL,
  `carriageway_direction` VARCHAR(60) NULL,
  `location_landmark` VARCHAR(220) NOT NULL,
  `barangay_id` SMALLINT UNSIGNED NULL,
  `barangay_name` VARCHAR(100) NOT NULL,
  `city_name` VARCHAR(100) NOT NULL DEFAULT 'Quezon City',
  `latitude` DECIMAL(10,7) NOT NULL,
  `longitude` DECIMAL(10,7) NOT NULL,
  `gps_accuracy_meters` SMALLINT UNSIGNED NOT NULL DEFAULT 8,
  `description` TEXT NOT NULL,
  `citizen_severity` ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  `verified_severity` ENUM('Low', 'Medium', 'High') NULL,
  `effective_severity` ENUM('Low', 'Medium', 'High') GENERATED ALWAYS AS (COALESCE(`verified_severity`, `citizen_severity`)) STORED,
  `estimated_width_m` DECIMAL(4,2) NULL,
  `estimated_depth_cm` DECIMAL(5,1) NULL,
  `current_status` ENUM(
    'Submitted', 'Under Review', 'Verified', 'Assigned',
    'In Progress', 'Resolved', 'Rejected', 'Duplicate'
  ) NOT NULL DEFAULT 'Submitted',
  `duplicate_of_report_id` BIGINT UNSIGNED NULL,
  `rejection_category` VARCHAR(120) NULL,
  `citizen_visible_outcome_reason` TEXT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `first_reviewed_at` DATETIME NULL,
  `verified_at` DATETIME NULL,
  `verified_by_user_id` BIGINT UNSIGNED NULL,
  `assigned_at` DATETIME NULL,
  `in_progress_at` DATETIME NULL,
  `resolved_at` DATETIME NULL,
  `resolved_by_user_id` BIGINT UNSIGNED NULL,
  `closed_exception_at` DATETIME NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `uk_reports_public_code` (`public_report_code`),
  KEY `idx_reports_status_submitted` (`current_status`, `submitted_at`),
  KEY `idx_reports_severity_status` (`effective_severity`, `current_status`),
  KEY `idx_reports_barangay_status` (`barangay_id`, `current_status`),
  CONSTRAINT `fk_reports_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_reports_corridor` FOREIGN KEY (`corridor_id`) REFERENCES `road_corridors` (`corridor_id`),
  CONSTRAINT `fk_reports_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`barangay_id`),
  CONSTRAINT `fk_reports_duplicate_parent` FOREIGN KEY (`duplicate_of_report_id`) REFERENCES `pothole_reports` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `report_media` (
  `media_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` BIGINT UNSIGNED NOT NULL,
  `uploaded_by_user_id` BIGINT UNSIGNED NOT NULL,
  `media_stage` ENUM('CitizenSubmission', 'BeforeRepair', 'AfterRepair') NOT NULL DEFAULT 'CitizenSubmission',
  `file_url` VARCHAR(255) NOT NULL,
  `file_size_bytes` INT UNSIGNED NOT NULL DEFAULT 2516582,
  `mime_type` VARCHAR(60) NOT NULL DEFAULT 'image/jpeg',
  `captured_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`media_id`),
  KEY `idx_media_report_stage` (`report_id`, `media_stage`),
  CONSTRAINT `fk_media_report` FOREIGN KEY (`report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `report_verifications` (
  `verification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` BIGINT UNSIGNED NOT NULL,
  `reviewer_user_id` BIGINT UNSIGNED NOT NULL,
  `check_photo_shows_damage` TINYINT(1) NOT NULL DEFAULT 0,
  `check_road_pin_match` TINYINT(1) NOT NULL DEFAULT 0,
  `check_within_jurisdiction` TINYINT(1) NOT NULL DEFAULT 0,
  `check_nearby_duplicates` TINYINT(1) NOT NULL DEFAULT 0,
  `compared_nearby_report_id` BIGINT UNSIGNED NULL,
  `decision` ENUM('Approved', 'Rejected', 'Duplicate') NOT NULL,
  `confirmed_severity` ENUM('Low', 'Medium', 'High') NULL,
  `verification_notes` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`verification_id`),
  CONSTRAINT `fk_ver_report` FOREIGN KEY (`report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ver_reviewer` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `report_duplicate_comparisons` (
  `comparison_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `candidate_report_id` BIGINT UNSIGNED NOT NULL,
  `existing_report_id` BIGINT UNSIGNED NOT NULL,
  `reviewer_user_id` BIGINT UNSIGNED NOT NULL,
  `separation_meters` DECIMAL(6,1) NOT NULL,
  `outcome` ENUM('KeepDistinct', 'MarkDuplicate') NOT NULL,
  `comparison_reason` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comparison_id`),
  CONSTRAINT `fk_comp_candidate` FOREIGN KEY (`candidate_report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comp_existing` FOREIGN KEY (`existing_report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comp_reviewer` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `repair_assignments` (
  `assignment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` BIGINT UNSIGNED NOT NULL,
  `team_id` INT UNSIGNED NOT NULL,
  `lead_user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Explicitly bound lead; protected against silent reassignment',
  `assigned_by_user_id` BIGINT UNSIGNED NOT NULL,
  `assignment_priority` ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'High' COMMENT 'Editable priority is separate from verified damage severity',
  `target_completion_at` DATETIME NOT NULL,
  `instructions_to_team` TEXT NULL,
  `accepted_by_lead_at` DATETIME NULL,
  `work_started_at` DATETIME NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  CONSTRAINT `fk_assign_report` FOREIGN KEY (`report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assign_team` FOREIGN KEY (`team_id`) REFERENCES `maintenance_teams` (`team_id`),
  CONSTRAINT `fk_assign_lead` FOREIGN KEY (`lead_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_assign_admin` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `repair_completions` (
  `completion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assignment_id` BIGINT UNSIGNED NOT NULL,
  `report_id` BIGINT UNSIGNED NOT NULL,
  `submitted_by_user_id` BIGINT UNSIGNED NOT NULL,
  `work_started_at` DATETIME NOT NULL,
  `work_completed_at` DATETIME NOT NULL,
  `submitted_for_review_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `repair_notes` TEXT NOT NULL,
  `materials_used` VARCHAR(220) NOT NULL,
  `patch_dimensions` VARCHAR(60) NULL,
  `before_media_id` BIGINT UNSIGNED NULL,
  `after_media_id` BIGINT UNSIGNED NULL,
  `check_same_site` TINYINT(1) NOT NULL DEFAULT 0,
  `check_fully_filled_compacted` TINYINT(1) NOT NULL DEFAULT 0,
  `check_surface_flush_safe` TINYINT(1) NOT NULL DEFAULT 0,
  `check_notes_location_consistent` TINYINT(1) NOT NULL DEFAULT 0,
  `review_status` ENUM('AwaitingApproval', 'ApprovedResolved', 'ReturnedForRework') NOT NULL DEFAULT 'AwaitingApproval',
  `reviewed_by_user_id` BIGINT UNSIGNED NULL,
  `admin_review_notes` TEXT NULL,
  `reviewed_at` DATETIME NULL,
  PRIMARY KEY (`completion_id`),
  CONSTRAINT `fk_comp_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `repair_assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comp_report` FOREIGN KEY (`report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. IMMUTABLE AUDIT LOG TABLES ("Admin · Report status history and audit log.png")
CREATE TABLE `report_status_history` (
  `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` BIGINT UNSIGNED NOT NULL,
  `actor_user_id` BIGINT UNSIGNED NOT NULL,
  `actor_display_name` VARCHAR(120) NOT NULL,
  `previous_status` ENUM('Submitted','Under Review','Verified','Assigned','In Progress','Resolved','Rejected','Duplicate') NULL,
  `recorded_status` ENUM('Submitted','Under Review','Verified','Assigned','In Progress','Resolved','Rejected','Duplicate') NOT NULL,
  `event_type` VARCHAR(60) NOT NULL,
  `reason_or_evidence_note` TEXT NOT NULL,
  `occurred_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_rsh_report_time` (`report_id`, `occurred_at`),
  CONSTRAINT `fk_rsh_report` FOREIGN KEY (`report_id`) REFERENCES `pothole_reports` (`report_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rsh_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `system_audit_logs` (
  `audit_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `actor_user_id` BIGINT UNSIGNED NOT NULL,
  `actor_name` VARCHAR(120) NOT NULL,
  `actor_role` VARCHAR(80) NOT NULL,
  `action_category` ENUM('REPORT_WORKFLOW', 'TEAM_PERSONNEL', 'USER_ACCESS', 'DATA_EXPORT', 'WORKSPACE_SETTINGS', 'AUTH_SECURITY') NOT NULL,
  `action_code` VARCHAR(80) NOT NULL,
  `target_entity_type` VARCHAR(40) NOT NULL,
  `target_entity_id` VARCHAR(64) NOT NULL,
  `reason` TEXT NULL,
  `previous_values_json` JSON NULL,
  `new_values_json` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_audit_workspace_time` (`workspace_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. DATA EXPORTS LOG ("Admin · Export CSV or PDF dialog.png")
CREATE TABLE `data_exports` (
  `export_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `support_reference` VARCHAR(40) NOT NULL COMMENT 'e.g., EXP-QC-20261021-1203',
  `workspace_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `requested_by_user_id` BIGINT UNSIGNED NOT NULL,
  `export_format` ENUM('CSV', 'PDF', 'BOTH') NOT NULL DEFAULT 'CSV',
  `export_scope` ENUM('CurrentFilters', 'AllReports') NOT NULL DEFAULT 'AllReports',
  `include_citizen_pii` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Personal data excluded by default',
  `row_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `export_status` ENUM('Pending', 'Completed', 'Failed') NOT NULL DEFAULT 'Pending',
  `error_message` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`export_id`),
  UNIQUE KEY `uk_exports_support_ref` (`support_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. APPEND-ONLY IMMUTABILITY TRIGGERS
DELIMITER $$

CREATE TRIGGER `trg_prevent_report_history_update`
BEFORE UPDATE ON `report_status_history`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'SECURITY_VIOLATION: report_status_history is immutable and append-only.';
END$$

CREATE TRIGGER `trg_prevent_report_history_delete`
BEFORE DELETE ON `report_status_history`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'SECURITY_VIOLATION: report_status_history records cannot be deleted.';
END$$

CREATE TRIGGER `trg_prevent_system_audit_update`
BEFORE UPDATE ON `system_audit_logs`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'SECURITY_VIOLATION: system_audit_logs is immutable and append-only.';
END$$

CREATE TRIGGER `trg_prevent_system_audit_delete`
BEFORE DELETE ON `system_audit_logs`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'SECURITY_VIOLATION: system_audit_logs records cannot be deleted.';
END$$

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
