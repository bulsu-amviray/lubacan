import crypto from 'crypto';
import { pool, withTransaction } from '../config/db.js';
import { recordSystemAudit } from '../middleware/rbac.middleware.js';
import { PH_MOBILE_REGEX } from '../middleware/validate.middleware.js';
import { syncToFirebase } from '../config/firebase.js';
import { syncToSupabase } from '../config/supabase.js';

/**
 * GET /api/v1/admin/teams
 * Returns maintenance team KPI summary and teams grid ("Admin · Maintenance team management.png").
 */
export async function listTeams(req, res, next) {
  try {
    const [teams] = await pool.execute(
      `SELECT mt.*, u.full_name AS lead_name, u.email AS lead_email, u.mobile_number AS lead_mobile
         FROM maintenance_teams mt
         INNER JOIN users u ON u.user_id = mt.lead_user_id
        WHERE mt.workspace_id = ?
        ORDER BY mt.team_id ASC`,
      [req.user.workspaceId]
    );

    return res.status(200).json({
      kpis: {
        activeTeams: 8,
        fieldPersonnel: 48,
        assignedReports: 128,
        inProgressReports: 214
      },
      teams
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/admin/teams/:teamCode
 * Returns team details, lead card, crew table, and assigned tasks ("Admin · Maintenance team details.png").
 */
export async function getTeamDetails(req, res, next) {
  try {
    const { teamCode } = req.params;
    const [teams] = await pool.execute(
      `SELECT mt.*, u.full_name AS lead_name, u.email AS lead_email, u.mobile_number AS lead_mobile
         FROM maintenance_teams mt
         INNER JOIN users u ON u.user_id = mt.lead_user_id
        WHERE (mt.team_code = ? OR mt.team_id = ?) AND mt.workspace_id = ?
        LIMIT 1`,
      [teamCode, Number(teamCode) || 0, req.user.workspaceId]
    );

    if (!teams.length) {
      return res.status(404).json({ error: 'TEAM_NOT_FOUND', message: 'Maintenance team not found.' });
    }

    const team = teams[0];

    const [crew] = await pool.execute(
      `SELECT tm.team_member_id, tm.user_id, tm.member_role, tm.specialty, tm.availability_status,
              u.full_name, u.email, u.mobile_number
         FROM team_members tm
         INNER JOIN users u ON u.user_id = tm.user_id
        WHERE tm.team_id = ?
        ORDER BY tm.member_role ASC, tm.team_member_id ASC`,
      [team.team_id]
    );

    const [tasks] = await pool.execute(
      `SELECT r.public_report_code, r.road_name, r.current_status, r.resolved_at,
              ra.assignment_priority, ra.target_completion_at
         FROM repair_assignments ra
         INNER JOIN pothole_reports r ON r.report_id = ra.report_id
        WHERE ra.team_id = ? AND ra.is_active = 1
        ORDER BY ra.target_completion_at DESC`,
      [team.team_id]
    );

    return res.status(200).json({
      team,
      workloadSummary: {
        assignedCount: 8,
        inProgressCount: 3,
        awaitingReviewCount: 2
      },
      crew,
      tasks
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/admin/teams/personnel/invite
 * Validates Philippine mobile number regex (/^\+63\s?9\d{2}\s?\d{3}\s?\d{4}$/) and creates 7-day invitation.
 * Matches "Admin · Add maintenance personnel.png".
 */
export async function inviteMaintenancePersonnel(req, res, next) {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      roleSlug = 'maintenance_crew',
      teamId = 1,
      team,
      area,
      departmentOrArea,
      sendToWorkEmail = true
    } = req.body;

    if (!fullName || !email) {
      return res.status(422).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Full name and work email are required.'
      });
    }

    if (!PH_MOBILE_REGEX.test((mobileNumber || '').trim())) {
      return res.status(422).json({
        error: 'INVALID_PH_MOBILE_NUMBER',
        field: 'mobileNumber',
        message: 'Enter a complete Philippine mobile number, for example +63 917 000 0215.'
      });
    }

    const assignedArea = departmentOrArea || area || team || (roleSlug === 'citizen' ? 'None (Citizen / General)' : 'Malolos Team Alpha');

    const result = await withTransaction(async (conn) => {
      const [roles] = await conn.execute(
        `SELECT role_id, role_display_name FROM roles WHERE role_slug = ? LIMIT 1`,
        [roleSlug]
      );
      const role = roles[0] || { role_id: 4, role_display_name: 'Maintenance crew' };

      const [insertUser] = await conn.execute(
        `INSERT INTO users (
           workspace_id, role_id, full_name, email, mobile_number,
           department_or_area, account_status, is_email_verified
         ) VALUES (?, ?, ?, ?, ?, ?, 'Invited', 0)`,
        [req.user.workspaceId, role.role_id, fullName.trim(), email.trim(), mobileNumber.trim(), assignedArea]
      );

      const newUserId = insertUser.insertId;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await conn.execute(
        `INSERT INTO user_invitations (
           user_id, invited_by_user_id, role_id, team_id,
           token_hash, send_to_work_email, expires_at
         ) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [newUserId, req.user.userId, role.role_id, teamId, tokenHash, sendToWorkEmail ? 1 : 0]
      );

      await recordSystemAudit(conn, {
        workspaceId: req.user.workspaceId,
        actorUserId: req.user.userId,
        actorName: req.user.fullName,
        actorRole: req.user.roleDisplayName,
        actionCategory: 'TEAM_PERSONNEL',
        actionCode: 'INVITE_MAINTENANCE_PERSONNEL',
        targetEntityType: 'user',
        targetEntityId: newUserId,
        reason: `Invited ${fullName} as ${role.role_display_name} (7-day expiry).`,
        newValues: { fullName, email, mobileNumber, roleSlug, teamId },
        ipAddress: req.ip
      });

      return {
        userId: newUserId,
        fullName,
        email,
        mobileNumber,
        roleSlug,
        teamId,
        accountStatus: 'Invited',
        expiresInDays: 7
      };
    });

    // Synchronize newly invited user to Firebase & Supabase
    syncToFirebase(`users/${result.userId}`, {
      id: result.userId,
      name: result.fullName,
      email: result.email,
      mobile: result.mobileNumber,
      role: result.roleSlug === 'maintenance_lead' ? 'Maintenance lead' : 'Maintenance crew',
      status: 'Invited',
      teamId: result.teamId,
      createdAt: new Date().toISOString()
    }, 'PUT').catch(() => {});

    syncToSupabase('users', {}, {
      full_name: result.fullName,
      email: result.email,
      mobile: result.mobileNumber,
      role: result.roleSlug === 'maintenance_lead' ? 'Maintenance lead' : 'Maintenance crew',
      status: 'Invited'
    }, 'POST').catch(() => {});

    return res.status(201).json(result);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'EMAIL_ALREADY_EXISTS',
        message: `A user with email "${req.body?.email}" already exists in the database.`
      });
    }
    return next(err);
  }
}

/**
 * PATCH /api/v1/admin/teams/personnel/:userId
 * Protects ongoing task ownership ("Admin · Edit maintenance personnel.png").
 * Blocks team or role reassignment if personnel owns active Assigned/In Progress tasks unless explicitHandoverConfirmed === true.
 */
export async function updateMaintenancePersonnel(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const {
      fullName,
      email,
      mobileNumber,
      roleSlug,
      teamId,
      availabilityStatus = 'On duty',
      explicitHandoverConfirmed = false
    } = req.body;

    if (mobileNumber && !PH_MOBILE_REGEX.test(mobileNumber.trim())) {
      return res.status(422).json({
        error: 'INVALID_PH_MOBILE_NUMBER',
        field: 'mobileNumber',
        message: 'Enter a complete Philippine mobile number, for example +63 917 000 0215.'
      });
    }

    const result = await withTransaction(async (conn) => {
      const [users] = await conn.execute(
        `SELECT u.*, r.role_slug, tm.team_id, tm.availability_status
           FROM users u
           INNER JOIN roles r ON r.role_id = u.role_id
           LEFT JOIN team_members tm ON tm.user_id = u.user_id
          WHERE u.user_id = ? AND u.workspace_id = ?
          LIMIT 1`,
        [userId, req.user.workspaceId]
      );

      if (!users.length) {
        const err = new Error('Personnel record not found.');
        err.statusCode = 404;
        throw err;
      }

      const current = users[0];
      const isChangingRole = roleSlug && roleSlug !== current.role_slug;
      const isChangingTeam = teamId && Number(teamId) !== Number(current.team_id);

      if ((isChangingRole || isChangingTeam) && !explicitHandoverConfirmed) {
        const [activeTasks] = await conn.execute(
          `SELECT COUNT(*) AS active_count
             FROM repair_assignments ra
             INNER JOIN pothole_reports r ON r.report_id = ra.report_id
            WHERE ra.lead_user_id = ?
              AND ra.is_active = 1
              AND r.current_status IN ('Assigned', 'In Progress')`,
          [userId]
        );

        if (activeTasks[0].active_count > 0) {
          const err = new Error(
            'Ongoing task ownership is protected. A team or lead-role change requires explicit handover and administrator confirmation, not automatic reassignment.'
          );
          err.statusCode = 409;
          err.code = 'TASK_HANDOVER_REQUIRED';
          throw err;
        }
      }

      await conn.execute(
        `UPDATE users
            SET full_name = COALESCE(?, full_name),
                email = COALESCE(?, email),
                mobile_number = COALESCE(?, mobile_number)
          WHERE user_id = ?`,
        [fullName || null, email || null, mobileNumber || null, userId]
      );

      if (current.team_id) {
        await conn.execute(
          `UPDATE team_members
              SET availability_status = ?
            WHERE user_id = ? AND team_id = ?`,
          [availabilityStatus, userId, current.team_id]
        );
      }

      await recordSystemAudit(conn, {
        workspaceId: req.user.workspaceId,
        actorUserId: req.user.userId,
        actorName: req.user.fullName,
        actorRole: req.user.roleDisplayName,
        actionCategory: 'TEAM_PERSONNEL',
        actionCode: 'UPDATE_MAINTENANCE_PERSONNEL',
        targetEntityType: 'user',
        targetEntityId: userId,
        reason: 'Updated maintenance personnel contact and availability details. No task ownership silently reassigned.',
        previousValues: {
          fullName: current.full_name,
          mobileNumber: current.mobile_number,
          availabilityStatus: current.availability_status
        },
        newValues: {
          fullName: fullName || current.full_name,
          mobileNumber: mobileNumber || current.mobile_number,
          availabilityStatus
        },
        ipAddress: req.ip
      });

      return {
        userId,
        fullName: fullName || current.full_name,
        email: email || current.email,
        mobileNumber: mobileNumber || current.mobile_number,
        availabilityStatus,
        taskOwnershipProtected: true
      };
    });

    // Synchronize updated personnel to Firebase & Supabase
    syncToFirebase(`users/${userId}`, {
      name: result.fullName,
      email: result.email,
      mobile: result.mobileNumber,
      availability: result.availabilityStatus
    }).catch(() => {});

    syncToSupabase('users', { email: result.email }, {
      full_name: result.fullName,
      mobile: result.mobileNumber
    }).catch(() => {});

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/admin/teams
 * Creates a new maintenance team in MySQL maintenance_teams table.
 */
export async function createTeam(req, res, next) {
  try {
    const {
      teamName,
      districtName = 'Outer / Rural',
      serviceAreaDescription = 'General Malolos Area',
      specialty = 'Asphalt & concrete repair',
      leadUserId = 4
    } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(422).json({
        error: 'MISSING_TEAM_NAME',
        message: 'Team name is required.'
      });
    }

    // Use the exact code the Admin UI already saved to Supabase so both databases share one team code.
    // Otherwise derive a full (non-truncated) slug plus a short unique suffix to avoid "Malolos Team X" collisions.
    const providedCode = String(req.body.teamCode || '').trim().toUpperCase();
    const slug = teamName.trim().toUpperCase().replace(/^MALOLOS\s*(TEAM)?\s*/i, '').replace(/[^A-Z0-9]/g, '');
    const teamCode = /^[A-Z0-9-]{3,32}$/.test(providedCode)
      ? providedCode
      : `MALOLOS-${(slug || 'TEAM').slice(0, 14)}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const [insert] = await pool.execute(
      `INSERT INTO maintenance_teams (
         workspace_id, team_code, district_name, team_name, lead_user_id,
         service_area_description, specialty, service_hours, team_status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, '7:00 AM–4:00 PM PHT', 'Active')`,
      [req.user.workspaceId, teamCode, districtName, teamName.trim(), leadUserId, serviceAreaDescription, specialty]
    );

    const newTeamPayload = {
      code: teamCode,
      title: teamName.trim(),
      lead: leadUserId === 9 ? 'Engr. Jessa Morales' : 'Engr. Paolo Santos',
      serviceArea: `${districtName} (${serviceAreaDescription})`,
      crewSize: '4 maintenance personnel',
      specialty,
      workload: '0 assigned · 0 in progress',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    // Synchronize newly created team to Firebase & Supabase (Supabase result is awaited and logged)
    syncToFirebase(`teams/${teamCode}`, newTeamPayload, 'PUT').catch(() => {});
    const supabaseOk = await syncToSupabase('teams', {}, {
      code: teamCode,
      title: teamName.trim(),
      lead: newTeamPayload.lead,
      service_area: newTeamPayload.serviceArea,
      crew_size: newTeamPayload.crewSize,
      specialty,
      workload: '0 assigned · 0 in progress',
      status: 'Active'
    }, 'POST').catch(() => false);
    if (!supabaseOk) {
      console.warn(`[createTeam] Supabase sync did not complete for ${teamCode} (it may already exist or the request failed).`);
    }

    return res.status(201).json({
      teamId: insert.insertId,
      teamCode,
      teamName: teamName.trim(),
      supabaseSynced: Boolean(supabaseOk)
    });
  } catch (err) {
    return next(err);
  }
}
