import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';
import { validateDateRangeQuery, validatePhilippineMobile } from '../middleware/validate.middleware.js';
import {
  listReports,
  getReportDetails,
  verifyReport,
  compareDuplicateReport,
  assignRepairTeam,
  reviewRepairCompletion,
  getReportAuditLog
} from '../controllers/reports.controller.js';
import {
  listTeams,
  getTeamDetails,
  inviteMaintenancePersonnel,
  updateMaintenancePersonnel
} from '../controllers/teams.controller.js';
import {
  listUsers,
  getUserDetails,
  updateUserAccountStatus,
  getAdminProfile,
  updateAdminProfilePreferences
} from '../controllers/users.controller.js';
import {
  getAnalyticsOverview,
  downloadReportsCsv,
  getWorkspaceSettings,
  updateWorkspaceSettings
} from '../controllers/analytics.controller.js';

const router = Router();

// All /api/v1/admin/* routes require authentication + live account_status === 'Active'
router.use(authenticateUser);

// 1. Analytics & Overview
router.get(
  '/analytics/overview',
  requirePermission('analytics.view'),
  validateDateRangeQuery,
  getAnalyticsOverview
);

// 2. Reports Management & Workflow Lifecycle
router.get('/reports', requirePermission('reports.view'), listReports);
router.get('/reports/:reportCode', requirePermission('reports.view'), getReportDetails);
router.post('/reports/:reportCode/verify', requirePermission('reports.verify'), verifyReport);
router.post(
  '/reports/:reportCode/compare-duplicate',
  requirePermission('reports.compare_duplicates'),
  compareDuplicateReport
);
router.post('/reports/:reportCode/assign', requirePermission('reports.assign'), assignRepairTeam);
router.post(
  '/reports/:reportCode/review-completion',
  requirePermission('repairs.approve'),
  reviewRepairCompletion
);
router.get(
  '/reports/:reportCode/audit-log',
  requirePermission('reports.view'),
  validateDateRangeQuery,
  getReportAuditLog
);

// 3. Maintenance Teams & Personnel
router.get('/teams', requirePermission('teams.view'), listTeams);
router.get('/teams/:teamCode', requirePermission('teams.view'), getTeamDetails);
router.post(
  '/teams/personnel/invite',
  requirePermission('teams.manage'),
  validatePhilippineMobile,
  inviteMaintenancePersonnel
);
router.patch('/teams/personnel/:userId', requirePermission('teams.manage'), updateMaintenancePersonnel);

// 4. User Management & Citizen Account Status Controls
router.get('/users', requirePermission('users.view'), listUsers);
router.get('/users/:userId', requirePermission('users.view'), getUserDetails);
router.patch('/users/:userId/status', requirePermission('users.manage_status'), updateUserAccountStatus);

// 5. Direct Local Machine CSV Export Stream
router.get(
  '/exports/download-csv',
  requirePermission('exports.generate'),
  validateDateRangeQuery,
  downloadReportsCsv
);

// 6. Administrator Profile & Workspace Settings
router.get('/profile/preferences', getAdminProfile);
router.patch('/profile/preferences', updateAdminProfilePreferences);
router.get('/settings/workspace', requirePermission('settings.manage'), getWorkspaceSettings);
router.patch('/settings/workspace', requirePermission('settings.manage'), updateWorkspaceSettings);

export default router;
