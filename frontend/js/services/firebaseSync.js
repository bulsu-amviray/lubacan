// Real-time synchronization service connecting LUBA CanFindIT Admin to Firebase Realtime Database.
// Synchronizes reports, teams, and users live across Web Admin, Citizen Mobile App, and Maintenance Mobile App.

import { getActiveFirebaseConfig, isConfigValid } from '../config/firebase.config.js';
import { initialReports, initialTeams, initialUsers } from '../data/reports.js';

let firebaseApp = null;
let realtimeDb = null;
let isInitialized = false;
let isConnected = false;
let reportsListenerActive = false;
let isRemoteFirebaseUpdate = false;

export function getRemoteFirebaseUpdateFlag() {
  return isRemoteFirebaseUpdate;
}

export function setRemoteFirebaseUpdateFlag(val) {
  isRemoteFirebaseUpdate = val;
}

// Standard notification / toast dispatcher
function notifyUser(msg) {
  if (typeof window !== 'undefined' && window.lubaShowToast) {
    window.lubaShowToast(msg);
  }
}

export const firebaseSync = {
  isConfigured() {
    const cfg = getActiveFirebaseConfig();
    return isConfigValid(cfg);
  },

  isConnected() {
    return isConnected;
  },

  getDb() {
    return realtimeDb;
  },

  init(store) {
    if (typeof window === 'undefined') return;

    if (typeof window.firebase === 'undefined') {
      console.info('[Firebase] Waiting for Firebase Web SDK script to load...');
      setTimeout(() => this.init(store), 200);
      return;
    }

    if (isInitialized && realtimeDb) {
      return;
    }

    const config = getActiveFirebaseConfig();

    if (!isConfigValid(config)) {
      console.info('[Firebase] Realtime Database config pending. Operating in local / offline mode.');
      store.setState({
        firebaseStatus: {
          connected: false,
          configured: false,
          databaseURL: config.databaseURL || null
        }
      });
      return;
    }

    try {
      // Avoid duplicate initialization
      if (!window.firebase.apps.length) {
        firebaseApp = window.firebase.initializeApp(config);
      } else {
        firebaseApp = window.firebase.app();
      }

      realtimeDb = window.firebase.database();
      isInitialized = true;

      // Monitor connection state (.info/connected)
      const connectedRef = realtimeDb.ref('.info/connected');
      connectedRef.on('value', (snap) => {
        isConnected = snap.val() === true;
        console.log(`[Firebase RTDB] Connection state changed: ${isConnected ? 'ONLINE (Sync Active)' : 'OFFLINE'}`);
        store.setState((s) => ({
          firebaseStatus: {
            ...s.firebaseStatus,
            connected: isConnected,
            configured: true,
            databaseURL: config.databaseURL
          }
        }));
      });

      // Bind realtime listeners for reports, teams, users, and settings
      this.attachListeners(store);

      // Automatically ensure initial missing data is populated in Firebase with zero manual steps
      this.ensureInitialDataSeeded();

    } catch (err) {
      console.error('[Firebase] Initialization error:', err);
      store.setState({
        firebaseStatus: {
          connected: false,
          configured: true,
          error: err.message
        }
      });
    }
  },

  async ensureInitialDataSeeded() {
    if (typeof window !== 'undefined' && (sessionStorage.getItem('luba_fb_seed_done') || localStorage.getItem('luba_fb_seed_done'))) {
      return;
    }
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');

    try {
      // 1. Ensure teams exist in Firebase
      const res = await fetch(`${baseUrl}/teams.json`);
      const teams = await res.json();
      if (!teams || Object.keys(teams).length === 0) {
        console.log('[Firebase Auto-Seed] Populating initial teams into Firebase RTDB...');
        const teamsObj = {};
        initialTeams.forEach((t) => {
          teamsObj[t.code] = t;
        });
        await fetch(`${baseUrl}/teams.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamsObj)
        });
      }

      // 2. Ensure reports exist in Firebase
      const rRes = await fetch(`${baseUrl}/reports.json`);
      const reports = await rRes.json();
      if (!reports || Object.keys(reports).length === 0) {
        console.log('[Firebase Auto-Seed] Populating initial reports into Firebase RTDB...');
        const reportsObj = {};
        initialReports.forEach((r) => {
          reportsObj[r.code] = r;
        });
        await fetch(`${baseUrl}/reports.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportsObj)
        });
      }

      // 3. Ensure users exist in Firebase
      const uRes = await fetch(`${baseUrl}/users.json`);
      const users = await uRes.json();
      if (!users || Object.keys(users).length === 0) {
        console.log('[Firebase Auto-Seed] Populating initial users into Firebase RTDB...');
        const usersObj = {};
        initialUsers.forEach((u) => {
          usersObj[u.id] = u;
        });
        await fetch(`${baseUrl}/users.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usersObj)
        });
      }
      try {
        sessionStorage.setItem('luba_fb_seed_done', 'true');
      } catch (e) {}
    } catch (err) {
      console.warn('[Firebase Auto-Seed] Notice:', err.message);
    }
  },

  attachListeners(store) {
    if (!realtimeDb) return;

    // 1. Live Sync Reports (/reports)
    const reportsRef = realtimeDb.ref('reports');
    reportsRef.on('value', (snapshot) => {
      // If Supabase is active, Supabase is the primary source of truth for reports
      if (typeof window !== 'undefined' && window.lubaSupabase && window.lubaSupabase.getClient()) {
        return;
      }
      const val = snapshot.val();
      if (!val) {
        console.info('[Firebase RTDB] /reports is empty on server.');
        return;
      }

      // Convert dictionary object or array to normalized array of reports with citizen photo preserved
      const rawList = Array.isArray(val)
        ? val.filter(Boolean)
        : Object.keys(val).map((k) => ({ ...val[k], code: val[k].code || k, id: val[k].id || k }));

      const reportsArray = rawList.map((r) => ({
        ...r,
        photoUrl: r.photoUrl || r.photo || r.imageUrl || r.image || r.citizenPhoto || './assets/pothole-citizen.jpg'
      }));

      if (reportsArray.length > 0) {
        // Intelligent status merge: never downgrade a locally verified/assigned/resolved report to an older remote status
        const statusRank = {
          'Submitted': 1,
          'Under Review': 2,
          'Verified': 3,
          'Forwarded to DPWH': 4,
          'Assigned': 4,
          'In Progress': 5,
          'Resolved': 6,
          'Rejected': 6,
          'Duplicate': 6
        };

        const currentReports = store.getState().reports || [];
        const remoteMap = new Map(reportsArray.map((r) => [r.code, r]));

        const merged = currentReports.map((local) => {
          const remote = remoteMap.get(local.code);
          if (!remote) return local;

          const localRank = statusRank[local.status] || 0;
          const remoteRank = statusRank[remote.status] || 0;

          if (localRank > remoteRank) {
            // Push updated local status to Firebase so remote catches up
            this.updateReport(local.code, local).catch(() => {});
            return local;
          }
          return { ...local, ...remote };
        });

        // Add any newly submitted reports from mobile not yet in local state
        const localCodeSet = new Set(currentReports.map((r) => r.code));
        reportsArray.forEach((r) => {
          if (!localCodeSet.has(r.code)) {
            merged.unshift(r);
          }
        });

        isRemoteFirebaseUpdate = true;
        store.setState({ reports: merged });
        isRemoteFirebaseUpdate = false;
      }
    }, (error) => {
      console.warn('[Firebase RTDB] Reports sync error:', error);
    });

    // 2. Realtime listener for newly submitted citizen reports
    reportsRef.limitToLast(1).on('child_added', (snapshot) => {
      if (typeof window !== 'undefined' && window.lubaSupabase && window.lubaSupabase.getClient()) {
        return;
      }
      if (!reportsListenerActive) {
        // Initial load snapshot, skip triggering toast
        reportsListenerActive = true;
        return;
      }
      const newReport = snapshot.val();
      if (newReport && newReport.code) {
        notifyUser(`⚡ New Citizen Report: ${newReport.code} on ${newReport.road || 'Malolos'}`);
      }
    });

    // 3. Live Sync Teams (/teams)
    const teamsRef = realtimeDb.ref('teams');
    teamsRef.on('value', (snapshot) => {
      // If Supabase is active, Supabase is the primary source of truth for teams
      if (typeof window !== 'undefined' && window.lubaSupabase && window.lubaSupabase.getClient()) {
        return;
      }
      const val = snapshot.val();
      if (val) {
        const teamsArray = Array.isArray(val)
          ? val.filter(Boolean)
          : Object.keys(val).map((k) => ({ ...val[k], code: val[k].code || k, id: val[k].id || k }));
        if (teamsArray.length > 0) {
          isRemoteFirebaseUpdate = true;
          store.setState((s) => {
            const serverCodes = new Set(teamsArray.map((t) => (t.code || '').toUpperCase()));
            const localOnly = (s.teams || []).filter((t) => !serverCodes.has((t.code || '').toUpperCase()));
            localOnly.forEach((t) => {
              this.createTeam(t).catch(() => {});
            });
            return { teams: [...teamsArray, ...localOnly] };
          });
          isRemoteFirebaseUpdate = false;
        }
      }
    });

    // 4. Live Sync Users (/users)
    const usersRef = realtimeDb.ref('users');
    usersRef.on('value', (snapshot) => {
      // If Supabase is active, Supabase is the primary source of truth for users
      if (typeof window !== 'undefined' && window.lubaSupabase && window.lubaSupabase.getClient()) {
        return;
      }
      const val = snapshot.val();
      if (val) {
        const usersArray = Array.isArray(val)
          ? val.filter(Boolean)
          : Object.keys(val).map((k) => ({ ...val[k], id: val[k].id || k }));
        if (usersArray.length > 0) {
          isRemoteFirebaseUpdate = true;
          store.setState({ users: usersArray });
          isRemoteFirebaseUpdate = false;
        }
      }
    });

    // 5. Live Sync Settings (/settings)
    const settingsRef = realtimeDb.ref('settings');
    settingsRef.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val) {
        isRemoteFirebaseUpdate = true;
        if (val.workspace) {
          store.setState((s) => ({
            workspaceSettingsForm: { ...s.workspaceSettingsForm, ...val.workspace }
          }));
        }
        if (val.adminProfile) {
          store.setState((s) => ({
            adminProfileForm: { ...s.adminProfileForm, ...val.adminProfile }
          }));
        }
        isRemoteFirebaseUpdate = false;
      }
    });
  },

  // -------------------------------------------------------------
  // Data Mutation Handlers (Instantly syncs to RTDB & Mobile Apps)
  // -------------------------------------------------------------
  async updateReport(code, patch) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const timestamp = new Date().toISOString();
    const enrichedPatch = { ...patch, updatedAt: timestamp };

    // 1. Direct WebSocket SDK update if connected
    if (realtimeDb) {
      try {
        await realtimeDb.ref(`reports/${code}`).update(enrichedPatch);
        console.log(`[Firebase RTDB SDK] Updated report ${code}:`, patch);
        return true;
      } catch (sdkErr) {
        console.warn('[Firebase RTDB SDK] update error:', sdkErr);
      }
    }

    // 2. Direct HTTPS REST update (fallback only if WebSocket disconnected)
    try {
      const res = await fetch(`${baseUrl}/reports/${encodeURIComponent(code)}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedPatch)
      });
      if (res.ok) {
        console.log(`[Firebase REST API] Live synchronized report ${code} to ${baseUrl}`);
        return true;
      }
    } catch (restErr) {
      console.warn('[Firebase REST API] Sync notice:', restErr);
    }

    return true;
  },

  async assignTeam(code, teamName) {
    return this.updateReport(code, {
      status: 'Assigned',
      assignedTeam: teamName,
      assignedAt: new Date().toISOString()
    });
  },

  async resolveReport(code, completionData = {}) {
    return this.updateReport(code, {
      status: 'Resolved',
      resolvedAt: new Date().toISOString(),
      repairEvidence: completionData
    });
  },

  async forwardToDpwh(code) {
    return this.updateReport(code, {
      status: 'Forwarded to DPWH',
      forwardedAt: new Date().toISOString()
    });
  },

  async createReport(reportData) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const code = reportData.code || `RW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullReport = { ...reportData, code, createdAt: new Date().toISOString() };

    if (realtimeDb) {
      try {
        realtimeDb.ref(`reports/${code}`).set(fullReport).catch((err) => {
          console.warn('[Firebase RTDB] createReport SDK error:', err);
        });
      } catch (err) {
        console.warn('[Firebase RTDB] createReport SDK error:', err);
      }
    }

    try {
      await fetch(`${baseUrl}/reports/${encodeURIComponent(code)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullReport)
      });
      console.log(`[Firebase] Successfully created report ${code}`);
    } catch (err) {
      console.warn('[Firebase REST] createReport error:', err);
    }
    return fullReport;
  },

  async createUser(userData) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const id = userData.id || Date.now();
    const fullUser = { ...userData, id, createdAt: new Date().toISOString() };

    if (realtimeDb) {
      try {
        realtimeDb.ref(`users/${id}`).set(fullUser).catch((err) => {
          console.warn('[Firebase RTDB] createUser SDK error:', err);
        });
      } catch (err) {
        console.warn('[Firebase RTDB] createUser SDK error:', err);
      }
    }

    try {
      await fetch(`${baseUrl}/users/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullUser)
      });
      console.log(`[Firebase] Successfully created user ${id} (${fullUser.name})`);
    } catch (err) {
      console.warn('[Firebase REST] createUser error:', err);
    }
    return fullUser;
  },

  async updateUser(userId, patch) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const enriched = { ...patch, updatedAt: new Date().toISOString() };

    if (realtimeDb) {
      try {
        realtimeDb.ref(`users/${userId}`).update(enriched).catch((err) => {
          console.warn('[Firebase RTDB] updateUser SDK error:', err);
        });
      } catch (err) {
        console.warn('[Firebase RTDB] updateUser SDK error:', err);
      }
    }

    try {
      await fetch(`${baseUrl}/users/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      });
      console.log(`[Firebase] Successfully updated user ${userId}`);
    } catch (err) {
      console.warn('[Firebase REST] updateUser error:', err);
    }
    return true;
  },

  async createTeam(teamData) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');

    let code = teamData.code;
    if (!code) {
      const raw = (teamData.title || teamData.name || 'team').trim().toUpperCase();
      if (raw.startsWith('MALOLOS-')) {
        code = raw.replace(/[^A-Z0-9-]/g, '');
      } else {
        const stripped = raw.replace(/^MALOLOS\s*(TEAM)?\s*/i, '').replace(/[^A-Z0-9]/g, '');
        code = `MALOLOS-${stripped || Date.now().toString().slice(-4)}`;
      }
    }

    const fullTeam = {
      code,
      title: teamData.title || teamData.name || code,
      lead: teamData.lead || 'Engr. Paolo Santos',
      serviceArea: teamData.serviceArea || 'General Malolos Area',
      crewSize: teamData.crewSize || '4 maintenance personnel',
      specialty: teamData.specialty || 'Asphalt patching & concrete re-blocking',
      workload: teamData.workload || '0 assigned · 0 in progress',
      status: teamData.status || 'Active',
      createdAt: teamData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Direct WebSocket SDK write (non-blocking)
    if (realtimeDb) {
      try {
        realtimeDb.ref(`teams/${code}`).set(fullTeam).catch((err) => {
          console.warn('[Firebase RTDB] createTeam SDK error:', err);
        });
      } catch (err) {
        console.warn('[Firebase RTDB] createTeam SDK error:', err);
      }
    }

    // 2. Direct HTTPS REST PUT write (guaranteed instant delivery)
    try {
      const res = await fetch(`${baseUrl}/teams/${encodeURIComponent(code)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullTeam)
      });
      if (res.ok) {
        console.log(`[Firebase REST] Successfully created team ${code}`);
      }
    } catch (err) {
      console.warn('[Firebase REST] createTeam error:', err);
    }
    return fullTeam;
  },

  async updateTeam(teamCode, patch) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const cleanCode = (teamCode || '').toUpperCase().trim();
    const enriched = { ...patch, updatedAt: new Date().toISOString() };

    if (realtimeDb && cleanCode) {
      try {
        await realtimeDb.ref(`teams/${cleanCode}`).update(enriched);
        return true;
      } catch (err) {
        console.warn('[Firebase RTDB] updateTeam SDK error:', err);
      }
    }

    try {
      const res = await fetch(`${baseUrl}/teams/${encodeURIComponent(cleanCode)}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      });
      if (res.ok) {
        console.log(`[Firebase REST] Successfully updated team ${cleanCode}`);
      }
    } catch (err) {
      console.warn('[Firebase REST] updateTeam error:', err);
    }
    return true;
  },

  async syncLiveInput(inputId, value, extra = {}) {
    // Disabled to preserve Firebase Spark free tier quota (preventing keystroke flooding)
    return true;
  },

  async recordAuditLog(event) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const id = event.id || `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const fullLog = {
      ...event,
      id,
      timestamp: event.timestamp || new Date().toISOString()
    };

    if (realtimeDb) {
      try {
        realtimeDb.ref(`audit_logs/${id}`).set(fullLog).catch((err) => {
          console.warn('[Firebase RTDB] recordAuditLog error:', err);
        });
      } catch (err) {}
    }

    try {
      await fetch(`${baseUrl}/audit_logs/${encodeURIComponent(id)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullLog)
      });
    } catch (err) {}

    return fullLog;
  },

  async updateSettings(sectionKey, data) {
    const cfg = getActiveFirebaseConfig();
    const baseUrl = (cfg.databaseURL || 'https://lubacanfindit-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const enriched = { ...data, updatedAt: new Date().toISOString() };

    if (realtimeDb) {
      try {
        realtimeDb.ref(`settings/${sectionKey}`).update(enriched).catch((err) => {
          console.warn('[Firebase RTDB] updateSettings SDK error:', err);
        });
      } catch (err) {
        console.warn('[Firebase RTDB] updateSettings SDK error:', err);
      }
    }

    try {
      await fetch(`${baseUrl}/settings/${sectionKey}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      });
      console.log(`[Firebase] Successfully updated settings/${sectionKey}`);
    } catch (err) {
      console.warn('[Firebase REST] updateSettings error:', err);
    }
    return true;
  },

  // Helper to push all local initial datasets into Firebase RTDB
  async seedInitialData(customConfig = null) {
    if (!realtimeDb) {
      const cfg = customConfig || getActiveFirebaseConfig();
      if (isConfigValid(cfg) && typeof window !== 'undefined' && window.firebase) {
        if (!window.firebase.apps.length) {
          firebaseApp = window.firebase.initializeApp(cfg);
        } else {
          firebaseApp = window.firebase.app();
        }
        realtimeDb = window.firebase.database();
        isInitialized = true;
      }
    }

    if (!realtimeDb) {
      throw new Error('Please enter your Firebase Database URL first before seeding.');
    }

    const reportsObj = {};
    initialReports.forEach((r) => {
      reportsObj[r.code] = r;
    });

    const teamsObj = {};
    initialTeams.forEach((t) => {
      const key = t.code || t.id || (t.title || t.name || 'team').replace(/\s+/g, '-').toLowerCase();
      teamsObj[key] = t;
    });

    const usersObj = {};
    initialUsers.forEach((u) => {
      usersObj[u.id] = u;
    });

    try {
      await realtimeDb.ref('reports').set(reportsObj);
      await realtimeDb.ref('teams').set(teamsObj);
      await realtimeDb.ref('users').set(usersObj);
      return true;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('permission_denied')) {
        throw new Error('Permission Denied: Please set .read: true and .write: true in Firebase Console > Realtime Database > Rules.');
      }
      throw err;
    }
  }
};

/**
 * Universal Reactive Change Detector & Auto-Synchronizer.
 * Whenever store state changes, this automatically detects newly added or modified
 * teams, reports, users, or settings and writes them immediately to Firebase RTDB.
 */
export function autoSyncToFirebase(prevState, nextState, partial) {
  if (isRemoteFirebaseUpdate || !partial) return;

  // 1. Teams auto-sync: detects newly added teams or updated properties
  if (partial.teams && Array.isArray(nextState.teams)) {
    const prevMap = new Map((prevState.teams || []).map((t) => [String(t.code || t.title).toUpperCase(), t]));
    nextState.teams.forEach((t) => {
      const key = String(t.code || t.title || '').toUpperCase();
      const prev = prevMap.get(key);
      if (!prev) {
        console.log(`[AutoSync] Automatically creating team in Firebase: ${t.code || t.title}`);
        firebaseSync.createTeam(t).catch(() => {});
      } else if (JSON.stringify(prev) !== JSON.stringify(t)) {
        console.log(`[AutoSync] Automatically updating team in Firebase: ${t.code || t.title}`);
        firebaseSync.updateTeam(t.code || key, t).catch(() => {});
      }
    });
  }

  // 2. Reports auto-sync: detects verification, assignment, or resolution changes
  if (partial.reports && Array.isArray(nextState.reports)) {
    const prevMap = new Map((prevState.reports || []).map((r) => [r.code, r]));
    nextState.reports.forEach((r) => {
      const prev = prevMap.get(r.code);
      if (!prev) {
        console.log(`[AutoSync] Automatically creating report in Firebase: ${r.code}`);
        firebaseSync.createReport(r).catch(() => {});
      } else if (JSON.stringify(prev) !== JSON.stringify(r)) {
        console.log(`[AutoSync] Automatically updating report in Firebase: ${r.code}`);
        firebaseSync.updateReport(r.code, r).catch(() => {});
      }
    });
  }

  // 3. Users auto-sync: detects invited personnel or profile status updates
  if (partial.users && Array.isArray(nextState.users)) {
    const prevMap = new Map((prevState.users || []).map((u) => [String(u.id), u]));
    nextState.users.forEach((u) => {
      const prev = prevMap.get(String(u.id));
      if (!prev) {
        console.log(`[AutoSync] Automatically creating user in Firebase: ${u.id} (${u.name})`);
        firebaseSync.createUser(u).catch(() => {});
      } else if (JSON.stringify(prev) !== JSON.stringify(u)) {
        console.log(`[AutoSync] Automatically updating user in Firebase: ${u.id} (${u.name})`);
        firebaseSync.updateUser(u.id, u).catch(() => {});
      }
    });
  }

  // 4. Workspace settings auto-sync
  if (partial.workspaceSettingsForm) {
    console.log('[AutoSync] Automatically updating workspace settings in Firebase');
    firebaseSync.updateSettings('workspace', nextState.workspaceSettingsForm).catch(() => {});
  }

  // 5. Admin profile auto-sync
  if (partial.adminProfileForm) {
    console.log('[AutoSync] Automatically updating admin profile in Firebase');
    firebaseSync.updateSettings('adminProfile', nextState.adminProfileForm).catch(() => {});
  }

  // 6. Audit log events auto-sync
  if (partial.auditLogEvents && Array.isArray(nextState.auditLogEvents)) {
    const prevCount = (prevState.auditLogEvents || []).length;
    if (nextState.auditLogEvents.length > prevCount) {
      const newEvents = nextState.auditLogEvents.slice(0, nextState.auditLogEvents.length - prevCount);
      newEvents.forEach((ev) => {
        firebaseSync.recordAuditLog(ev).catch(() => {});
      });
    }
  }
}

if (typeof window !== 'undefined') {
  window.lubaFirebaseAutoSync = autoSyncToFirebase;
}

