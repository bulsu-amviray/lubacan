import { pool } from '../config/db.js';

/**
 * Restricts route access to specific role slugs (e.g. 'lgu_admin', 'lgu_reviewer').
 */
export function requireRole(...allowedRoleSlugs) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Authentication required.' });
    }
    if (!allowedRoleSlugs.includes(req.user.roleSlug)) {
      return res.status(403).json({
        error: 'INSUFFICIENT_ROLE',
        message: `Role "${req.user.roleDisplayName}" is not authorized for this action.`
      });
    }
    return next();
  };
}

/**
 * Restricts route access to users holding a specific granular permission key.
 */
export function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Authentication required.' });
    }
    if (!req.user.permissions.has(permissionKey)) {
      return res.status(403).json({
        error: 'FORBIDDEN_PERMISSION',
        message: `Missing required permission: "${permissionKey}". Only authorized LGU staff can perform this operation.`
      });
    }
    return next();
  };
}

/**
 * Appends an immutable entry to system_audit_logs (supports existing transaction connection or pool).
 */
export async function recordSystemAudit(connOrPool, {
  workspaceId = 1,
  actorUserId,
  actorName,
  actorRole,
  actionCategory,
  actionCode,
  targetEntityType,
  targetEntityId,
  reason = null,
  previousValues = null,
  newValues = null,
  ipAddress = '127.0.0.1'
}) {
  const executor = connOrPool || pool;
  await executor.execute(
    `INSERT INTO system_audit_logs (
       workspace_id, actor_user_id, actor_name, actor_role,
       action_category, action_code, target_entity_type, target_entity_id,
       reason, previous_values_json, new_values_json, ip_address
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      workspaceId,
      actorUserId,
      actorName,
      actorRole,
      actionCategory,
      actionCode,
      targetEntityType,
      String(targetEntityId),
      reason,
      previousValues ? JSON.stringify(previousValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress
    ]
  );
}
