// Main application entry point: initializes state, router, and wires global event delegation.

import { store } from './state/store.js';
import { initRouter } from './router.js';
import {
  apiService,
  downloadCsvToLocalMachine,
  triggerLocalCsvDownload,
  triggerLocalExcelDownload,
  triggerLocalPdfDownload
} from './services/api.service.js';
import { PH_MOBILE_REGEX } from './utils/validators.js';
import { supabaseSync } from './services/supabaseSync.js';
import { saveSupabaseConfig, getActiveSupabaseConfig } from './config/supabase.config.js';
import { selectPotholeMapPin } from './components/realMalolosMap.js';

function showToast(message, variant = 'success') {
  let container = document.getElementById('toast-portal');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-portal';
    container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
  const isError = variant === 'error' || variant === 'danger';
  const dotColor = isError ? 'bg-rose-500' : 'bg-emerald-400';
  const borderColor = isError ? 'border-rose-700' : 'border-blue-900';
  const toast = document.createElement('div');
  toast.className = `bg-luba-navy text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl border ${borderColor} flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${dotColor} flex-shrink-0"></span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function attachGlobalEventListeners() {
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('button, [data-screen-jump], [data-open-modal], [data-close-modal]');
    if (!target) return;

    // 0. Sign out → back to the administrator login page
    const signOutBtn = target.closest('[data-sign-out]');
    if (signOutBtn) {
      sessionStorage.removeItem('luba_authenticated');
      sessionStorage.removeItem('luba_user');
      window.location.replace('./login.html');
      return;
    }

    // 1. Direct Figma screen jump
    const screenJumpBtn = target.closest('[data-screen-jump]');
    if (screenJumpBtn) {
      const rawScreen = screenJumpBtn.getAttribute('data-screen-jump');
      const screenId = isNaN(Number(rawScreen)) ? rawScreen : Number(rawScreen);
      if (screenId === 13) {
        const s = store.getState();
        if (s.selectedReportCode) {
          store.setState((prev) => ({
            mapFilters: { ...prev.mapFilters, selectedPinCode: s.selectedReportCode }
          }));
        }
      }
      store.navigateToScreen(screenId);
      return;
    }

    // 2. Sidebar Navigation
    const navBtn = target.closest('[data-nav-section]');
    if (navBtn) {
      const navMap = {
        overview: 1,
        reports: 2,
        map: 13,
        users: 18,
        teams: 14,
        analytics: 20,
        settings: 25
      };
      const section = navBtn.getAttribute('data-nav-section');
      const targetScreen = navMap[section] || 1;
      if (targetScreen === 13) {
        const s = store.getState();
        if (s.selectedReportCode) {
          store.setState((prev) => ({
            mapFilters: { ...prev.mapFilters, selectedPinCode: s.selectedReportCode }
          }));
        }
      }
      store.navigateToScreen(targetScreen);
      return;
    }

    // 3. Open Modal as an overlay without navigating away from the current screen
    if (target.hasAttribute('data-open-modal')) {
      const modalKey = target.getAttribute('data-open-modal');
      store.setState({ activeModal: modalKey });
      return;
    }

    // 4. Close Modal
    if (target.hasAttribute('data-close-modal')) {
      store.setState({ activeModal: null });
      return;
    }

    // 5. Open a report from Reports table
    const openReportBtn = target.closest('[data-open-report]');
    if (openReportBtn) {
      const code = openReportBtn.getAttribute('data-open-report');
      store.setState({ selectedReportCode: code });
      store.navigateToScreen(3);
      return;
    }

    // 5b. Open user details from Users directory (Screen 18 -> Screen 19)
    const openUserBtn = target.closest('[data-open-user]');
    if (openUserBtn) {
      const rawId = openUserBtn.getAttribute('data-open-user');
      const userId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const s = store.getState();
      const user = (s.users || []).find((u) => u.id === userId || String(u.id) === String(rawId)) || s.users[0];
      const initialStatus = user ? user.status : 'Active';
      store.setState({
        selectedUserId: userId,
        userStatusForm: {
          currentStatus: initialStatus,
          selectedStatus: initialStatus,
          reason: 'Enter a specific account access reason',
          reasonTouched: false,
          acknowledgePrivilegeSeparation: false
        }
      });
      store.navigateToScreen(19);
      return;
    }

    if (target.hasAttribute('data-assign-report')) {
      const code = target.getAttribute('data-assign-report');
      const rep = (store.getState().reports || []).find((r) => r.code === code);
      const allTeams = store.getState().teams || [];
      const defaultTeam = rep?.assignedTeam
        ? allTeams.find((t) => t.title === rep.assignedTeam) || allTeams[0]
        : allTeams[0];
      store.setState((s) => ({
        selectedReportCode: code,
        activeModal: 'assign_team',
        assignmentForm: {
          ...s.assignmentForm,
          teamName: defaultTeam?.title || 'Malolos Team Alpha',
          leadName: defaultTeam?.lead || 'Engr. Paolo Santos'
        }
      }));
      return;
    }

    if (target.hasAttribute('data-forward-dpwh')) {
      const code = target.getAttribute('data-forward-dpwh');
      store.setState((s) => ({
        selectedReportCode: code,
        activeModal: 'assign_team',
        assignmentForm: {
          ...s.assignmentForm,
          teamName: 'DPWH Bulacan 1st District Engineering Office',
          leadName: 'DEO Liaison Contact · Bulacan 1st'
        }
      }));
      return;
    }

    if (target.hasAttribute('data-view-team')) {
      const teamCode = target.getAttribute('data-view-team');
      store.setState({ selectedTeamCode: teamCode });
      store.navigateToScreen(15);
      return;
    }

    // 6. Reports Management Filter Pills & Reset
    if (target.hasAttribute('data-report-pill')) {
      const pill = target.getAttribute('data-report-pill');
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, pill }
      }));
      return;
    }
    if (target.hasAttribute('data-reset-report-filters')) {
      store.setState({
        reportFilters: {
          pill: 'All reports 1,284',
          search: '',
          status: 'All statuses',
          severity: 'All severities',
          month: 'October 2026'
        }
      });
      return;
    }

    // Quick Direct Actions from Report Details
    if (target.hasAttribute('data-quick-verify')) {
      const code = target.getAttribute('data-quick-verify');
      const st = store.getState();
      const nextReports = st.reports.map((r) =>
        r.code === code ? { ...r, status: 'Verified' } : r
      );
      store.setState({ reports: nextReports });
      supabaseSync.updateReport(code, { status: 'Verified', verifiedAt: new Date().toISOString() });
      showToast(`Report ${code} verified successfully.`);
      return;
    }

    if (target.hasAttribute('data-resolve-report')) {
      const code = target.getAttribute('data-resolve-report');
      const st = store.getState();
      const nextReports = st.reports.map((r) =>
        r.code === code ? { ...r, status: 'Resolved' } : r
      );
      store.setState({ reports: nextReports });
      supabaseSync.resolveReport(code, { resolvedAt: new Date().toISOString() });

      // Update team workload
      const assignedCount = nextReports.filter((r) => r.assignedTeam === 'Malolos Team Alpha' && r.status === 'Assigned').length;
      const inProgressCount = nextReports.filter((r) => r.assignedTeam === 'Malolos Team Alpha' && r.status === 'In Progress').length;
      const workload = `${assignedCount} assigned · ${inProgressCount} in progress`;
      supabaseSync.updateTeam('MALOLOS-ALPHA', { workload });
      store.setState((s) => ({
        teams: s.teams.map((t) => t.code === 'MALOLOS-ALPHA' ? { ...t, workload } : t)
      }));

      showToast(`Repair for ${code} approved and marked Resolved.`);
      return;
    }

    if (target.hasAttribute('data-confirm-reject-report')) {
      const code = store.getState().selectedReportCode || 'RW-2026-0842';
      const om = store.getState().outcomeModal || {};
      const nextReports = store.getState().reports.map((r) =>
        r.code === code ? {
          ...r,
          status: 'Rejected',
          rejectionCategory: om.rejectionCategory || 'Outside City of Malolos jurisdiction',
          rejectionReason: om.rejectionReason || ''
        } : r
      );
      store.setState({ reports: nextReports, activeModal: null });
      const rejectPatch = {
        status: 'Rejected',
        rejectionCategory: om.rejectionCategory || 'Outside City of Malolos jurisdiction',
        rejectionReason: om.rejectionReason || '',
        rejectedAt: new Date().toISOString()
      };
      supabaseSync.updateReport(code, rejectPatch);
      supabaseSync.recordAuditLog({
        reportCode: code,
        actor: store.getState().adminProfileForm?.fullName || 'Ana Dela Cruz (LGU administrator)',
        status: 'Rejected',
        note: `${om.rejectionCategory || 'Rejected'}: ${om.rejectionReason || 'Outside City of Malolos jurisdiction.'}`
      }, store);
      showToast(`Report ${code} marked as Rejected.`);
      return;
    }

    if (target.hasAttribute('data-confirm-duplicate-report')) {
      const code = store.getState().selectedReportCode || 'RW-2026-0842';
      const om = store.getState().outcomeModal || {};
      const nextReports = store.getState().reports.map((r) =>
        r.code === code ? {
          ...r,
          status: 'Duplicate',
          linkedReport: om.originalReport || 'RW-2026-0826',
          duplicateReason: om.duplicateReason || ''
        } : r
      );
      store.setState({ reports: nextReports, activeModal: null });
      const dupPatch = {
        status: 'Duplicate',
        linkedReport: om.originalReport || 'RW-2026-0826',
        duplicateReason: om.duplicateReason || '',
        duplicateLinkedAt: new Date().toISOString()
      };
      supabaseSync.updateReport(code, dupPatch);
      supabaseSync.recordAuditLog({
        reportCode: code,
        actor: store.getState().adminProfileForm?.fullName || 'Ana Dela Cruz (LGU administrator)',
        status: 'Duplicate',
        note: `Linked to ${om.originalReport || 'RW-2026-0826'}. ${om.duplicateReason || 'Duplicate of existing report.'}`
      }, store);
      showToast(`Report ${code} linked as Duplicate.`);
      return;
    }

    if (target.hasAttribute('data-confirm-forward-dpwh')) {
      const code = store.getState().selectedReportCode || 'RW-2026-0842';
      const nextReports = store.getState().reports.map((r) =>
        r.code === code ? { ...r, status: 'Forwarded to DPWH' } : r
      );
      store.setState({ reports: nextReports, activeModal: null });
      supabaseSync.forwardToDpwh(code);
      supabaseSync.updateReport(code, { status: 'Forwarded to DPWH', assignedTeam: 'DPWH Bulacan 1st District Engineering Office' });
      supabaseSync.recordAuditLog({
        reportCode: code,
        actor: store.getState().adminProfileForm?.fullName || 'Ana Dela Cruz (LGU administrator)',
        status: 'Forwarded to DPWH',
        note: 'National road jurisdiction confirmed. Forwarded to DPWH Bulacan 1st District Engineering Office.'
      }, store);
      showToast(`Report ${code} forwarded to DPWH Bulacan 1st DEO.`);
      return;
    }

    // 7. Verification severity selector & Confirm Verified
    if (target.hasAttribute('data-select-verify-sev')) {
      const sev = target.getAttribute('data-select-verify-sev');
      store.setState((s) => ({
        verificationForm: { ...s.verificationForm, severity: sev }
      }));
      return;
    }
    if (target.hasAttribute('data-confirm-approve-report')) {
      const code = store.getState().selectedReportCode || 'RW-2026-0842';
      const vf = store.getState().verificationForm || {};
      const notes = vf?.notes || vf?.modalNotes || 'Location confirmed on MacArthur Highway. Clear risk to motorists.';
      const nextReports = store.getState().reports.map((r) =>
        r.code === code ? {
          ...r,
          status: 'Verified',
          severity: vf?.severity || r.severity,
          verificationNotes: notes
        } : r
      );
      const currentScreenId = store.getState().activeScreenId;
      const shouldNavigateToDetails = currentScreenId === 4;

      store.setState((s) => ({
        reports: nextReports,
        activeModal: null,
        ...(shouldNavigateToDetails ? { activeScreenId: 3, currentView: 'report_details' } : {})
      }));

      const verifyPatch = {
        status: 'Verified',
        severity: vf?.severity || 'High',
        verificationNotes: notes,
        verifiedBy: store.getState().adminProfileForm?.fullName || 'System Administrator',
        verifiedAt: new Date().toISOString()
      };
      supabaseSync.updateReport(code, verifyPatch);
      supabaseSync.recordAuditLog({
        reportCode: code,
        actor: store.getState().adminProfileForm?.fullName || 'Ana Dela Cruz (LGU administrator)',
        status: 'Verified',
        note: `Severity confirmed as ${vf?.severity || 'High'}. ${notes}`
      }, store);

      showToast(`Report ${code} verified.`);
      return;
    }

    // 8. Confirm Team Assignment (Screen 9 & 10)
    if (target.hasAttribute('data-confirm-assign-team')) {
      const code = store.getState().selectedReportCode || 'RW-2026-0842';
      const af = store.getState().assignmentForm || {};
      const allTeams = store.getState().teams || [];
      const teamName = af.teamName || (allTeams[0]?.title || 'Malolos Team Alpha');
      const matched = allTeams.find((t) => t.title === teamName || t.code === teamName);
      const leadName = matched?.lead || af.leadName || 'Engr. Paolo Santos';
      const priority = af.priority || 'High';
      const targetCompletion = af.targetCompletion || 'Within 48 hours · 5:00 PM PHT';
      const instructions = af.instructions || '';

      const nextReports = store.getState().reports.map((r) =>
        r.code === code ? {
          ...r,
          status: 'Assigned',
          assignedTeam: teamName,
          leadPersonnel: leadName,
          assignedTeamCode: matched?.code || '',
          priority,
          targetCompletion,
          instructions
        } : r
      );

      // Synchronize assignment details live to Supabase
      const assignPatch = {
        status: 'Assigned',
        assignedTeam: teamName,
        leadPersonnel: leadName,
        assignedTeamCode: matched?.code || '',
        priority,
        targetCompletion,
        instructions,
        assignedAt: new Date().toISOString()
      };
      supabaseSync.updateReport(code, assignPatch);
      supabaseSync.recordAuditLog({
        reportCode: code,
        actor: store.getState().adminProfileForm?.fullName || 'Ana Dela Cruz (LGU administrator)',
        status: 'Assigned',
        note: `Assigned to ${teamName} (${leadName}). Priority: ${priority}. Target: ${targetCompletion}.`
      }, store);

      // Update the specific team's workload in cloud databases
      const teamCode = matched ? matched.code : 'MALOLOS-ALPHA';
      const assignedCount = nextReports.filter((r) => (r.assignedTeam === teamName || r.assignedTeam === matched?.title) && r.status === 'Assigned').length;
      const inProgressCount = nextReports.filter((r) => (r.assignedTeam === teamName || r.assignedTeam === matched?.title) && r.status === 'In Progress').length;
      const workload = `${assignedCount} assigned · ${inProgressCount} in progress`;
      supabaseSync.updateTeam(teamCode, { workload });

      store.setState((s) => ({
        reports: nextReports,
        teams: s.teams.map((t) => t.code === teamCode || t.title === teamName ? { ...t, workload } : t),
        selectedTeamCode: teamCode,
        activeModal: null
      }));

      showToast(`Report ${code} assigned to ${teamName}.`);
      return;
    }

    // 9. Select Assignment Priority on Screen 10
    if (target.hasAttribute('data-select-assign-priority')) {
      const priority = target.getAttribute('data-select-assign-priority');
      store.setState((s) => ({
        assignmentForm: { ...s.assignmentForm, priority }
      }));
      return;
    }

    // 10. Approve Repair & Mark Resolved (Screen 11 -> Screen 12 Audit Log)
    if (target.hasAttribute('data-approve-repair')) {
      const code = store.getState().selectedReportCode || 'RW-2026-0842';
      const cf = store.getState().completionForm || {};
      const reviewNotes = cf.reviewNotes || 'Repair evidence matches reported site. Patch is level and compacted.';
      const nextReports = store.getState().reports.map((r) =>
        r.code === code ? { ...r, status: 'Resolved', inspectionNotes: reviewNotes, resolvedAt: new Date().toISOString() } : r
      );
      store.setState({ reports: nextReports });

      supabaseSync.resolveReport(code, {
        decision: 'ApprovedResolved',
        adminReviewNotes: reviewNotes,
        completedAt: new Date().toISOString()
      });
      supabaseSync.recordAuditLog({
        reportCode: code,
        actor: store.getState().adminProfileForm?.fullName || 'Ana Dela Cruz (LGU administrator)',
        status: 'Resolved',
        note: reviewNotes
      }, store);

      // Update the team's workload in Supabase
      const currentReport = nextReports.find((r) => r.code === code);
      const assignedTeam = currentReport?.assignedTeam || 'Malolos Team Alpha';
      const allTeams = store.getState().teams || [];
      const matched = allTeams.find((t) => t.title === assignedTeam || t.code === assignedTeam);
      const teamCode = matched ? matched.code : 'MALOLOS-ALPHA';
      const assignedCount = nextReports.filter((r) => (r.assignedTeam === assignedTeam || r.assignedTeam === matched?.title) && r.status === 'Assigned').length;
      const inProgressCount = nextReports.filter((r) => (r.assignedTeam === assignedTeam || r.assignedTeam === matched?.title) && r.status === 'In Progress').length;
      const workload = `${assignedCount} assigned · ${inProgressCount} in progress`;
      supabaseSync.updateTeam(teamCode, { workload });
      store.setState((s) => ({
        teams: s.teams.map((t) => t.code === teamCode ? { ...t, workload } : t)
      }));

      try {
        await apiService.reviewCompletion('RW-2026-0842', {
          decision: 'ApprovedResolved',
          adminReviewNotes: store.getState().completionForm.reviewNotes,
          checklist: {
            sameSite: true,
            fullyFilledCompacted: true,
            surfaceFlushSafe: true,
            notesLocationConsistent: true
          }
        });
      } catch {
        // Fallback
      }
      store.navigateToScreen(12);
      return;
    }

    if (target.hasAttribute('data-return-rework')) {
      const code = store.getState().selectedReportCode || 'RW-2026-0842';
      showToast(`Report ${code} returned to maintenance team for rework.`, 'warning');
      store.navigateToScreen(3);
      return;
    }

    const reviewCompletionBtn = target.closest('[data-review-completion]');
    if (reviewCompletionBtn) {
      const code = reviewCompletionBtn.getAttribute('data-review-completion');
      store.setState({ selectedReportCode: code });
      store.navigateToScreen(11);
      return;
    }

    // 11. Map Mode Pills
    if (target.hasAttribute('data-map-mode')) {
      const modePill = target.getAttribute('data-map-mode');
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, modePill }
      }));
      return;
    }

    // Overview Pothole Map View Toggle (Screen 1)
    const overviewMapToggle = target.closest('[data-overview-map-toggle]');
    if (overviewMapToggle) {
      const mode = overviewMapToggle.getAttribute('data-overview-map-toggle');
      store.setState({ overviewMapViewType: mode });
      return;
    }

    // Locate report pin on pothole map from table row (Screen 2 -> Screen 13)
    const locateReportBtn = target.closest('[data-locate-report]');
    if (locateReportBtn) {
      const code = locateReportBtn.getAttribute('data-locate-report');
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, selectedPinCode: code }
      }));
      store.navigateToScreen(13);
      return;
    }

    // Real Malolos Map (GPS) vs Schematic View Toggle (Screen 13)
    const mapViewToggle = target.closest('[data-map-view-toggle]');
    if (mapViewToggle) {
      const mode = mapViewToggle.getAttribute('data-map-view-toggle');
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, mapViewType: mode }
      }));
      return;
    }

    // Location Evidence Map View Toggle (Screen 3)
    const detailMapToggle = target.closest('[data-detail-map-toggle]');
    if (detailMapToggle) {
      const mode = detailMapToggle.getAttribute('data-detail-map-toggle');
      store.setState({ detailMapViewType: mode });
      return;
    }

    // Pin Selection on Map (Screen 13)
    const pinBtn = target.closest('[data-pin-select]');
    if (pinBtn) {
      const pinCode = pinBtn.getAttribute('data-pin-select');
      const mapEl = document.getElementById('malolos-leaflet-map');
      if (mapEl) {
        selectPotholeMapPin(pinCode);
      } else {
        store.setState((s) => ({
          mapFilters: { ...s.mapFilters, selectedPinCode: pinCode }
        }));
      }
      return;
    }

    // Reset Map Filters (Screen 13)
    const resetMapBtn = target.closest('#btn-reset-map-filters');
    if (resetMapBtn) {
      store.setState((s) => ({
        mapFilters: {
          search: '',
          status: 'All statuses',
          severity: 'All severities',
          jurisdiction: 'All jurisdictions',
          barangay: 'All barangays',
          modePill: 'All statuses',
          selectedPinCode: 'RW-2026-0842'
        }
      }));
      showToast('Map filters reset.');
      return;
    }

    // Clear Map Search (Screen 13)
    const clearMapSearchBtn = target.closest('[data-clear-map-search]');
    if (clearMapSearchBtn) {
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, search: '' }
      }));
      requestAnimationFrame(() => {
        const inp = document.getElementById('map-search-input');
        if (inp) inp.focus();
      });
      return;
    }

    // Save Supabase Configuration
    const saveSupabaseBtn = target.closest('#save-supabase-config-btn');
    if (saveSupabaseBtn) {
      const urlInput = document.getElementById('supabase-url-input');
      const keyInput = document.getElementById('supabase-key-input');
      const supabaseUrl = (urlInput?.value || '').trim();
      const supabaseAnonKey = (keyInput?.value || '').trim();

      if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
        showToast('Please enter a valid Supabase Project URL (e.g. https://xyz.supabase.co)', 'error');
        return;
      }
      if (supabaseAnonKey.length < 20) {
        showToast('Please enter your Supabase anon public API key.', 'error');
        return;
      }

      saveSupabaseConfig({ supabaseUrl, supabaseAnonKey });
      showToast('Supabase credentials saved! Connecting to cloud database...');
      supabaseSync.init(store);
      store.setState({ activeModal: null });
      return;
    }

    // Test Supabase Connection
    const testSupabaseBtn = target.closest('#test-supabase-conn-btn');
    if (testSupabaseBtn) {
      const urlInput = document.getElementById('supabase-url-input');
      const keyInput = document.getElementById('supabase-key-input');
      const supabaseUrl = (urlInput?.value || '').trim();
      const supabaseAnonKey = (keyInput?.value || '').trim();
      if (supabaseUrl && supabaseAnonKey) {
        saveSupabaseConfig({ supabaseUrl, supabaseAnonKey });
      }

      const resBox = document.getElementById('supabase-test-result');
      if (resBox) {
        resBox.classList.remove('hidden', 'bg-red-50', 'text-red-900', 'bg-emerald-50', 'text-emerald-900', 'border-red-200', 'border-emerald-200');
        resBox.classList.add('bg-slate-50', 'text-slate-800', 'border', 'border-slate-200');
        resBox.innerHTML = 'Testing connection to Supabase...';
      }

      const res = await supabaseSync.testConnection();
      if (resBox) {
        resBox.classList.remove('bg-slate-50', 'text-slate-800', 'border-slate-200');
        if (res.ok) {
          resBox.classList.add('bg-emerald-50', 'text-emerald-900', 'border', 'border-emerald-200');
          resBox.innerHTML = `✅ ${res.message}`;
        } else {
          resBox.classList.add('bg-red-50', 'text-red-900', 'border', 'border-red-200');
          resBox.innerHTML = `❌ Connection failed: ${res.message}`;
        }
      }
      return;
    }

    // 12. Edit Personnel Availability Pills
    if (target.hasAttribute('data-select-availability')) {
      const availability = target.getAttribute('data-select-availability');
      store.setState((s) => ({
        editPersonnelForm: { ...s.editPersonnelForm, availability }
      }));
      return;
    }

    // 12b. Add Personnel Invitation Settings (Screen 16: Crew / Lead pills & Email toggle)
    const persPillBtn = target.closest('[data-select-pers-pill]');
    if (persPillBtn) {
      const pillType = persPillBtn.getAttribute('data-select-pers-pill');
      const role = pillType === 'Lead' ? 'Maintenance lead' : 'Maintenance crew';
      store.setState((s) => ({
        addPersonnelForm: {
          ...s.addPersonnelForm,
          crewOrLeadPill: pillType,
          role
        }
      }));
      return;
    }

    const persInviteToggle = target.closest('[data-toggle-pers-invite]');
    if (persInviteToggle) {
      store.setState((s) => ({
        addPersonnelForm: {
          ...s.addPersonnelForm,
          sendEmail: !s.addPersonnelForm.sendEmail
        }
      }));
      return;
    }

    // 13. Users Role Tabs (Screen 18)
    const userTabBtn = target.closest('[data-user-tab]');
    if (userTabBtn) {
      const tab = userTabBtn.getAttribute('data-user-tab');
      store.setState((s) => ({
        userFilters: { ...s.userFilters, tab }
      }));
      return;
    }

    // 14. User Account Status Controls (Screen 19)
    const selectStatusBtn = target.closest('[data-select-user-status]');
    if (selectStatusBtn) {
      const selectedStatus = selectStatusBtn.getAttribute('data-select-user-status');
      store.setState((s) => ({
        userStatusForm: { ...s.userStatusForm, selectedStatus }
      }));
      return;
    }
    const confirmUserStatusBtn = target.closest('#btn-confirm-user-status') || (target.id === 'btn-confirm-user-status' ? target : null);
    if (confirmUserStatusBtn) {
      const s = store.getState();
      const uf = s.userStatusForm;
      const selectedUserId = Number(s.selectedUserId) || 1;
      const targetUser = (s.users || []).find((u) => u.id === selectedUserId) || { name: 'User' };
      try {
        await apiService.updateUserStatus(selectedUserId, {
          targetStatus: uf.selectedStatus,
          reason: uf.reason,
          acknowledgePrivilegeSeparation: uf.acknowledgePrivilegeSeparation
        });
      } catch {
        // Fallback
      }
      store.setState((prev) => ({
        userStatusForm: {
          ...prev.userStatusForm,
          currentStatus: uf.selectedStatus
        },
        users: (prev.users || []).map((u) => u.id === selectedUserId ? { ...u, status: uf.selectedStatus } : u)
      }));
      supabaseSync.updateUser(selectedUserId, {
        status: uf.selectedStatus,
        email: targetUser.email,
        name: targetUser.name
      });
      showToast(`Account status for ${targetUser.name} updated to ${uf.selectedStatus}.`);
      return;
    }
    if (target.hasAttribute('data-reset-user-status')) {
      store.setState((s) => ({
        userStatusForm: {
          ...s.userStatusForm,
          selectedStatus: s.userStatusForm.currentStatus,
          reason: '',
          reasonTouched: false,
          acknowledgePrivilegeSeparation: false
        }
      }));
      return;
    }

    // 15. Date-Range Modal Reset (Screen 21)
    if (target.hasAttribute('data-reset-dates')) {
      store.setState((s) => ({
        analyticsState: {
          ...s.analyticsState,
          fromDate: '19 Oct 2026',
          toDate: '21 Oct 2026'
        }
      }));
      return;
    }

    // 16. Export CSV / PDF Format & Scope toggles
    if (target.hasAttribute('data-export-format')) {
      const format = target.getAttribute('data-export-format');
      store.setState((s) => ({
        exportForm: { ...s.exportForm, format }
      }));
      return;
    }
    if (target.hasAttribute('data-export-scope')) {
      const scope = target.getAttribute('data-export-scope');
      store.setState((s) => ({
        exportForm: { ...s.exportForm, scope }
      }));
      return;
    }

    // 17. Universal Export Actions: PDF document and Excel (.xls) / CSV downloads
    function downloadCurrentPdfExport() {
      const s = store.getState();
      const totalCount = s.reports?.length || 1284;
      const resolvedCount = s.reports?.filter((r) => r.status === 'Resolved').length || 620;
      const inProgCount = s.reports?.filter((r) => r.status === 'In Progress').length || 382;
      const assignedCount = s.reports?.filter((r) => r.status === 'Assigned').length || 244;

      triggerLocalPdfDownload('LUBA_canFindIT_Malolos_2026-10-21_Summary.pdf', s.reports, {
        date: '21 October 2026',
        kpis: {
          total: totalCount,
          resolved: resolvedCount,
          inProgress: inProgCount,
          assigned: assignedCount
        }
      });
      showToast('Analytical PDF summary document (.pdf) downloaded.', 'success');
    }

    function downloadCurrentExcelCsvExport() {
      const s = store.getState();
      const includePii = s.exportForm?.includeCitizenPii || false;
      // Download formatted Excel Worksheet (.xls) which opens natively in Microsoft Excel
      triggerLocalExcelDownload('LUBA_canFindIT_Malolos_2026-10-21.xls', s.reports, includePii);
      // Also download CSV format with UTF-8 BOM
      triggerLocalCsvDownload('LUBA_canFindIT_Malolos_2026-10-21.csv', s.reports, includePii);
      showToast('Excel spreadsheet (.xls) & CSV files downloaded.', 'success');
    }

    // Direct Local Machine Excel / CSV Download (Screen 24: "Download CSV")
    if (target.id === 'btn-download-local-csv') {
      downloadCurrentExcelCsvExport();
      return;
    }

    // Direct Local Machine PDF Summary Download (Screen 24: "Download PDF summary")
    if (target.id === 'btn-download-local-pdf') {
      downloadCurrentPdfExport();
      return;
    }

    // Screen 20 Analytics Top Header: "Export CSV"
    if (target.id === 'btn-analytics-export-csv') {
      downloadCurrentExcelCsvExport();
      store.setState((s) => ({
        activeModal: 'export_success',
        exportForm: { ...s.exportForm, format: 'CSV' }
      }));
      return;
    }

    // Screen 20 Analytics Top Header: "Export PDF"
    if (target.id === 'btn-analytics-export-pdf') {
      downloadCurrentPdfExport();
      store.setState((s) => ({
        activeModal: 'export_success',
        exportForm: { ...s.exportForm, format: 'PDF' }
      }));
      return;
    }

    // Screen 22 Export Modal ("Generate PDF" or "Generate Excel / CSV") & Screen 23 ("Retry generation")
    if (target.id === 'btn-submit-generate-export' || target.id === 'btn-retry-generate-export') {
      const s = store.getState();
      if (s.exportForm?.format === 'PDF') {
        downloadCurrentPdfExport();
      } else {
        downloadCurrentExcelCsvExport();
      }
      store.setState({ activeModal: 'export_success' });
      return;
    }

    // 19. Profile & Workspace Toggle Switches
    const toggleProfileBtn = target.closest('[data-toggle-profile]');
    if (toggleProfileBtn) {
      const key = toggleProfileBtn.getAttribute('data-toggle-profile');
      store.setState((s) => ({
        adminProfileForm: {
          ...s.adminProfileForm,
          [key]: !s.adminProfileForm[key]
        }
      }));
      return;
    }

    // Save Admin Profile Preferences (Screen 25)
    const saveProfileBtn = target.closest('[data-save-profile]');
    if (saveProfileBtn) {
      const s = store.getState();
      const pf = s.adminProfileForm;

      // Extract latest values directly from DOM inputs or fallback to state
      const nameInput = document.getElementById('profile-fullname');
      const emailInput = document.getElementById('profile-email');
      const roleInput = document.getElementById('profile-role');
      const deptInput = document.getElementById('profile-department');

      const fullName = (nameInput ? nameInput.value.trim() : pf.fullName) || 'Ana Dela Cruz';
      const email = (emailInput ? emailInput.value.trim() : pf.email) || 'ana.delacruz@example.com';
      const role = (roleInput ? roleInput.value.trim() : pf.role) || 'LGU administrator · Quezon City';
      const department = (deptInput ? deptInput.value.trim() : pf.department) || 'City Engineering';

      try {
        await apiService.updateAdminProfile({
          fullName,
          email,
          role,
          department,
          reviewQueueAlerts: pf.reviewQueueAlerts,
          completionReviewAlerts: pf.completionReviewAlerts,
          dailyEmailSummary: pf.dailyEmailSummary
        });
      } catch (err) {
        console.warn('Backend updateAdminProfile fallback:', err);
      }

      // Update topbar header avatar name and role if present
      const topbarName = document.getElementById('topbar-admin-name');
      if (topbarName) topbarName.textContent = fullName;
      const topbarRole = document.getElementById('topbar-admin-role');
      if (topbarRole) topbarRole.textContent = role;

      const now = new Date();
      const phtTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' PHT';

      store.setState((prev) => ({
        adminProfileForm: {
          ...prev.adminProfileForm,
          fullName,
          email,
          role,
          department,
          savedBannerVisible: true,
          feedbackTitle: 'Preferences saved · sample feedback',
          feedbackBody: `${fullName} · Personal notifications updated ${phtTime}. Workspace rules are unchanged.`
        }
      }));

      // Synchronize Admin Profile live to Supabase
      supabaseSync.updateUser(3, {
        fullName,
        email,
        role,
        department
      });
      supabaseSync.updateSettings('adminProfile', {
        fullName,
        email,
        role,
        department,
        reviewQueueAlerts: pf.reviewQueueAlerts,
        completionReviewAlerts: pf.completionReviewAlerts,
        dailyEmailSummary: pf.dailyEmailSummary,
        updatedAt: new Date().toISOString()
      });

      showToast('Preferences saved successfully.', 'success');
      return;
    }

    // Save Workspace Settings (Screen 26)
    const saveWsBtn = target.closest('[data-save-workspace]');
    if (saveWsBtn) {
      const ws = store.getState().workspaceSettingsForm;
      supabaseSync.updateSettings('workspace', ws);
      showToast('Workspace settings saved & synchronized live to Supabase.', 'success');
      return;
    }

    // Change Password Action
    const changePasswordBtn = target.closest('[data-change-password]');
    if (changePasswordBtn) {
      showToast('Password management is handled by your enterprise identity provider.', 'info');
      return;
    }
    if (target.hasAttribute('data-toggle-ws')) {
      const key = target.getAttribute('data-toggle-ws');
      store.setState((s) => ({
        workspaceSettingsForm: {
          ...s.workspaceSettingsForm,
          [key]: !s.workspaceSettingsForm[key]
        }
      }));
      return;
    }
    if (target.hasAttribute('data-ws-tab')) {
      const activeTab = target.getAttribute('data-ws-tab');
      store.setState((s) => ({
        workspaceSettingsForm: {
          ...s.workspaceSettingsForm,
          activeTab
        }
      }));
      return;
    }

    // Analytics Tabs (Screen 20: Overview, By barangay, Team performance)
    const analyticsTabBtn = target.closest('[data-analytics-tab]');
    if (analyticsTabBtn) {
      const subTab = analyticsTabBtn.getAttribute('data-analytics-tab');
      store.setState((s) => ({
        analyticsState: {
          ...s.analyticsState,
          subTab
        }
      }));
      return;
    }

    // 20. Save & Send Personnel Invitation (Screen 16)
    const saveInviteBtn = target.closest('#btn-save-invite-personnel') || (target.id === 'btn-save-invite-personnel' ? target : null);
    if (saveInviteBtn) {
      // Capture live DOM values in case user just typed
      const nameInput = document.getElementById('add-pers-name');
      const emailInput = document.getElementById('add-pers-email');
      const mobileInput = document.getElementById('add-pers-mobile');
      const roleSelect = document.getElementById('add-pers-role');
      const teamSelect = document.getElementById('add-pers-team');

      const formState = store.getState().addPersonnelForm;
      const cleanName = (nameInput ? nameInput.value : formState.fullName || '').trim();
      const cleanEmail = (emailInput ? emailInput.value : formState.email || '').trim();
      const cleanMobile = (mobileInput ? mobileInput.value : formState.mobileNumber || '').trim();
      const selectedRole = roleSelect ? roleSelect.value : formState.role || 'Citizen';
      const isCitizen = selectedRole === 'Citizen';
      const selectedTeam = isCitizen ? 'None (Citizen / General)' : (teamSelect ? teamSelect.value : formState.team || 'Malolos Team Alpha');

      if (!cleanName || !cleanEmail) {
        showToast('Please provide a full name and work email address.', 'error');
        return;
      }

      if (!PH_MOBILE_REGEX.test(cleanMobile)) {
        showToast('Please enter a valid Philippine mobile number (e.g. +63 917 000 0215).', 'error');
        return;
      }

      const roleSlug = selectedRole === 'Citizen'
        ? 'citizen'
        : (selectedRole === 'Maintenance team'
            ? 'maintenance_lead'
            : (selectedRole === 'LGU administrator' ? 'lgu_admin' : 'maintenance_crew'));

      const teamId = selectedTeam.includes('Bravo') ? 2 : 1;

      let savedDbUser = null;
      try {
        savedDbUser = await apiService.invitePersonnel({
          fullName: cleanName,
          email: cleanEmail,
          mobileNumber: cleanMobile,
          roleSlug,
          teamId,
          area: selectedTeam,
          departmentOrArea: selectedTeam
        });
      } catch (err) {
        console.warn('Backend API invite fallback to Supabase:', err);
      }

      // Add to reactive store so it appears immediately in the table on Screen 18 and Screen 15
      const newUser = {
        id: savedDbUser?.userId || Date.now(),
        name: cleanName,
        role: selectedRole,
        email: cleanEmail,
        mobile: cleanMobile,
        area: selectedTeam,
        department: selectedTeam,
        status: savedDbUser?.accountStatus || 'Active'
      };

      store.setState((s) => ({
        users: [newUser, ...s.users],
        teamAlphaCrew: selectedRole.includes('Maintenance')
          ? [{ name: cleanName, specialty: 'General repair', availability: 'On duty' }, ...s.teamAlphaCrew]
          : s.teamAlphaCrew
      }));

      // Synchronize newly added personnel live to Supabase
      supabaseSync.createUser(newUser);

      // If personnel is in maintenance, update the team crewSize in Supabase
      if (selectedRole.includes('Maintenance')) {
        const allTeams = store.getState().teams || [];
        const matched = allTeams.find((t) => t.title === selectedTeam || t.code === selectedTeam);
        const teamCode = matched ? matched.code : (selectedTeam.includes('Bravo') ? 'MALOLOS-BRAVO' : 'MALOLOS-ALPHA');
        const crewCount = store.getState().teamAlphaCrew.length;
        const crewSize = `${crewCount} maintenance personnel`;
        supabaseSync.updateTeam(teamCode, { crewSize });
      }

      showToast(`Personnel invitation sent to ${cleanName}.`, 'success');
      store.navigateToScreen(15);
      return;
    }

    // 20b. Send Staff Invitation from Users Modal (Screen 18)
    const modalInviteBtn = target.closest('#btn-submit-modal-invite') || (target.id === 'btn-submit-modal-invite' ? target : null);
    if (modalInviteBtn) {
      const nameInput = document.getElementById('modal-staff-name');
      const emailInput = document.getElementById('modal-staff-email');
      const roleSelect = document.getElementById('modal-staff-role');
      const areaInput = document.getElementById('modal-staff-area');

      const cleanName = (nameInput ? nameInput.value : '').trim();
      const cleanEmail = (emailInput ? emailInput.value : '').trim();
      const selectedRole = roleSelect ? roleSelect.value : 'LGU reviewer';
      const cleanArea = (areaInput ? areaInput.value : 'City Engineering Office').trim();

      if (!cleanName || !cleanEmail) {
        showToast('Please provide a full name and work email address.', 'error');
        return;
      }

      const roleSlug = selectedRole === 'LGU administrator'
        ? 'lgu_admin'
        : (selectedRole === 'Maintenance lead'
            ? 'maintenance_lead'
            : (selectedRole === 'Maintenance crew' ? 'maintenance_crew' : 'lgu_reviewer'));

      try {
        await apiService.invitePersonnel({
          fullName: cleanName,
          email: cleanEmail,
          roleSlug,
          area: cleanArea,
          departmentOrArea: cleanArea
        });
      } catch (err) {
        console.warn('Backend invite fallback:', err);
      }

      const newStaff = {
        id: Date.now(),
        name: cleanName,
        role: selectedRole,
        email: cleanEmail,
        mobile: '+63 917 000 0215',
        area: cleanArea,
        department: cleanArea,
        status: 'Invited'
      };

      store.setState((s) => ({
        users: [newStaff, ...s.users],
        activeModal: null
      }));

      // Synchronize newly invited staff live to Supabase
      supabaseSync.createUser(newStaff);

      showToast(`Invitation sent to ${cleanName}.`, 'success');
      return;
    }

    // 21. Save Personnel Changes (Screen 17)
    const saveEditBtn = target.closest('[data-save-personnel]') || (target.hasAttribute('data-save-personnel') ? target : null);
    if (saveEditBtn) {
      const nameInput = document.getElementById('edit-pers-name');
      const emailInput = document.getElementById('edit-pers-email');
      const mobileInput = document.getElementById('edit-pers-mobile');
      const roleSelect = document.getElementById('edit-pers-role');
      const teamSelect = document.getElementById('edit-pers-team');

      const f = store.getState().editPersonnelForm;
      const cleanName = (nameInput ? nameInput.value : f.fullName || '').trim() || 'Engr. Paolo Santos';
      const cleanEmail = (emailInput ? emailInput.value : f.email || '').trim() || 'paolo.santos@malolos.gov.ph';
      const cleanMobile = (mobileInput ? mobileInput.value : f.mobileNumber || '').trim();
      const selectedRole = roleSelect ? roleSelect.value : f.role || 'Maintenance lead';
      const isCitizen = selectedRole === 'Citizen';
      const selectedTeam = isCitizen ? 'None (Citizen / General)' : (teamSelect ? teamSelect.value : f.team || 'Malolos Team Alpha');

      try {
        await apiService.updatePersonnel(4, {
          fullName: cleanName,
          email: cleanEmail,
          mobileNumber: cleanMobile,
          role: selectedRole,
          team: selectedTeam,
          availabilityStatus: f.availability || 'On duty'
        });
      } catch (err) {
        console.warn('Backend API updatePersonnel error or offline fallback:', err);
      }

      store.setState((s) => ({
        teamAlphaCrew: s.teamAlphaCrew.map((c) =>
          c.name.includes('Paolo') ? { ...c, availability: f.availability || 'On duty' } : c
        ),
        users: s.users.map((u) =>
          u.name.includes('Paolo') ? { ...u, role: selectedRole, area: selectedTeam, department: selectedTeam, email: cleanEmail } : u
        )
      }));

      // Synchronize updated personnel live to Supabase
      supabaseSync.updateUser(4, {
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        role: selectedRole,
        area: selectedTeam,
        department: selectedTeam
      });

      // Synchronize team lead & availability to Supabase
      const allTeams = store.getState().teams || [];
      const matched = allTeams.find((t) => t.title === selectedTeam || t.code === selectedTeam);
      const teamCode = matched ? matched.code : (selectedTeam.includes('Bravo') ? 'MALOLOS-BRAVO' : 'MALOLOS-ALPHA');
      supabaseSync.updateTeam(teamCode, {
        lead: cleanName
      });

      showToast(`Personnel changes for ${cleanName} saved.`);
      store.navigateToScreen(15);
      return;
    }

    // 22. Create Maintenance Team (create_team view)
    const saveTeamBtn = target.closest('#btn-save-new-team');
    if (saveTeamBtn) {
      const nameInput = document.getElementById('team-create-name');
      const districtSelect = document.getElementById('team-create-district');
      const leadSelect = document.getElementById('team-create-lead');
      const areaInput = document.getElementById('team-create-area');
      const specialtySelect = document.getElementById('team-create-specialty');
      const hoursInput = document.getElementById('team-create-hours');

      const tf = store.getState().createTeamForm || {};
      const cleanTeamName = (nameInput ? nameInput.value : tf.teamName || '').trim();
      const cleanDistrict = districtSelect ? districtSelect.value : tf.district || 'Highway / Commercial Corridor';
      const cleanLead = leadSelect ? leadSelect.value : tf.leadName || 'Engr. Paolo Santos';
      const cleanArea = (areaInput ? areaInput.value : tf.serviceArea || '').trim();
      const cleanSpecialty = specialtySelect ? specialtySelect.value : tf.specialty || 'Asphalt patching & concrete re-blocking';
      const cleanHours = (hoursInput ? hoursInput.value : tf.serviceHours || '7:00 AM–4:00 PM PHT').trim();

      const finalTeamName = cleanTeamName || `Malolos Team ${String.fromCharCode(65 + (store.getState().teams?.length || 4))}`;
      const finalArea = cleanArea || `${cleanDistrict} (General Coverage Zone)`;

      const rawSlug = finalTeamName.toUpperCase().replace(/^MALOLOS\s*(TEAM)?\s*/i, '').replace(/[^A-Z0-9]/g, '');

      // Refresh remote teams first so the new code never collides with (and overwrites) an existing team
      try { await supabaseSync.fetchTeams(store, true); } catch (_) {}
      const takenCodes = new Set((store.getState().teams || []).map((t) => t.code));
      const baseCode = `MALOLOS-${rawSlug || Date.now().toString().slice(-4)}`;
      let teamCode = baseCode;
      let suffix = 2;
      while (takenCodes.has(teamCode)) {
        teamCode = `${baseCode}-${suffix++}`;
      }
      const newTeamObj = {
        code: teamCode,
        title: finalTeamName,
        lead: cleanLead,
        serviceArea: `${cleanDistrict} (${finalArea})`,
        crewSize: '4 maintenance personnel',
        specialty: cleanSpecialty,
        workload: '0 assigned · 0 in progress',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Save to Supabase first; only report success once Supabase confirms the row
      saveTeamBtn.disabled = true;
      try {
        await supabaseSync.createTeam(newTeamObj);
        console.log('[App] New team synced to Supabase:', newTeamObj.code);
      } catch (err) {
        console.error('[App] Team sync failed:', err);
        saveTeamBtn.disabled = false;
        showToast(`Team was NOT saved to Supabase: ${err.message || 'connection error'}. Please try again.`, 'error');
        return;
      }

      // 2. Update local application store now that Supabase has the team
      store.setState((s) => ({
        teams: [...s.teams.filter((t) => t.code !== newTeamObj.code), newTeamObj],
        createTeamForm: {
          teamName: '',
          district: 'Highway / Commercial Corridor',
          leadName: 'Engr. Paolo Santos',
          serviceArea: '',
          specialty: 'Asphalt patching & concrete re-blocking',
          serviceHours: '7:00 AM–4:00 PM PHT'
        }
      }));

      // 3. Asynchronously sync to MySQL backend database (non-blocking)
      apiService.createTeam({
        teamName: cleanTeamName || finalTeamName,
        teamCode: newTeamObj.code,
        districtName: cleanDistrict,
        serviceAreaDescription: cleanArea,
        specialty: cleanSpecialty,
        leadUserId: cleanLead.includes('Jessa') ? 9 : 4
      }).catch((err) => {
        console.warn('Backend API createTeam notice:', err);
      });

      showToast(`Maintenance team "${cleanTeamName}" created & synchronized to Supabase.`, 'success');
      store.navigateToScreen(14);
      return;
    }
  });

  let searchDebounceTimer = null;

  // Form input listeners (Local state management, avoiding heavy un-debounced network keystroke sync)
  document.addEventListener('input', (e) => {
    const el = e.target;

    // Admin Profile Form inputs (Screen 25 - silent state update to prevent focus loss)
    if (el.id === 'profile-fullname') {
      const val = el.value;
      store.setSilentState((s) => ({
        adminProfileForm: { ...s.adminProfileForm, fullName: val }
      }));
      const heading = document.getElementById('profile-heading-name');
      if (heading) heading.textContent = val.trim() || 'Administrator';
      return;
    }

    if (el.id === 'profile-email') {
      store.setSilentState((s) => ({
        adminProfileForm: { ...s.adminProfileForm, email: el.value }
      }));
      return;
    }

    if (el.id === 'profile-role') {
      store.setSilentState((s) => ({
        adminProfileForm: { ...s.adminProfileForm, role: el.value }
      }));
      return;
    }

    if (el.id === 'profile-department') {
      store.setSilentState((s) => ({
        adminProfileForm: { ...s.adminProfileForm, department: el.value }
      }));
      return;
    }

    if (el.id === 'add-pers-name') {
      store.setSilentState((s) => ({
        addPersonnelForm: { ...s.addPersonnelForm, fullName: el.value }
      }));
      return;
    }

    if (el.id === 'add-pers-email') {
      store.setSilentState((s) => ({
        addPersonnelForm: { ...s.addPersonnelForm, email: el.value }
      }));
      return;
    }

    if (el.id === 'edit-pers-name') {
      store.setSilentState((s) => ({
        editPersonnelForm: { ...s.editPersonnelForm, fullName: el.value }
      }));
      return;
    }

    if (el.id === 'edit-pers-email') {
      store.setSilentState((s) => ({
        editPersonnelForm: { ...s.editPersonnelForm, email: el.value }
      }));
      return;
    }

    if (el.id === 'edit-pers-mobile') {
      store.setSilentState((s) => ({
        editPersonnelForm: { ...s.editPersonnelForm, mobileNumber: el.value }
      }));
      return;
    }

    // Create Team Form inputs (silent update to prevent focus loss)
    if (el.id === 'team-create-name') {
      store.setSilentState((s) => ({
        createTeamForm: { ...s.createTeamForm, teamName: el.value }
      }));
      return;
    }

    if (el.id === 'team-create-area') {
      store.setSilentState((s) => ({
        createTeamForm: { ...s.createTeamForm, serviceArea: el.value }
      }));
      return;
    }

    if (el.id === 'team-create-hours') {
      store.setSilentState((s) => ({
        createTeamForm: { ...s.createTeamForm, serviceHours: el.value }
      }));
      return;
    }

    // Screen 16: Live PH Mobile Number Validation (direct DOM update without focus-stealing re-render)
    if (el.id === 'add-pers-mobile') {
      const val = el.value;
      store.setSilentState((s) => ({
        addPersonnelForm: { ...s.addPersonnelForm, mobileNumber: val }
      }));
      const isValid = PH_MOBILE_REGEX.test(val.trim());
      const box = document.getElementById('add-pers-mobile-box');
      const msg = document.getElementById('add-pers-mobile-msg');
      if (box) {
        box.className = isValid ? 'luba-field-box' : 'luba-field-box-error';
      }
      if (msg) {
        msg.className = `text-xs ${isValid ? 'text-luba-success' : 'text-luba-danger'} mt-1.5`;
        msg.textContent = isValid
          ? 'Valid Philippine mobile number format confirmed.'
          : 'Enter a complete Philippine mobile number, for example +63 917 000 0215.';
      }
      return;
    }

    // Screen 2: Reports search (debounced to allow continuous fluid typing)
    if (el.id === 'reports-search-input') {
      const val = el.value;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        store.setState((s) => ({
          reportFilters: { ...s.reportFilters, search: val }
        }));
        requestAnimationFrame(() => {
          const updatedInput = document.getElementById('reports-search-input');
          if (updatedInput) {
            updatedInput.focus();
            updatedInput.setSelectionRange(val.length, val.length);
          }
        });
      }, 250);
      return;
    }

    // Screen 13: Map search road or report ID (debounced)
    if (el.id === 'map-search-input') {
      const val = el.value;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        store.setState((s) => ({
          mapFilters: { ...s.mapFilters, search: val }
        }));
        requestAnimationFrame(() => {
          const updatedInput = document.getElementById('map-search-input');
          if (updatedInput) {
            updatedInput.focus();
            updatedInput.setSelectionRange(val.length, val.length);
          }
        });
      }, 120);
      return;
    }

    // Screen 14: Teams search (debounced)
    if (el.id === 'teams-search-input') {
      const val = el.value;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        store.setState((s) => ({
          teamFilters: { ...s.teamFilters, search: val }
        }));
        requestAnimationFrame(() => {
          const updatedInput = document.getElementById('teams-search-input');
          if (updatedInput) {
            updatedInput.focus();
            updatedInput.setSelectionRange(val.length, val.length);
          }
        });
      }, 250);
      return;
    }

    // Screen 18: Users search (debounced fluid typing)
    if (el.id === 'users-search-input') {
      const val = el.value;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        store.setState((s) => ({
          userFilters: { ...s.userFilters, search: val }
        }));
        requestAnimationFrame(() => {
          const updatedInput = document.getElementById('users-search-input');
          if (updatedInput) {
            updatedInput.focus();
            updatedInput.setSelectionRange(val.length, val.length);
          }
        });
      }, 250);
      return;
    }

    // Screen 19: Citizen Account Status Reason (silent update)
    if (el.id === 'user-status-reason') {
      store.setSilentState((s) => ({
        userStatusForm: {
          ...s.userStatusForm,
          reason: el.value,
          reasonTouched: true
        }
      }));
      return;
    }

    // Verification Review Notes (Screen 4 & 5)
    if (el.id === 'verify-notes-input') {
      store.setSilentState((s) => ({
        verificationForm: { ...s.verificationForm, notes: el.value }
      }));
      return;
    }

    if (el.id === 'approve-modal-notes') {
      store.setSilentState((s) => ({
        verificationForm: { ...s.verificationForm, modalNotes: el.value }
      }));
      return;
    }

    // Team Assignment Unit Select (Screen 9)
    if (el.id === 'assign-team-select') {
      const selectedTitle = el.value;
      const allTeams = store.getState().teams || [];
      const matched = allTeams.find((t) => t.title === selectedTitle || t.code === selectedTitle);
      store.setState((s) => ({
        assignmentForm: {
          ...s.assignmentForm,
          teamName: matched?.title || selectedTitle,
          leadName: matched?.lead || (selectedTitle.includes('DPWH') ? 'DEO Liaison Contact' : 'Maintenance Lead'),
          teamCode: matched?.code || ''
        }
      }));
      return;
    }

    // Team Assignment Instructions (Screen 9 & 10)
    if (el.id === 'assign-instructions-input') {
      store.setSilentState((s) => ({
        assignmentForm: { ...s.assignmentForm, instructions: el.value }
      }));
      return;
    }

    // Repair Completion Review Notes (Screen 11)
    if (el.id === 'repair-completion-notes') {
      store.setSilentState((s) => ({
        completionForm: { ...s.completionForm, reviewNotes: el.value }
      }));
      return;
    }

    // Duplicate Comparison Notes (Screen 8)
    if (el.id === 'duplicate-compare-notes') {
      store.setSilentState((s) => ({
        duplicateCompareForm: { ...s.duplicateCompareForm, reason: el.value }
      }));
      return;
    }

    // Outcome Modal Rejection & Duplicate Reasons (Screen 6 & 7)
    if (el.id === 'outcome-rejection-reason') {
      store.setSilentState((s) => ({
        outcomeModal: { ...s.outcomeModal, rejectionReason: el.value }
      }));
      return;
    }

    if (el.id === 'outcome-duplicate-reason') {
      store.setSilentState((s) => ({
        outcomeModal: { ...s.outcomeModal, duplicateReason: el.value }
      }));
      return;
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (!el) return;

    if (el.id === 'assign-team-select') {
      const selectedTitle = el.value;
      const allTeams = store.getState().teams || [];
      const matched = allTeams.find((t) => t.title === selectedTitle || t.code === selectedTitle);
      store.setState((s) => ({
        assignmentForm: {
          ...s.assignmentForm,
          teamName: matched?.title || selectedTitle,
          leadName: matched?.lead || (selectedTitle.includes('DPWH') ? 'DEO Liaison Contact' : 'Maintenance Lead'),
          teamCode: matched?.code || ''
        }
      }));
      return;
    }

    if (el.id === 'reports-status-select') {
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, status: el.value }
      }));
      return;
    }

    if (el.id === 'users-role-select') {
      store.setState((s) => ({
        userFilters: { ...s.userFilters, role: el.value }
      }));
      return;
    }

    if (el.id === 'users-status-select') {
      store.setState((s) => ({
        userFilters: { ...s.userFilters, status: el.value }
      }));
      return;
    }

    // Screen 13: Map dropdown filters
    if (el.id === 'map-jurisdiction-select') {
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, jurisdiction: el.value }
      }));
      return;
    }

    if (el.id === 'map-severity-select') {
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, severity: el.value }
      }));
      return;
    }

    if (el.id === 'map-barangay-select') {
      store.setState((s) => ({
        mapFilters: { ...s.mapFilters, barangay: el.value }
      }));
      return;
    }

    // Screen 14: Teams dropdown filters
    if (el.id === 'teams-zone-select') {
      store.setState((s) => ({
        teamFilters: { ...s.teamFilters, district: el.value }
      }));
      return;
    }

    if (el.id === 'teams-status-select') {
      store.setState((s) => ({
        teamFilters: { ...s.teamFilters, status: el.value }
      }));
      return;
    }

    // Create Team Form dropdowns (silent update)
    if (el.id === 'team-create-district') {
      store.setSilentState((s) => ({
        createTeamForm: { ...s.createTeamForm, district: el.value }
      }));
      return;
    }

    if (el.id === 'team-create-lead') {
      store.setSilentState((s) => ({
        createTeamForm: { ...s.createTeamForm, leadName: el.value }
      }));
      return;
    }

    if (el.id === 'team-create-specialty') {
      store.setSilentState((s) => ({
        createTeamForm: { ...s.createTeamForm, specialty: el.value }
      }));
      return;
    }

    if (el.id === 'reports-severity-select') {
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, severity: el.value }
      }));
      return;
    }

    if (el.id === 'reports-jurisdiction-select') {
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, jurisdiction: el.value }
      }));
      return;
    }

    if (el.id === 'reports-barangay-select') {
      store.setState((s) => ({
        reportFilters: { ...s.reportFilters, barangay: el.value }
      }));
      return;
    }

    if (el.id === 'add-pers-role') {
      const isCitizen = el.value === 'Citizen';
      const isLead = el.value === 'Maintenance lead';
      store.setState((s) => ({
        addPersonnelForm: {
          ...s.addPersonnelForm,
          role: el.value,
          crewOrLeadPill: isLead ? 'Lead' : 'Crew',
          team: isCitizen ? 'None (Citizen / General)' : s.addPersonnelForm.team
        }
      }));
      return;
    }

    if (el.id === 'add-pers-team') {
      store.setState((s) => ({
        addPersonnelForm: { ...s.addPersonnelForm, team: el.value }
      }));
      return;
    }

    if (el.id === 'edit-pers-role') {
      const isCitizen = el.value === 'Citizen';
      store.setState((s) => ({
        editPersonnelForm: {
          ...s.editPersonnelForm,
          role: el.value,
          team: isCitizen ? 'None (Citizen / General)' : s.editPersonnelForm.team
        }
      }));
      return;
    }

    if (el.id === 'edit-pers-team') {
      store.setState((s) => ({
        editPersonnelForm: { ...s.editPersonnelForm, team: el.value }
      }));
      return;
    }

    if (el.id === 'audit-status-filter') {
      store.setState((s) => ({
        auditLogFilters: { ...s.auditLogFilters, status: el.value }
      }));
      return;
    }

    if (el.id === 'chk-priv-sep') {
      store.setState((s) => ({
        userStatusForm: {
          ...s.userStatusForm,
          acknowledgePrivilegeSeparation: el.checked
        }
      }));
      return;
    }

    if (el.id === 'chk-export-pii') {
      store.setState((s) => ({
        exportForm: {
          ...s.exportForm,
          includeCitizenPii: el.checked
        }
      }));
    }
  });

  // Global keydown listeners for quick search execution
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const el = e.target;
      if (el && el.id === 'map-search-input') {
        e.preventDefault();
        clearTimeout(searchDebounceTimer);
        const val = el.value.trim();
        store.setState((s) => ({
          mapFilters: { ...s.mapFilters, search: val }
        }));
        requestAnimationFrame(() => {
          const updatedInput = document.getElementById('map-search-input');
          if (updatedInput) {
            updatedInput.focus();
            updatedInput.setSelectionRange(val.length, val.length);
          }
        });
      }
    }
  });
}

async function bootApp() {
  window.lubaStore = store;
  window.lubaSupabase = supabaseSync;
  window.lubaShowToast = showToast;

  try {
    const rawUser = sessionStorage.getItem('luba_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const topbarName = document.getElementById('topbar-admin-name');
      if (topbarName && u.fullName) topbarName.textContent = u.fullName;
      const topbarRole = document.getElementById('topbar-admin-role');
      if (topbarRole && u.role) topbarRole.textContent = u.role;
    }
  } catch (_) {}

  try {
    attachGlobalEventListeners();
  } catch (listenerErr) {
    console.warn('attachGlobalEventListeners notice:', listenerErr);
  }

  try {
    initRouter();
  } catch (routerErr) {
    console.error('initRouter error:', routerErr);
  }

  // Initialize Supabase PostgreSQL & Storage Synchronization (Single Source of Truth)
  try {
    await supabaseSync.init(store);
  } catch (err) {
    console.warn('Supabase sync init error:', err);
  }

  // Sync users from MySQL database (phpMyAdmin)
  try {
    const res = await apiService.listUsers();
    if (res && Array.isArray(res.users) && res.users.length > 0) {
      const dbUsers = res.users.map((u) => ({
        id: u.user_id,
        name: u.full_name,
        email: u.email,
        mobile: u.mobile_number,
        role: u.role_display_name,
        area: u.department_or_area || 'City of Malolos',
        department: u.department_or_area || 'City of Malolos',
        status: u.account_status
      }));
      store.setState((s) => {
        const existingEmails = new Set(s.users.map((x) => x.email.toLowerCase()));
        const newFromDb = dbUsers.filter((x) => !existingEmails.has(x.email.toLowerCase()));
        return { users: [...newFromDb, ...s.users] };
      });
    }
  } catch (err) {
    console.warn('Initial MySQL sync note:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  // DOM is already ready (e.g. async module evaluation or cached load)
  bootApp();
}
