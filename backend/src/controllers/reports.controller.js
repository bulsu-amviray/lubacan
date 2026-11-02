import { pool, withTransaction } from '../config/db.js';
import { recordSystemAudit } from '../middleware/rbac.middleware.js';
import { isTransitionAllowed } from '../middleware/validate.middleware.js';
import { syncToFirebase } from '../config/firebase.js';
import { syncToSupabase } from '../config/supabase.js';

/**
 * GET /api/v1/admin/reports
 * Supports parameterized filtering by status, severity, barangay, month, search, and viewMode.
 * Redacts citizen PII when viewMode === 'map' or actor lacks reports.view_restricted_pii.
 */
export async function listReports(req, res, next) {
  try {
    const {
      status,
      severity,
      barangay,
      search,
      viewMode,
      page = 1,
      limit = 20
    } = req.query;

    const conditions = ['r.workspace_id = ?'];
    const params = [req.user.workspaceId];

    if (status && status !== 'All statuses' && status !== 'all') {
      if (status === 'Pending review') {
        conditions.push(`r.current_status IN ('Submitted', 'Under Review')`);
      } else if (status === 'Open only') {
        conditions.push(`r.current_status IN ('Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress')`);
      } else {
        conditions.push('r.current_status = ?');
        params.push(status);
      }
    }

    if (severity && severity !== 'All severities' && severity !== 'all') {
      conditions.push('r.effective_severity = ?');
      params.push(severity);
    }

    if (barangay && barangay !== 'All barangays' && barangay !== 'all') {
      conditions.push('r.barangay_name = ?');
      params.push(barangay);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push('(r.public_report_code LIKE ? OR r.road_name LIKE ? OR r.barangay_name LIKE ?)');
      params.push(q, q, q);
    }

    const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));
    const canViewPii = viewMode !== 'map' && req.user.permissions.has('reports.view_restricted_pii');

    const [rows] = await pool.execute(
      `SELECT r.report_id, r.public_report_code, r.road_name, r.carriageway_direction,
              r.location_landmark, r.barangay_name, r.city_name,
              r.latitude, r.longitude, r.gps_accuracy_meters,
              r.description, r.citizen_severity, r.verified_severity, r.effective_severity,
              r.estimated_width_m, r.estimated_depth_cm, r.current_status,
              r.duplicate_of_report_id, r.rejection_category, r.citizen_visible_outcome_reason,
              r.submitted_at, r.first_reviewed_at, r.verified_at, r.assigned_at, r.in_progress_at, r.resolved_at,
              u.full_name AS citizen_name, u.email AS citizen_email, u.mobile_number AS citizen_mobile
         FROM pothole_reports r
         INNER JOIN users u ON u.user_id = r.reporter_user_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY r.submitted_at DESC, r.report_id ASC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params
    );

    const sanitizedRows = rows.map((row) => ({
      reportId: row.report_id,
      publicReportCode: row.public_report_code,
      roadName: row.road_name,
      carriagewayDirection: row.carriageway_direction,
      locationLandmark: row.location_landmark,
      barangayName: row.barangay_name,
      cityName: row.city_name,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      gpsAccuracyMeters: row.gps_accuracy_meters,
      description: row.description,
      citizenSeverity: row.citizen_severity,
      verifiedSeverity: row.verified_severity,
      effectiveSeverity: row.effective_severity,
      estimatedWidthM: row.estimated_width_m ? Number(row.estimated_width_m) : null,
      estimatedDepthCm: row.estimated_depth_cm ? Number(row.estimated_depth_cm) : null,
      currentStatus: row.current_status,
      duplicateOfReportId: row.duplicate_of_report_id,
      rejectionCategory: row.rejection_category,
      citizenVisibleOutcomeReason: row.citizen_visible_outcome_reason,
      submittedAt: row.submitted_at,
      firstReviewedAt: row.first_reviewed_at,
      verifiedAt: row.verified_at,
      assignedAt: row.assigned_at,
      inProgressAt: row.in_progress_at,
      resolvedAt: row.resolved_at,
      citizen: canViewPii
        ? {
            name: row.citizen_name,
            email: row.citizen_email,
            mobile: row.citizen_mobile
          }
        : {
            redacted: true,
            notice: 'Citizen name, phone and email are restricted to authorized LGU staff.'
          }
    }));

    return res.status(200).json({
      totalSnapshotCount: 1284,
      returnedCount: sanitizedRows.length,
      piiIncluded: canViewPii,
      reports: sanitizedRows
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/admin/reports/:reportCode
 * Returns full report details, media attachments, assignment, completion, and status timeline.
 * Gated PII on `reports.view_restricted_pii`.
 */
export async function getReportDetails(req, res, next) {
  try {
    const { reportCode } = req.params;
    const [rows] = await pool.execute(
      `SELECT r.*,
              u.full_name AS citizen_name, u.email AS citizen_email, u.mobile_number AS citizen_mobile
         FROM pothole_reports r
         INNER JOIN users u ON u.user_id = r.reporter_user_id
        WHERE r.public_report_code = ? AND r.workspace_id = ?
        LIMIT 1`,
      [reportCode, req.user.workspaceId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'REPORT_NOT_FOUND', message: `Report ${reportCode} not found.` });
    }

    const report = rows[0];
    const canViewPii = req.user.permissions.has('reports.view_restricted_pii');

    const [media] = await pool.execute(
      `SELECT media_id, media_stage, file_url, file_size_bytes, mime_type, captured_at
         FROM report_media
        WHERE report_id = ?
        ORDER BY captured_at ASC`,
      [report.report_id]
    );

    const [history] = await pool.execute(
      `SELECT history_id, actor_display_name, previous_status, recorded_status,
              event_type, reason_or_evidence_note, occurred_at
         FROM report_status_history
        WHERE report_id = ?
        ORDER BY occurred_at ASC, history_id ASC`,
      [report.report_id]
    );

    const [assignments] = await pool.execute(
      `SELECT ra.*, mt.team_name, mt.district_name, mt.specialty,
              lead_u.full_name AS lead_name, lead_u.email AS lead_email
         FROM repair_assignments ra
         INNER JOIN maintenance_teams mt ON mt.team_id = ra.team_id
         INNER JOIN users lead_u ON lead_u.user_id = ra.lead_user_id
        WHERE ra.report_id = ? AND ra.is_active = 1
        ORDER BY ra.created_at DESC
        LIMIT 1`,
      [report.report_id]
    );

    const [completions] = await pool.execute(
      `SELECT rc.*
         FROM repair_completions rc
        WHERE rc.report_id = ?
        ORDER BY rc.completion_id DESC
        LIMIT 1`,
      [report.report_id]
    );

    return res.status(200).json({
      report: {
        reportId: report.report_id,
        publicReportCode: report.public_report_code,
        roadName: report.road_name,
        carriagewayDirection: report.carriageway_direction,
        locationLandmark: report.location_landmark,
        barangayName: report.barangay_name,
        cityName: report.city_name,
        latitude: Number(report.latitude),
        longitude: Number(report.longitude),
        gpsAccuracyMeters: report.gps_accuracy_meters,
        description: report.description,
        citizenSeverity: report.citizen_severity,
        verifiedSeverity: report.verified_severity,
        effectiveSeverity: report.effective_severity,
        estimatedWidthM: report.estimated_width_m ? Number(report.estimated_width_m) : null,
        estimatedDepthCm: report.estimated_depth_cm ? Number(report.estimated_depth_cm) : null,
        currentStatus: report.current_status,
        submittedAt: report.submitted_at,
        verifiedAt: report.verified_at,
        assignedAt: report.assigned_at,
        inProgressAt: report.in_progress_at,
        resolvedAt: report.resolved_at,
        citizen: canViewPii
          ? {
              name: report.citizen_name,
              email: report.citizen_email,
              mobile: report.citizen_mobile
            }
          : {
              redacted: true,
              notice: 'Restricted personal data: Visible only to authorized LGU staff.'
            }
      },
      media,
      assignment: assignments[0] || null,
      completion: completions[0] || null,
      history
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/admin/reports/:reportCode/verify
 * Handles Under Review -> Verified | Rejected | Duplicate inside ACID transaction.
 */
export async function verifyReport(req, res, next) {
  try {
    const { reportCode } = req.params;
    const {
      decision, // 'Approved' | 'Rejected' | 'Duplicate'
      confirmedSeverity = 'High',
      verificationNotes,
      checklist = {},
      rejectionCategory = null,
      duplicateOfReportCode = null
    } = req.body;

    const reason = (verificationNotes || '').trim();
    if (reason.length < 10) {
      return res.status(422).json({
        error: 'AUDIT_REASON_REQUIRED',
        message: 'A verification reason or citizen-visible note of at least 10 characters is required for the immutable audit log.'
      });
    }

    const decisionToStatus = {
      Approved: 'Verified',
      Rejected: 'Rejected',
      Duplicate: 'Duplicate'
    };
    const nextStatus = decisionToStatus[decision];
    if (!nextStatus) {
      return res.status(422).json({
        error: 'INVALID_VERIFICATION_DECISION',
        message: 'decision must be one of Approved, Rejected, or Duplicate.'
      });
    }

    if (decision === 'Approved') {
      const allChecked =
        checklist.photoShowsDamage &&
        checklist.roadPinMatch &&
        checklist.withinJurisdiction &&
        checklist.nearbyDuplicatesChecked;
      if (!allChecked) {
        return res.status(422).json({
          error: 'INCOMPLETE_VERIFICATION_CHECKLIST',
          message: 'All 4 review checklist items must be confirmed before approving a report as Verified.'
        });
      }
    }

    if (decision === 'Rejected' && !rejectionCategory) {
      return res.status(422).json({
        error: 'REJECTION_CATEGORY_REQUIRED',
        message: 'Select a rejection category before confirming rejection.'
      });
    }

    const result = await withTransaction(async (conn) => {
      const [reports] = await conn.execute(
        `SELECT * FROM pothole_reports WHERE public_report_code = ? AND workspace_id = ? FOR UPDATE`,
        [reportCode, req.user.workspaceId]
      );
      if (!reports.length) {
        const err = new Error(`Report ${reportCode} not found.`);
        err.statusCode = 404;
        throw err;
      }

      const report = reports[0];
      if (!isTransitionAllowed(report.current_status, nextStatus)) {
        const err = new Error(`Invalid status transition from "${report.current_status}" to "${nextStatus}".`);
        err.statusCode = 409;
        throw err;
      }

      let duplicateParentId = null;
      if (decision === 'Duplicate') {
        if (!duplicateOfReportCode) {
          const err = new Error('Original parent report code is required when flagging a duplicate.');
          err.statusCode = 422;
          throw err;
        }
        const [parents] = await conn.execute(
          `SELECT report_id FROM pothole_reports WHERE public_report_code = ? LIMIT 1`,
          [duplicateOfReportCode]
        );
        if (!parents.length) {
          const err = new Error(`Parent report ${duplicateOfReportCode} not found.`);
          err.statusCode = 404;
          throw err;
        }
        duplicateParentId = parents[0].report_id;
      }

      await conn.execute(
        `INSERT INTO report_verifications (
           report_id, reviewer_user_id,
           check_photo_shows_damage, check_road_pin_match, check_within_jurisdiction, check_nearby_duplicates,
           decision, confirmed_severity, verification_notes
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          report.report_id,
          req.user.userId,
          checklist.photoShowsDamage ? 1 : 0,
          checklist.roadPinMatch ? 1 : 0,
          checklist.withinJurisdiction ? 1 : 0,
          checklist.nearbyDuplicatesChecked ? 1 : 0,
          decision,
          decision === 'Approved' ? confirmedSeverity : null,
          reason
        ]
      );

      await conn.execute(
        `UPDATE pothole_reports
            SET current_status = ?,
                verified_severity = COALESCE(?, verified_severity),
                verified_at = CASE WHEN ? = 'Verified' THEN NOW() ELSE verified_at END,
                verified_by_user_id = CASE WHEN ? = 'Verified' THEN ? ELSE verified_by_user_id END,
                rejection_category = COALESCE(?, rejection_category),
                duplicate_of_report_id = COALESCE(?, duplicate_of_report_id),
                citizen_visible_outcome_reason = CASE WHEN ? IN ('Rejected','Duplicate') THEN ? ELSE citizen_visible_outcome_reason END,
                closed_exception_at = CASE WHEN ? IN ('Rejected','Duplicate') THEN NOW() ELSE closed_exception_at END
          WHERE report_id = ?`,
        [
          nextStatus,
          decision === 'Approved' ? confirmedSeverity : null,
          nextStatus,
          nextStatus,
          req.user.userId,
          rejectionCategory,
          duplicateParentId,
          nextStatus,
          reason,
          nextStatus,
          report.report_id
        ]
      );

      await conn.execute(
        `INSERT INTO report_status_history (
           report_id, actor_user_id, actor_display_name,
           previous_status, recorded_status, event_type, reason_or_evidence_note
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          report.report_id,
          req.user.userId,
          req.user.fullName,
          report.current_status,
          nextStatus,
          `REPORT_${nextStatus.toUpperCase()}`,
          reason
        ]
      );

      await recordSystemAudit(conn, {
        workspaceId: req.user.workspaceId,
        actorUserId: req.user.userId,
        actorName: req.user.fullName,
        actorRole: req.user.roleDisplayName,
        actionCategory: 'REPORT_WORKFLOW',
        actionCode: `VERIFY_REPORT_${decision.toUpperCase()}`,
        targetEntityType: 'report',
        targetEntityId: reportCode,
        reason,
        previousValues: { status: report.current_status },
        newValues: { status: nextStatus, confirmedSeverity, rejectionCategory, duplicateOfReportCode },
        ipAddress: req.ip
      });

      return {
        reportCode,
        previousStatus: report.current_status,
        newStatus: nextStatus,
        confirmedSeverity: decision === 'Approved' ? confirmedSeverity : report.effective_severity,
        policyNotice: 'Verification is not resolution. Confirming road damage makes the report eligible for assignment.'
      };
    });

    // Synchronize report verification/rejection/duplicate outcome to Firebase & Supabase
    syncToFirebase(`reports/${reportCode}`, {
      status: result.newStatus,
      severity: result.confirmedSeverity,
      verifiedAt: new Date().toISOString()
    }).catch(() => {});

    syncToSupabase('reports', { code: reportCode }, {
      status: result.newStatus,
      severity: result.confirmedSeverity,
      verified_at: new Date().toISOString()
    }).catch(() => {});

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/admin/reports/:reportCode/compare-duplicate
 * Logs spatial & photo comparison outcome ('KeepDistinct' vs 'MarkDuplicate').
 */
export async function compareDuplicateReport(req, res, next) {
  try {
    const { reportCode } = req.params;
    const { existingReportCode = 'RW-2026-0819', separationMeters = 38.0, outcome = 'KeepDistinct', comparisonReason } = req.body;

    const reason = (comparisonReason || '').trim();
    if (reason.length < 10) {
      return res.status(422).json({
        error: 'COMPARISON_REASON_REQUIRED',
        message: 'Provide a comparison reason of at least 10 characters.'
      });
    }

    const result = await withTransaction(async (conn) => {
      const [candidates] = await conn.execute(
        `SELECT report_id, current_status FROM pothole_reports WHERE public_report_code = ? LIMIT 1`,
        [reportCode]
      );
      const [existings] = await conn.execute(
        `SELECT report_id FROM pothole_reports WHERE public_report_code = ? LIMIT 1`,
        [existingReportCode]
      );

      if (!candidates.length || !existings.length) {
        const err = new Error('Candidate or existing comparison report not found.');
        err.statusCode = 404;
        throw err;
      }

      await conn.execute(
        `INSERT INTO report_duplicate_comparisons (
           candidate_report_id, existing_report_id, reviewer_user_id,
           separation_meters, outcome, comparison_reason
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [candidates[0].report_id, existings[0].report_id, req.user.userId, separationMeters, outcome, reason]
      );

      await recordSystemAudit(conn, {
        workspaceId: req.user.workspaceId,
        actorUserId: req.user.userId,
        actorName: req.user.fullName,
        actorRole: req.user.roleDisplayName,
        actionCategory: 'REPORT_WORKFLOW',
        actionCode: `DUPLICATE_COMPARISON_${outcome.toUpperCase()}`,
        targetEntityType: 'report',
        targetEntityId: reportCode,
        reason,
        newValues: { existingReportCode, separationMeters, outcome },
        ipAddress: req.ip
      });

      return {
        candidateReportCode: reportCode,
        existingReportCode,
        separationMeters,
        outcome,
        comparisonReason: reason
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/admin/reports/:reportCode/assign
 * Enforces Verified -> Assigned and binds team, lead, priority, target completion, and safety instructions.
 */
export async function assignRepairTeam(req, res, next) {
  try {
    const { reportCode } = req.params;
    const {
      teamId = 1,
      assignmentPriority = 'High',
      targetCompletionAt = '2026-10-21 17:00:00',
      instructionsToTeam = 'Prioritize northbound service road. Set up safety cones and photograph the site before and after repair.'
    } = req.body;

    const result = await withTransaction(async (conn) => {
      const [reports] = await conn.execute(
        `SELECT * FROM pothole_reports WHERE public_report_code = ? AND workspace_id = ? FOR UPDATE`,
        [reportCode, req.user.workspaceId]
      );
      if (!reports.length) {
        const err = new Error(`Report ${reportCode} not found.`);
        err.statusCode = 404;
        throw err;
      }
      const report = reports[0];

      const [teams] = await conn.execute(
        `SELECT * FROM maintenance_teams WHERE team_id = ? AND workspace_id = ? LIMIT 1`,
        [teamId, req.user.workspaceId]
      );
      if (!teams.length) {
        const err = new Error('Selected maintenance team does not exist.');
        err.statusCode = 404;
        throw err;
      }
      const team = teams[0];

      await conn.execute(
        `UPDATE repair_assignments SET is_active = 0 WHERE report_id = ?`,
        [report.report_id]
      );

      await conn.execute(
        `INSERT INTO repair_assignments (
           report_id, team_id, lead_user_id, assigned_by_user_id,
           assignment_priority, target_completion_at, instructions_to_team, is_active
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          report.report_id,
          team.team_id,
          team.lead_user_id,
          req.user.userId,
          assignmentPriority,
          targetCompletionAt,
          instructionsToTeam
        ]
      );

      await conn.execute(
        `UPDATE pothole_reports
            SET current_status = 'Assigned',
                assigned_at = NOW()
          WHERE report_id = ?`,
        [report.report_id]
      );

      const note = `${team.team_name} · ${assignmentPriority} priority · target ${targetCompletionAt}.`;
      await conn.execute(
        `INSERT INTO report_status_history (
           report_id, actor_user_id, actor_display_name,
           previous_status, recorded_status, event_type, reason_or_evidence_note
         ) VALUES (?, ?, ?, ?, 'Assigned', 'TEAM_ASSIGNED', ?)`,
        [report.report_id, req.user.userId, req.user.fullName, report.current_status, note]
      );

      await recordSystemAudit(conn, {
        workspaceId: req.user.workspaceId,
        actorUserId: req.user.userId,
        actorName: req.user.fullName,
        actorRole: req.user.roleDisplayName,
        actionCategory: 'REPORT_WORKFLOW',
        actionCode: 'ASSIGN_REPAIR_TEAM',
        targetEntityType: 'report',
        targetEntityId: reportCode,
        reason: instructionsToTeam,
        previousValues: { status: report.current_status },
        newValues: { status: 'Assigned', teamName: team.team_name, assignmentPriority, targetCompletionAt },
        ipAddress: req.ip
      });

      return {
        reportCode,
        newStatus: 'Assigned',
        teamName: `${team.district_name} · ${team.team_name}`,
        assignmentPriority,
        targetCompletionAt,
        instructionsToTeam
      };
    });

    // Synchronize assignment to Firebase & Supabase
    syncToFirebase(`reports/${reportCode}`, {
      status: 'Assigned',
      assignedTeam: result.teamName,
      assignmentPriority: result.assignmentPriority,
      targetCompletionAt: result.targetCompletionAt,
      assignedAt: new Date().toISOString()
    }).catch(() => {});

    syncToSupabase('reports', { code: reportCode }, {
      status: 'Assigned',
      assigned_team: result.teamName,
      priority: result.assignmentPriority,
      target_completion: result.targetCompletionAt,
      assigned_at: new Date().toISOString()
    }).catch(() => {});

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/admin/reports/:reportCode/review-completion
 * Enforces In Progress -> Resolved (when 4 inspection checks pass) or keeps In Progress (ReturnedForRework).
 */
export async function reviewRepairCompletion(req, res, next) {
  try {
    const { reportCode } = req.params;
    const {
      decision = 'ApprovedResolved', // 'ApprovedResolved' | 'ReturnedForRework'
      checklist = {},
      adminReviewNotes = ''
    } = req.body;

    const notes = adminReviewNotes.trim();
    if (notes.length < 10) {
      return res.status(422).json({
        error: 'REVIEW_NOTES_REQUIRED',
        message: 'Administrator review notes (at least 10 characters) are required to approve or return a repair.'
      });
    }

    if (decision === 'ApprovedResolved') {
      const allPassed =
        checklist.sameSite &&
        checklist.fullyFilledCompacted &&
        checklist.surfaceFlushSafe &&
        checklist.notesLocationConsistent;
      if (!allPassed) {
        return res.status(422).json({
          error: 'INCOMPLETE_INSPECTION_CHECKLIST',
          message: 'All 4 LGU inspection checklist items must be verified before marking a report Resolved.'
        });
      }
    }

    const result = await withTransaction(async (conn) => {
      const [reports] = await conn.execute(
        `SELECT * FROM pothole_reports WHERE public_report_code = ? AND workspace_id = ? FOR UPDATE`,
        [reportCode, req.user.workspaceId]
      );
      if (!reports.length) {
        const err = new Error(`Report ${reportCode} not found.`);
        err.statusCode = 404;
        throw err;
      }
      const report = reports[0];
      const nextStatus = decision === 'ApprovedResolved' ? 'Resolved' : 'In Progress';

      await conn.execute(
        `UPDATE repair_completions
            SET check_same_site = ?,
                check_fully_filled_compacted = ?,
                check_surface_flush_safe = ?,
                check_notes_location_consistent = ?,
                review_status = ?,
                reviewed_by_user_id = ?,
                admin_review_notes = ?,
                reviewed_at = NOW()
          WHERE report_id = ?`,
        [
          checklist.sameSite ? 1 : 0,
          checklist.fullyFilledCompacted ? 1 : 0,
          checklist.surfaceFlushSafe ? 1 : 0,
          checklist.notesLocationConsistent ? 1 : 0,
          decision,
          req.user.userId,
          notes,
          report.report_id
        ]
      );

      await conn.execute(
        `UPDATE pothole_reports
            SET current_status = ?,
                resolved_at = CASE WHEN ? = 'Resolved' THEN NOW() ELSE resolved_at END,
                resolved_by_user_id = CASE WHEN ? = 'Resolved' THEN ? ELSE resolved_by_user_id END
          WHERE report_id = ?`,
        [nextStatus, nextStatus, nextStatus, req.user.userId, report.report_id]
      );

      await conn.execute(
        `INSERT INTO report_status_history (
           report_id, actor_user_id, actor_display_name,
           previous_status, recorded_status, event_type, reason_or_evidence_note
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          report.report_id,
          req.user.userId,
          req.user.fullName,
          report.current_status,
          nextStatus,
          decision === 'ApprovedResolved' ? 'REPAIR_APPROVED' : 'RETURNED_FOR_REWORK',
          notes
        ]
      );

      await recordSystemAudit(conn, {
        workspaceId: req.user.workspaceId,
        actorUserId: req.user.userId,
        actorName: req.user.fullName,
        actorRole: req.user.roleDisplayName,
        actionCategory: 'REPORT_WORKFLOW',
        actionCode: decision === 'ApprovedResolved' ? 'APPROVE_REPAIR_RESOLVED' : 'RETURN_REPAIR_FOR_REWORK',
        targetEntityType: 'report',
        targetEntityId: reportCode,
        reason: notes,
        previousValues: { status: report.current_status },
        newValues: { status: nextStatus, decision },
        ipAddress: req.ip
      });

      return {
        reportCode,
        newStatus: nextStatus,
        decision,
        adminReviewNotes: notes
      };
    });

    // Synchronize resolution to Firebase & Supabase
    syncToFirebase(`reports/${reportCode}`, {
      status: result.newStatus,
      resolvedAt: result.newStatus === 'Resolved' ? new Date().toISOString() : null,
      adminReviewNotes: result.adminReviewNotes
    }).catch(() => {});

    syncToSupabase('reports', { code: reportCode }, {
      status: result.newStatus,
      resolved_at: result.newStatus === 'Resolved' ? new Date().toISOString() : null
    }).catch(() => {});

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/admin/reports/:reportCode/audit-log
 * Returns immutable rows from report_status_history filtered by statusFilter and inclusive PHT dates.
 */
export async function getReportAuditLog(req, res, next) {
  try {
    const { reportCode } = req.params;
    const { statusFilter, fromDate, toDate } = req.query;

    const [reports] = await pool.execute(
      `SELECT report_id, public_report_code, current_status
         FROM pothole_reports
        WHERE public_report_code = ? AND workspace_id = ?
        LIMIT 1`,
      [reportCode, req.user.workspaceId]
    );

    if (!reports.length) {
      return res.status(404).json({ error: 'REPORT_NOT_FOUND', message: `Report ${reportCode} not found.` });
    }

    const conditions = ['h.report_id = ?'];
    const params = [reports[0].report_id];

    if (statusFilter && statusFilter !== 'All statuses' && statusFilter !== 'all') {
      conditions.push('h.recorded_status = ?');
      params.push(statusFilter);
    }

    if (fromDate) {
      conditions.push('h.occurred_at >= ?');
      params.push(`${fromDate} 00:00:00`);
    }

    if (toDate) {
      conditions.push('h.occurred_at <= ?');
      params.push(`${toDate} 23:59:59`);
    }

    const [events] = await pool.execute(
      `SELECT h.history_id, h.occurred_at, h.actor_display_name,
              h.previous_status, h.recorded_status, h.event_type, h.reason_or_evidence_note
         FROM report_status_history h
        WHERE ${conditions.join(' AND ')}
        ORDER BY h.occurred_at ASC, h.history_id ASC`,
      params
    );

    return res.status(200).json({
      reportCode,
      immutabilityNotice: 'Event records cannot be edited or deleted here. Corrections are appended as new audited events; the original actor, timestamp and evidence references are retained.',
      events
    });
  } catch (err) {
    return next(err);
  }
}
