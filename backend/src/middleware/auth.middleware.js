import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

/**
 * Authenticates incoming requests via Bearer JWT, HTTP-only cookie, or Demo Header/Auto-Auth.
 * Always verifies live against MySQL that the user's account_status === 'Active'
 * and loads their RBAC permissions into a Set.
 */
export async function authenticateUser(req, res, next) {
  try {
    let userId = null;

    // 1. Check Authorization Bearer token or cookie
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null) ||
      req.cookies?.luba_access_token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luba_default_secret');
        userId = decoded.sub || decoded.userId;
      } catch {
        return res.status(401).json({
          error: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Your session token is invalid or has expired. Please sign in again.'
        });
      }
    } else if (req.headers['x-demo-user-id']) {
      // Allow testing different roles/suspended accounts via header
      userId = Number(req.headers['x-demo-user-id']);
    } else if (process.env.DEMO_AUTO_AUTH !== 'false') {
      // Default to Ana Dela Cruz (user_id = 3, LGU administrator) for seamless admin console operation
      userId = 3;
    }

    if (!userId) {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Authentication is required to access LUBA CanFindIT administration routes.'
      });
    }

    const [users] = await pool.execute(
      `SELECT u.user_id, u.workspace_id, u.role_id, u.full_name, u.email,
              u.department_or_area, u.account_status,
              r.role_slug, r.role_display_name, r.grants_admin_console
         FROM users u
         INNER JOIN roles r ON r.role_id = u.role_id
        WHERE u.user_id = ?
        LIMIT 1`,
      [userId]
    );

    if (!users.length) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'Authenticated user record does not exist.'
      });
    }

    const user = users[0];

    // Enforce live account status check ("Admin · User details and account management.png")
    if (user.account_status !== 'Active') {
      return res.status(403).json({
        error: 'ACCOUNT_SUSPENDED_OR_INACTIVE',
        message: `Access denied. Account status is currently "${user.account_status}".`
      });
    }

    const [permRows] = await pool.execute(
      `SELECT p.permission_key
         FROM role_permissions rp
         INNER JOIN permissions p ON p.permission_id = rp.permission_id
        WHERE rp.role_id = ?`,
      [user.role_id]
    );

    req.user = {
      userId: user.user_id,
      workspaceId: user.workspace_id,
      roleId: user.role_id,
      roleSlug: user.role_slug,
      roleDisplayName: user.role_display_name,
      fullName: user.full_name,
      email: user.email,
      department: user.department_or_area,
      accountStatus: user.account_status,
      grantsAdminConsole: Boolean(user.grants_admin_console),
      permissions: new Set(permRows.map((r) => r.permission_key))
    };

    return next();
  } catch (err) {
    return next(err);
  }
}
