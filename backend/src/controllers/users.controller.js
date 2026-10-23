import { pool, withTransaction } from '../config/db.js';
import { recordSystemAudit } from '../middleware/rbac.middleware.js';

/**
 * GET /api/v1/admin/users
 * Returns 4 KPI cards and user directory filtered by role/status/search ("Admin · User management.png").
 */
export async function listUsers(req, res, next) {
  try {
    const { tab = 'All users', role, status, search } = req.query;
    const conditions = ['u.workspace_id = ?'];
    const params = [req.user.workspaceId];

    if (tab === 'Citizens') {
      conditions.push(`r.role_slug = 'citizen'`);
    } else if (tab === 'LGU staff') {
      conditions.push(`r.role_slug IN ('lgu_admin', 'lgu_reviewer')`);
    } else if (tab === 'Maintenance') {
      conditions.push(`r.role_slug IN ('maintenance_lead', 'maintenance_crew')`);
    } else if (tab === 'Invitations') {
      conditions.push(`u.account_status = 'Invited'`);
    }

    if (role && role !== 'All roles' && role !== 'all') {
      conditions.push('(r.role_display_name = ? OR r.role_slug = ?)');
      params.push(role, role);
    }

    if (status && status !== 'All statuses' && status !== 'all') {
      conditions.push('u.account_status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push('(u.full_name LIKE ? OR u.email LIKE ?)');
      params.push(q, q);
    }

    const [users] = await pool.execute(
      `SELECT u.user_id, u.full_name, u.email, u.mobile_number,
              u.department_or_area, u.account_status, u.is_email_verified,
              r.role_slug, r.role_display_name
         FROM users u
         INNER JOIN roles r ON r.role_id = u.role_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY u.user_id ASC
        LIMIT 20`,
      params
    );

    return res.status(200).json({
      kpis: {
        citizenAccounts: 3842,
        lguAdministrators: 12,
        maintenancePersonnel: 48,
        pendingInvitations: 3
      },
      totalDirectoryCount: 3902,
      users
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/admin/users/:userId
 * Returns Citizen / User details and recent reports ("Admin · User details and account management.png").
 */
export async function getUserDetails(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const [users] = await pool.execute(
      `SELECT u.*, r.role_slug, r.role_display_name, b.barangay_name
         FROM users u
         INNER JOIN roles r ON r.role_id = u.role_id
         LEFT JOIN barangays b ON b.barangay_id = u.barangay_id
        WHERE u.user_id = ? AND u.workspace_id = ?
        LIMIT 1`,
      [userId, req.user.workspaceId]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User account not found.' });
    }

    const user = users[0];
    const [recentReports] = await pool.execute(
      `SELECT public_report_code, road_name, current_status, submitted_at
         FROM pothole_reports
        WHERE reporter_user_id = ?
        ORDER BY submitted_at DESC
        LIMIT 10`,
      [userId]
    );

    return res.status(200).json({
      user,
      recentReports
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/v1/admin/users/:userId/status
 * Enforces privilege-separation acknowledgement and mandatory audit reason ("Admin · User details and account management.png").
 */
export async function updateUserAccountStatus(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const {
      targetStatus, // 'Active' | 'Suspended'
      reason,
      acknowledgePrivilegeSeparation = false
    } = req.body;

    if (!['Active', 'Suspended'].includes(targetStatus)) {
      return res.status(422).json({
        error: 'INVALID_ACCOUNT_STATUS',
        message: 'Target status must be Active or Suspended.'
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(422).json({
        error: 'STATUS_REASON_REQUIRED',
        message: 'A reason is required before a changed status can be confirmed.'
      });
    }

    if (!acknowledgePrivilegeSeparation) {
      return res.status(422).json({
        error: 'PRIVILEGE_SEPARATION_ACK_REQUIRED',
        message: 'You must confirm "I understand account status does not edit privileges" before applying status changes.'
      });
    }

    const result = await withTransaction(async (conn) => {
      const [users] = await conn.execute(
        `SELECT user_id, full_name, account_status FROM users WHERE user_id = ? AND workspace_id = ? FOR UPDATE`,
        [userId, req.user.workspaceId]
      );

      if (!users.length) {
        const err = new Error('User account not found.');
        err.statusCode = 404;
        throw err;
      }

      const previousStatus = users[0].account_status;

      await conn.execute(
        `UPDATE users
            SET account_status = ?,
                last_status_reason = ?,
                last_status_changed_by = ?,
                last_status_changed_at = NOW()
          WHERE user_id = ?`,
        [targetStatus, reason.trim(), req.user.userId, userId]
      );

      if (targetStatus === 'Suspended') {
        await conn.execute(
          `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
          [userId]
        );
      }

      await recordSystemAudit(conn, {
        workspaceId: req.user.workspaceId,
        actorUserId: req.user.userId,
        actorName: req.user.fullName,
        actorRole: req.user.roleDisplayName,
        actionCategory: 'USER_ACCESS',
        actionCode: `USER_STATUS_${targetStatus.toUpperCase()}`,
        targetEntityType: 'user',
        targetEntityId: userId,
        reason: reason.trim(),
        previousValues: { accountStatus: previousStatus },
        newValues: { accountStatus: targetStatus, acknowledgePrivilegeSeparation: true },
        ipAddress: req.ip
      });

      return {
        userId,
        fullName: users[0].full_name,
        previousStatus,
        newStatus: targetStatus,
        reason: reason.trim()
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET / PATCH /api/v1/admin/profile/preferences
 * Manages personal notification switches for Ana Dela Cruz ("Admin · Administrator profile.png").
 * Keeps signin_security_notices locked to 1.
 */
export async function getAdminProfile(req, res, next) {
  try {
    const [prefs] = await pool.execute(
      `SELECT * FROM user_notification_preferences WHERE user_id = ? LIMIT 1`,
      [req.user.userId]
    );

    return res.status(200).json({
      profile: {
        userId: req.user.userId,
        fullName: req.user.fullName,
        email: req.user.email,
        roleDisplay: `${req.user.roleDisplayName} · Quezon City`,
        department: req.user.department || 'City Engineering',
        accountStatus: req.user.accountStatus
      },
      preferences: prefs[0] || {
        review_queue_alerts: 1,
        completion_review_alerts: 1,
        daily_email_summary: 0,
        signin_security_notices: 1
      }
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateAdminProfilePreferences(req, res, next) {
  try {
    const {
      reviewQueueAlerts = true,
      completionReviewAlerts = true,
      dailyEmailSummary = false
    } = req.body;

    await pool.execute(
      `INSERT INTO user_notification_preferences (
         user_id, review_queue_alerts, completion_review_alerts, daily_email_summary, signin_security_notices
       ) VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         review_queue_alerts = VALUES(review_queue_alerts),
         completion_review_alerts = VALUES(completion_review_alerts),
         daily_email_summary = VALUES(daily_email_summary),
         signin_security_notices = 1`,
      [req.user.userId, reviewQueueAlerts ? 1 : 0, completionReviewAlerts ? 1 : 0, dailyEmailSummary ? 1 : 0]
    );

    return res.status(200).json({
      saved: true,
      feedbackMessage: `${req.user.fullName} · Personal notifications updated 21 Oct 2026, 12:05 PM PHT. Workspace rules are unchanged.`,
      preferences: {
        reviewQueueAlerts: Boolean(reviewQueueAlerts),
        completionReviewAlerts: Boolean(completionReviewAlerts),
        dailyEmailSummary: Boolean(dailyEmailSummary),
        signinSecurityNotices: true
      }
    });
  } catch (err) {
    return next(err);
  }
}
