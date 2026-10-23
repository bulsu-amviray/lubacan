# LUBA CanFindIT · Mandatory Development & Visual Reference Rules

## 1. Always Reference the 26 Stored Figma PNG Images During Development
Every time the system is being developed, updated, debugged, or extended:
1. **Inspect the Stored Reference Image First**: Before creating or modifying any view, modal, component, table, form, or workflow state, you **MUST** view the corresponding stored `.png` image in `c:\xampp\htdocs\LUBACanFindIT\design-specs\` (or the workspace root `c:\xampp\htdocs\LUBACanFindIT\`) using `view_file`.
2. **Cross-Reference with the Master Blueprint**: Pair the visual inspection of the `.png` screen with `LUBA_CanFindIT_Master_Blueprint.md` so all colors (`luba.*` tokens), typography (`Inter`), spacing (`236px` sidebar, `80px` topbar, `1200px` max content width), exact copy, PHT timestamps, and validation rules match the stored image 1:1.

## 2. Screen-to-Image Mapping (All 26 Stored Reference Images)

| Screen # | View / Modal Key | Stored Reference Image Path (`design-specs/` & Root) |
| :--- | :--- | :--- |
| 1 | `overview` | `Admin · Operations overview.png` |
| 2 | `reports_list` | `Admin · Reports management.png` |
| 3 | `report_details` | `Admin · Report details.png` |
| 4 | `verification_review` | `Admin · Verification review.png` |
| 5 | `approve_report_modal` | `Admin · Approve report confirmation.png` |
| 6 | `reject_report_modal` | `Admin · Reject report confirmation.png` |
| 7 | `duplicate_outcome_modal` | `Admin · Rejection and duplicate outcome dialog.png` |
| 8 | `duplicate_comparison` | `Admin · Duplicate report comparison.png` |
| 9 | `team_assignment_modal` | `Admin · Team assignment modal.png` |
| 10 | `assignment_confirmed` | `Admin · Assignment review and confirmation.png` |
| 11 | `repair_completion` | `Admin · Repair completion review.png` |
| 12 | `report_audit_log` | `Admin · Report status history and audit log.png` |
| 13 | `pothole_map` | `Admin · Pothole map.png` |
| 14 | `teams_list` | `Admin · Maintenance team management.png` |
| 15 | `team_details` | `Admin · Maintenance team details.png` |
| 16 | `add_personnel` | `Admin · Add maintenance personnel.png` |
| 17 | `edit_personnel` | `Admin · Edit maintenance personnel.png` |
| 18 | `users_list` | `Admin · User management.png` |
| 19 | `user_details` | `Admin · User details and account management.png` |
| 20 | `analytics` | `Admin · Analytics and exports.png` |
| 21 | `date_range_modal` | `Admin · Date-range filters.png` |
| 22 | `export_dialog_modal` | `Admin · Export CSV or PDF dialog.png` |
| 23 | `export_error_modal` | `Admin · Export generation error.png` |
| 24 | `export_success_modal` | `Admin · Export success.png` |
| 25 | `admin_profile` | `Admin · Administrator profile.png` |
| 26 | `workspace_settings` | `Admin · Workspace settings.png` |

## 3. Locked Architectural & Visual Invariants
- **Production Map**: Keep the self-contained SVG Vector Schematic Map (`renderSchematicMap`) matching the illustrative QC map in Screens 1, 3, 4, 8, and 13.
- **Direct Local CSV Export**: Keep `Content-Disposition: attachment` and client-side `triggerLocalCsvDownload()` so exports download directly to the user's local machine with citizen PII excluded by default.
- **Immutable Audit Logs**: Never remove or bypass the 4 MySQL `BEFORE UPDATE` / `BEFORE DELETE` triggers on `report_status_history` and `system_audit_logs`.
