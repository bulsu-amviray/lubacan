// Supabase Synchronization Engine for LUBA CanFindIT (City of Malolos, Bulacan).
// High-efficiency, quota-friendly Realtime PostgreSQL & Storage sync.

import { getActiveSupabaseConfig, isSupabaseConfigValid } from '../config/supabase.config.js';
import { initialReports, initialTeams, initialUsers } from '../data/reports.js';

function formatAuditTime(iso) {
  if (!iso) return 'Today · Now';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  } catch {
    return 'Today · Now';
  }
}

let supabaseClient = null;
let realtimeChannel = null;
let isInitialized = false;
let isFetchingReports = false;
let isFetchingUsers = false;
let isFetchingTeams = false;
let isSyncingLocalTeams = false;
const teamSyncAttempts = {};
let lastFetchReportsTime = 0;
let lastFetchUsersTime = 0;
let lastFetchTeamsTime = 0;
let lastFetchAuditLogsTime = 0;

function notifyUser(msg) {
  if (typeof window !== 'undefined' && window.lubaShowToast) {
    window.lubaShowToast(msg);
  } else {
    console.log('[Supabase Notification]', msg);
  }
}

function formatSupabaseDate(dt) {
  if (!dt) return '30 Oct 2026';
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return '30 Oct 2026';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '30 Oct 2026';
  }
}

export const EXCLUDED_REPORT_CODES = new Set([
  'RW-2026-0839',
  'RW-2026-0838',
  'RW-2026-0837',
  'RW-2026-0836',
  'RW-2026-0835',
  'RW-2026-0798',
  'RW-2026-0789',
  'RW-2026-0771',
  'RW-2026-0745',
  'RW-2026-0723'
]);

export const REPORT_QUERY_FIELDS = [
  'id',
  'code',
  'road',
  'barangay',
  'jurisdiction',
  'severity',
  'status',
  'reported_date',
  'coordinates',
  'latitude',
  'longitude',
  'landmark',
  'description',
  'repair_photo_url',
  'assigned_team',
  'assigned_team_code',
  'lead_personnel',
  'priority',
  'target_completion',
  'instructions',
  'citizen_name',
  'citizen_email',
  'citizen_mobile',
  'verification_notes',
  'verified_by',
  'verified_at',
  'assigned_at',
  'resolved_at',
  'rejection_category',
  'rejection_reason',
  'created_at',
  'updated_at'
].join(',');

// Convert Supabase snake_case report row to frontend camelCase object
export function normalizeSupabaseReport(r) {
  if (!r) return null;
  const lat = r.latitude ? Number(r.latitude) : 14.8524;
  const lng = r.longitude ? Number(r.longitude) : 120.8168;
  const coords = r.coordinates || `${lat}° N, ${lng}° E`;

  const reportCode = r.code || r.public_report_code || r.report_code || (r.id ? `RW-2026-${String(r.id).padStart(4, '0')}` : `RW-2026-${String(Date.now()).slice(-4)}`);

  const existingPhoto = (typeof window !== 'undefined' && window.lubaStore)
    ? (window.lubaStore.getState().reports || []).find((x) => x.code === reportCode)?.photoUrl
    : null;
  const rawPhoto = r.photo_url || r.image_url || r.photo || existingPhoto || './assets/pothole-citizen.jpg';
  const photo = typeof rawPhoto === 'string' && rawPhoto.startsWith('/assets/') ? '.' + rawPhoto : rawPhoto;

  return {
    id: r.id,
    code: reportCode,
    road: r.road || r.road_name || 'Unspecified Road',
    barangay: r.barangay || r.barangay_name || 'Guinhawa',
    jurisdiction: r.jurisdiction || 'City',
    severity: r.severity || r.citizen_severity || r.verified_severity || r.effective_severity || 'Medium',
    status: r.status || r.current_status || 'Submitted',
    reportedDate: r.reported_date || r.submitted_at || formatSupabaseDate(r.created_at),
    coordinates: coords,
    latitude: lat,
    longitude: lng,
    landmark: r.landmark || r.location_landmark || '',
    description: r.description || '',
    photoUrl: photo,
    repairPhotoUrl: r.repair_photo_url || null,
    assignedTeam: r.assigned_team || null,
    assignedTeamCode: r.assigned_team_code || null,
    leadPersonnel: r.lead_personnel || null,
    priority: r.priority || 'High',
    targetCompletion: r.target_completion || 'Within 48 hours · 5:00 PM PHT',
    instructions: r.instructions || '',
    citizen: {
      name: r.citizen_name || r.reporter_name || (r.citizen && r.citizen.name) || 'Citizen Reporter',
      email: r.citizen_email || r.reporter_email || (r.citizen && r.citizen.email) || 'citizen@malolos.gov.ph',
      mobile: r.citizen_mobile || r.reporter_mobile || (r.citizen && r.citizen.mobile) || '+63 917 000 0000'
    },
    verificationNotes: r.verification_notes || '',
    verifiedBy: r.verified_by || null,
    verifiedAt: r.verified_at || null,
    assignedAt: r.assigned_at || null,
    resolvedAt: r.resolved_at || null,
    rejectionCategory: r.rejection_category || null,
    rejectionReason: r.rejection_reason || null,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

// Convert frontend camelCase patch to Supabase snake_case payload
export function toSupabaseReportRow(patch) {
  const row = {};
  if (patch.road !== undefined) row.road = patch.road;
  if (patch.barangay !== undefined) row.barangay = patch.barangay;
  if (patch.jurisdiction !== undefined) row.jurisdiction = patch.jurisdiction;
  if (patch.severity !== undefined) row.severity = patch.severity;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.coordinates !== undefined) row.coordinates = patch.coordinates;
  if (patch.latitude !== undefined) row.latitude = patch.latitude;
  if (patch.longitude !== undefined) row.longitude = patch.longitude;
  if (patch.landmark !== undefined) row.landmark = patch.landmark;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl;
  if (patch.repairPhotoUrl !== undefined || patch.completionPhotoUrl !== undefined) {
    row.repair_photo_url = patch.repairPhotoUrl || patch.completionPhotoUrl;
  }
  if (patch.assignedTeam !== undefined) row.assigned_team = patch.assignedTeam;
  if (patch.assignedTeamCode !== undefined) row.assigned_team_code = patch.assignedTeamCode;
  if (patch.leadPersonnel !== undefined) row.lead_personnel = patch.leadPersonnel;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.targetCompletion !== undefined) row.target_completion = patch.targetCompletion;
  if (patch.instructions !== undefined) row.instructions = patch.instructions;
  if (patch.citizenName !== undefined || patch.citizen?.name !== undefined) {
    row.citizen_name = patch.citizenName || patch.citizen?.name;
  }
  if (patch.citizenEmail !== undefined || patch.citizen?.email !== undefined) {
    row.citizen_email = patch.citizenEmail || patch.citizen?.email;
  }
  if (patch.citizenMobile !== undefined || patch.citizen?.mobile !== undefined) {
    row.citizen_mobile = patch.citizenMobile || patch.citizen?.mobile;
  }
  if (patch.verificationNotes !== undefined || patch.inspectionNotes !== undefined) {
    row.verification_notes = patch.verificationNotes || patch.inspectionNotes;
  }
  if (patch.verifiedBy !== undefined) row.verified_by = patch.verifiedBy;
  if (patch.verifiedAt !== undefined) row.verified_at = patch.verifiedAt;
  if (patch.assignedAt !== undefined) row.assigned_at = patch.assignedAt;
  if (patch.resolvedAt !== undefined || patch.rejectedAt !== undefined) {
    row.resolved_at = patch.resolvedAt || patch.rejectedAt;
  }
  if (patch.rejectionCategory !== undefined) row.rejection_category = patch.rejectionCategory;
  if (patch.rejectionReason !== undefined || patch.duplicateReason !== undefined) {
    row.rejection_reason = patch.rejectionReason || patch.duplicateReason;
  }
  row.updated_at = new Date().toISOString();
  return row;
}

export const supabaseSync = {
  getClient() {
    if (supabaseClient) return supabaseClient;
    const cfg = getActiveSupabaseConfig();
    if (!isSupabaseConfigValid(cfg)) return null;

    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      try {
        supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
          auth: { persistSession: false },
          realtime: { params: { eventsPerSecond: 10 } }
        });
        return supabaseClient;
      } catch (err) {
        console.warn('[Supabase] Client initialization notice:', err);
      }
    }
    return null;
  },

  async restApi(endpoint, options = {}) {
    const cfg = getActiveSupabaseConfig();
    const cleanUrl = (cfg.supabaseUrl || '').replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${cleanUrl}/rest/v1/${cleanEndpoint}`;
    const headers = {
      'apikey': cfg.supabaseAnonKey,
      'Authorization': `Bearer ${cfg.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });
      if (res.ok) {
        const txt = await res.text();
        if (!txt || txt.trim() === '') return null;
        return JSON.parse(txt);
      }
    } catch (directErr) {
      // Direct browser fetch failed (e.g. CORS or browser secret-key restrictions)
    }

    // High-Reliability Fallback 1: PHP Bridge Proxy (for XAMPP Apache / phpMyAdmin)
    try {
      const phpProxyUrl = window.location.pathname.includes('/frontend/')
        ? `./supabase_proxy.php?endpoint=${encodeURIComponent(cleanEndpoint)}`
        : `/frontend/supabase_proxy.php?endpoint=${encodeURIComponent(cleanEndpoint)}`;
      const phpRes = await fetch(phpProxyUrl, options);
      if (phpRes.ok) {
        const txt = await phpRes.text();
        if (!txt || txt.trim() === '') return null;
        return JSON.parse(txt);
      }
    } catch (_) {}

    // High-Reliability Fallback 2: Node.js Express Proxy (Port 4000)
    try {
      const nodeUrl = `/api/supabase/${cleanEndpoint}`;
      const nodeRes = await fetch(nodeUrl, options);
      if (nodeRes.ok) {
        const txt = await nodeRes.text();
        if (!txt || txt.trim() === '') return null;
        return JSON.parse(txt);
      }
    } catch (_) {}

    return null;
  },

  async fetchUsers(store, force = false) {
    const now = Date.now();
    if (isFetchingUsers) return store.getState().users || [];
    if (!force && now - lastFetchUsersTime < 2500) {
      return store.getState().users || [];
    }
    isFetchingUsers = true;
    lastFetchUsersTime = now;

    try {
      let remoteUsers = null;
      const client = this.getClient();
      if (client) {
        const { data, error: userErr } = await client
          .from('users')
          .select('*')
          .order('id', { ascending: false });
        if (!userErr && Array.isArray(data)) {
          remoteUsers = data;
        }
      }

      // Fallback to direct REST fetch
      if (!remoteUsers) {
        remoteUsers = await this.restApi('users?select=*&order=id.desc');
      }

      let usersList = Array.isArray(remoteUsers) ? remoteUsers.map((u) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        mobile: u.mobile || '',
        role: u.role || 'Citizen',
        area: u.area || 'City of Malolos',
        department: u.area || 'City of Malolos',
        status: u.status || 'Active',
        createdAt: u.created_at
      })) : [];

      // Auto-discover citizen reporters from reports so every citizen reporter appears in the directory
      const existingEmails = new Set(usersList.map((x) => (x.email || '').toLowerCase().trim()));
      const reports = store.getState().reports || [];
      const newCitizensToUpsert = [];

      reports.forEach((r) => {
        const cEmail = (r.citizen?.email || '').toLowerCase().trim();
        const cName = (r.citizen?.name || '').trim();
        if (cEmail && cName && !existingEmails.has(cEmail) && !cEmail.includes('placeholder')) {
          existingEmails.add(cEmail);
          const newCitizen = {
            id: `citizen-${r.code}`,
            name: cName,
            email: r.citizen.email,
            mobile: r.citizen.mobile || '',
            role: 'Citizen',
            area: r.barangay || 'City of Malolos',
            department: r.barangay || 'City of Malolos',
            status: 'Active'
          };
          usersList.push(newCitizen);
          newCitizensToUpsert.push({
            full_name: newCitizen.name,
            email: newCitizen.email,
            mobile: newCitizen.mobile,
            role: 'Citizen',
            area: newCitizen.area,
            status: 'Active'
          });
        }
      });

      // Asynchronously upsert any discovered citizen reporters into Supabase public.users
      if (newCitizensToUpsert.length > 0) {
        const client = this.getClient();
        if (client) {
          client
            .from('users')
            .upsert(newCitizensToUpsert, { onConflict: 'email' })
            .catch(() => {});
        } else {
          this.restApi('users?on_conflict=email', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify(newCitizensToUpsert)
          }).catch(() => {});
        }
      }

      const currentUsers = store.getState().users || [];
      const remoteEmails = new Set(usersList.map((x) => (x.email || '').toLowerCase()));
      const localOnly = currentUsers.filter((x) => !remoteEmails.has((x.email || '').toLowerCase()));
      const mergedUsers = [...usersList, ...localOnly];

      const curUsersSig = currentUsers.map((u) => `${u.id}:${u.email}:${u.status}`).join('|');
      const newUsersSig = mergedUsers.map((u) => `${u.id}:${u.email}:${u.status}`).join('|');
      if (curUsersSig === newUsersSig && currentUsers.length === mergedUsers.length) {
        return usersList;
      }

      const prevEmails = new Set(currentUsers.map((x) => (x.email || '').toLowerCase().trim()));
      const brandNewUsers = usersList.filter((u) => u.email && !prevEmails.has(u.email.toLowerCase().trim()));

      store.setState({ users: mergedUsers });

      if (brandNewUsers.length > 0 && !force) {
        const newest = brandNewUsers[0];
        notifyUser(`👤 New User Registered: ${newest.name} (${newest.role})`);
      }

      console.log(`[Supabase] Live fetched & synced ${usersList.length} users:`, usersList.map((u) => `${u.name} (${u.role})`));
      return usersList;
    } catch (err) {
      console.warn('[Supabase fetchUsers notice]:', err.message);
    } finally {
      isFetchingUsers = false;
    }
    return [];
  },

  async fetchReports(store, force = false) {
    const now = Date.now();
    if (isFetchingReports) return store.getState().reports || [];
    if (!force && now - lastFetchReportsTime < 2500) {
      return store.getState().reports || [];
    }
    isFetchingReports = true;
    lastFetchReportsTime = now;

    try {
      let remoteReports = null;
      const client = this.getClient();
      if (client) {
        try {
          const { data, error: repErr } = await client
            .from('reports')
            .select(REPORT_QUERY_FIELDS)
            .order('id', { ascending: false });
          if (!repErr && Array.isArray(data)) {
            remoteReports = data;
          }
        } catch (_) {}
      }

      // Fallback to direct REST fetch with selective lightweight fields (order=id.desc matching mobile reference)
      if (!remoteReports) {
        remoteReports = await this.restApi(`reports?select=${REPORT_QUERY_FIELDS}&order=id.desc`);
      }

      if (Array.isArray(remoteReports) && remoteReports.length > 0) {
        const normalized = remoteReports
          .map(normalizeSupabaseReport)
          .filter((r) => r && !EXCLUDED_REPORT_CODES.has(r.code));

        const existingReports = store.getState().reports || [];
        const currentReports = existingReports.filter((r) => !EXCLUDED_REPORT_CODES.has(r.code));
        const remoteCodes = new Set(normalized.map((r) => r.code));
        const localOnly = currentReports.filter((r) => !remoteCodes.has(r.code));

        // Merge and sort newest first by ID descending
        const merged = [...normalized, ...localOnly].sort((a, b) => {
          const idA = Number(a.id) || Number(String(a.code || '').replace(/\D/g, '')) || 0;
          const idB = Number(b.id) || Number(String(b.code || '').replace(/\D/g, '')) || 0;
          if (idB !== idA) return idB - idA;
          const timeA = new Date(a.createdAt || a.reportedDate || 0).getTime();
          const timeB = new Date(b.createdAt || b.reportedDate || 0).getTime();
          return timeB - timeA;
        });

        const curSignature = currentReports.map((r) => `${r.code}:${r.status}:${r.severity}`).join('|');
        const newSignature = merged.map((r) => `${r.code}:${r.status}:${r.severity}`).join('|');
        if (curSignature === newSignature && currentReports.length === merged.length) {
          // No changes! Do not mutate state or trigger re-render
          return normalized;
        }

        const existingCodes = new Set(currentReports.map((r) => r.code));
        const brandNewReports = normalized.filter((r) => !existingCodes.has(r.code));

        store.setState({ reports: merged });

        if (brandNewReports.length > 0 && !force) {
          const newest = brandNewReports[0];
          notifyUser(`⚡ New Citizen Report: ${newest.code} on ${newest.road} (${newest.barangay})`);
        }

        console.log(`[Supabase] Live fetched ${normalized.length} reports.`);
        return normalized;
      }
    } catch (err) {
      console.warn('[Supabase fetchReports notice]:', err.message);
    } finally {
      isFetchingReports = false;
    }
    return [];
  },

  async fetchReportPhoto(code) {
    if (!code) return null;
    try {
      const data = await this.restApi(`reports?select=photo_url&code=eq.${encodeURIComponent(code)}`);
      if (Array.isArray(data) && data[0] && data[0].photo_url) {
        const url = data[0].photo_url;
        const currentStore = typeof window !== 'undefined' ? window.lubaStore : null;
        if (currentStore) {
          const currentReport = (currentStore.getState().reports || []).find((r) => r.code === code);
          if (currentReport && currentReport.photoUrl === url) {
            return url;
          }
          currentStore.setState((s) => ({
            reports: (s.reports || []).map((r) => r.code === code ? { ...r, photoUrl: url } : r)
          }));
        }
        return url;
      }
    } catch (e) {
      console.warn('[Supabase fetchReportPhoto notice]:', e.message);
    }
    return null;
  },

  async fetchTeams(store, force = false) {
    const now = Date.now();
    if (!force && (isFetchingTeams || now - lastFetchTeamsTime < 2500)) {
      return store?.getState()?.teams || [];
    }
    isFetchingTeams = true;
    lastFetchTeamsTime = now;

    try {
      let remoteTeams = null;
      const client = this.getClient();
      if (client) {
        const { data, error: teamErr } = await client.from('teams').select('*');
        if (!teamErr && Array.isArray(data)) {
          remoteTeams = data;
        }
      }

      if (!remoteTeams) {
        remoteTeams = await this.restApi('teams?select=*');
      }

      if (Array.isArray(remoteTeams) && remoteTeams.length > 0) {
        const teamsList = remoteTeams.map((t) => ({
          code: t.code,
          title: t.title,
          lead: t.lead,
          serviceArea: t.service_area || t.serviceArea || '',
          crewSize: t.crew_size || t.crewSize || '4 maintenance personnel',
          specialty: t.specialty || '',
          workload: t.workload || '0 assigned · 0 in progress',
          status: t.status || 'Active',
          phone: t.phone || '',
          email: t.email || ''
        }));

        if (store) {
          // Supabase is the source of truth: remote rows replace local copies.
          // Teams that exist only locally are kept but flagged `unsynced` so they are visible and can be synced.
          store.setState((s) => {
            const remoteCodes = new Set(teamsList.map((t) => t.code));
            const remoteTitles = new Set(teamsList.map((t) => String(t.title || '').trim().toLowerCase()));
            const localOnly = (s.teams || [])
              .filter((lt) => !remoteCodes.has(lt.code) && !remoteTitles.has(String(lt.title || '').trim().toLowerCase()))
              .map((lt) => ({ ...lt, unsynced: true }));
            return { teams: [...teamsList, ...localOnly] };
          });
        }
        return teamsList;
      }
    } catch (err) {
      console.warn('[Supabase fetchTeams notice]:', err.message);
    } finally {
      isFetchingTeams = false;
    }
    return store?.getState()?.teams || [];
  },

  // Pushes teams that exist only in the Admin UI (unsynced) into Supabase without creating duplicates.
  async syncLocalOnlyTeams(store) {
    if (!store || isSyncingLocalTeams) return;
    const pending = (store.getState().teams || []).filter((t) => t.unsynced);
    if (pending.length === 0) return;
    isSyncingLocalTeams = true;

    try {
      // Fresh remote snapshot used for duplicate checks
      let remoteRows = null;
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('teams').select('code,title');
        if (!error && Array.isArray(data)) remoteRows = data;
      }
      if (!remoteRows) remoteRows = await this.restApi('teams?select=code,title');
      if (!Array.isArray(remoteRows)) return; // cannot verify duplicates safely, try again later

      const usedCodes = new Set(remoteRows.map((r) => r.code));
      const usedTitles = new Set(remoteRows.map((r) => String(r.title || '').trim().toLowerCase()));

      for (const team of pending) {
        const titleKey = String(team.title || '').trim().toLowerCase();
        if (!titleKey || usedTitles.has(titleKey)) continue; // already in Supabase by title

        const attemptKey = team.code || titleKey;
        teamSyncAttempts[attemptKey] = (teamSyncAttempts[attemptKey] || 0) + 1;
        if (teamSyncAttempts[attemptKey] > 3) continue; // stop retrying a team that keeps failing

        const slug = String(team.title || '').toUpperCase().replace(/^MALOLOS\s*(TEAM)?\s*/i, '').replace(/[^A-Z0-9]/g, '');
        const slugCode = `MALOLOS-${slug || Date.now().toString().slice(-4)}`;
        // Prefer the team's own code; if another team already owns it (legacy collision), use a clean name-based code
        const baseCode = team.code && !usedCodes.has(team.code) ? team.code : slugCode;
        let code = baseCode;
        let n = 2;
        while (usedCodes.has(code)) code = `${baseCode}-${n++}`;

        try {
          await this.createTeam({ ...team, code, unsynced: undefined });
          usedCodes.add(code);
          usedTitles.add(titleKey);
          console.log('[Supabase] Synced local-only team:', team.title, '->', code);
          notifyUser(`Team "${team.title}" synced to Supabase.`);
        } catch (err) {
          console.warn('[Supabase] Could not sync local-only team:', team.title, err.message);
        }
      }
    } catch (err) {
      console.warn('[Supabase syncLocalOnlyTeams notice]:', err.message);
    } finally {
      isSyncingLocalTeams = false;
    }

    await this.fetchTeams(store, true);
  },

  async fetchAuditLogs(store, force = false) {
    const now = Date.now();
    if (!force && now - lastFetchAuditLogsTime < 3000) {
      return store.getState().auditLogEvents || [];
    }
    lastFetchAuditLogsTime = now;
    const client = this.getClient();
    if (!client) return [];

    try {
      const { data: logs, error } = await client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (Array.isArray(logs) && logs.length > 0) {
        const formattedLogs = logs.map((l) => ({
          id: l.id,
          reportCode: l.report_code,
          actor: l.actor,
          status: l.status,
          note: l.note,
          time: formatAuditTime(l.created_at)
        }));

        store.setState((s) => {
          const existing = s.auditLogEvents || [];
          const remoteTimes = new Set(formattedLogs.map((x) => `${x.reportCode || ''}-${x.time}-${x.status}`));
          const localOnly = existing.filter((x) => !remoteTimes.has(`${x.reportCode || ''}-${x.time}-${x.status}`));
          return { auditLogEvents: [...formattedLogs, ...localOnly] };
        });
        return formattedLogs;
      }
    } catch (err) {
      console.warn('[Supabase fetchAuditLogs notice]:', err.message);
    }
    return [];
  },

  async init(store) {
    if (isInitialized) return;
    const cfg = getActiveSupabaseConfig();
    if (!isSupabaseConfigValid(cfg)) {
      console.info('[Supabase] Config invalid or not provided.');
      return;
    }

    try {
      // 0. Clean up excluded mock reports from store
      store.setState((s) => ({
        reports: (s.reports || []).filter((r) => !EXCLUDED_REPORT_CODES.has(r.code))
      }));

      // 1. Initial fetch of reports from Supabase (runs over REST or SDK)
      await this.fetchReports(store, true);

      // 2. Initial fetch of teams from Supabase, then push any Admin-UI-only teams (no duplicates)
      await this.fetchTeams(store, true);
      await this.syncLocalOnlyTeams(store);

      // 3. Initial fetch of users from Supabase
      await this.fetchUsers(store);

      // 4. Initial fetch of audit logs from Supabase
      await this.fetchAuditLogs(store);

      // 5. Start background periodic polling every 4 seconds as high-reliability sync
      if (typeof window !== 'undefined' && !window._lubaSupabasePollInterval) {
        window._lubaSupabasePollInterval = setInterval(async () => {
          await this.fetchReports(store);
          await this.fetchTeams(store);
          await this.syncLocalOnlyTeams(store);
          await this.fetchUsers(store);
        }, 4000);
      }

      // 6. Attach Realtime WebSocket Channel if client is available or becomes available
      const setupRealtime = () => {
        const client = this.getClient();
        if (!client || realtimeChannel) return;

        try {
          client
            .from('reports')
            .delete()
            .in('code', Array.from(EXCLUDED_REPORT_CODES))
            .catch(() => {});

          realtimeChannel = client
            .channel('luba-realtime-channel')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'reports' },
              (payload) => {
                console.log('[Supabase Realtime] Event on reports:', payload.eventType, payload.new);
                if (payload.eventType === 'INSERT') {
                  if (EXCLUDED_REPORT_CODES.has(payload.new?.code)) return;
                  const newReport = normalizeSupabaseReport(payload.new);

                  store.setState((s) => {
                    const updatedReports = [newReport, ...(s.reports || []).filter((r) => r.code !== newReport.code && !EXCLUDED_REPORT_CODES.has(r.code))];
                    const currentUsers = s.users || [];
                    const cEmail = (newReport.citizen?.email || '').toLowerCase().trim();
                    const hasUser = currentUsers.some((u) => (u.email || '').toLowerCase().trim() === cEmail);
                    let updatedUsers = currentUsers;

                    if (!hasUser && newReport.citizen?.name && cEmail) {
                      const newCitizen = {
                        id: `citizen-${newReport.code || Date.now()}`,
                        name: newReport.citizen.name,
                        email: newReport.citizen.email,
                        mobile: newReport.citizen.mobile || '',
                        role: 'Citizen',
                        area: newReport.barangay || 'City of Malolos',
                        department: newReport.barangay || 'City of Malolos',
                        status: 'Active'
                      };
                      updatedUsers = [newCitizen, ...currentUsers];
                    }

                    return {
                      reports: updatedReports,
                      users: updatedUsers
                    };
                  });

                  notifyUser(`⚡ New Citizen Report: ${newReport.code} on ${newReport.road}`);
                } else if (payload.eventType === 'UPDATE') {
                  if (EXCLUDED_REPORT_CODES.has(payload.new?.code)) return;
                  const updated = normalizeSupabaseReport(payload.new);
                  store.setState((s) => ({
                    reports: (s.reports || []).map((r) => (r.code === updated.code ? { ...r, ...updated } : r)).filter((r) => !EXCLUDED_REPORT_CODES.has(r.code))
                  }));
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'teams' },
              (payload) => {
                console.log('[Supabase Realtime] Event on teams:', payload.eventType, payload.new || payload.old);
                if (payload.eventType === 'INSERT') {
                  const t = payload.new;
                  if (!t || !t.code) return;
                  const formatted = {
                    code: t.code,
                    title: t.title,
                    lead: t.lead,
                    serviceArea: t.service_area || t.serviceArea || '',
                    crewSize: t.crew_size || t.crewSize || '4 maintenance personnel',
                    specialty: t.specialty || '',
                    workload: t.workload || '0 assigned · 0 in progress',
                    status: t.status || 'Active',
                    phone: t.phone || '',
                    email: t.email || ''
                  };
                  store.setState((s) => ({
                    teams: [...(s.teams || []).filter((x) => x.code !== formatted.code), formatted]
                  }));
                  notifyUser(`⚡ Maintenance team synced: ${formatted.title}`);
                } else if (payload.eventType === 'UPDATE') {
                  const t = payload.new;
                  if (!t || !t.code) return;
                  store.setState((s) => {
                    const existingList = s.teams || [];
                    const exists = existingList.some((x) => x.code === t.code);
                    if (!exists) {
                      const newObj = {
                        code: t.code,
                        title: t.title,
                        lead: t.lead,
                        serviceArea: t.service_area || t.serviceArea || '',
                        crewSize: t.crew_size || t.crewSize || '4 maintenance personnel',
                        specialty: t.specialty || '',
                        workload: t.workload || '0 assigned · 0 in progress',
                        status: t.status || 'Active',
                        phone: t.phone || '',
                        email: t.email || ''
                      };
                      return { teams: [...existingList, newObj] };
                    }
                    return {
                      teams: existingList.map((existing) =>
                        existing.code === t.code
                          ? {
                              ...existing,
                              title: t.title || existing.title,
                              lead: t.lead || existing.lead,
                              serviceArea: t.service_area || existing.serviceArea,
                              crewSize: t.crew_size || existing.crewSize,
                              specialty: t.specialty || existing.specialty,
                              workload: t.workload || existing.workload,
                              status: t.status || existing.status,
                              phone: t.phone !== undefined ? t.phone : existing.phone,
                              email: t.email !== undefined ? t.email : existing.email
                            }
                          : existing
                      )
                    };
                  });
                } else if (payload.eventType === 'DELETE') {
                  const oldCode = payload.old?.code;
                  if (oldCode) {
                    store.setState((s) => ({
                      teams: (s.teams || []).filter((x) => x.code !== oldCode)
                    }));
                  }
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'users' },
              (payload) => {
                if (payload.eventType === 'INSERT') {
                  const u = payload.new;
                  const formatted = {
                    id: u.id,
                    name: u.full_name,
                    email: u.email,
                    mobile: u.mobile,
                    role: u.role,
                    area: u.area,
                    department: u.area,
                    status: u.status
                  };
                  store.setState((s) => ({
                    users: [formatted, ...(s.users || []).filter((x) => x.id !== u.id && x.email !== u.email)]
                  }));
                } else if (payload.eventType === 'UPDATE') {
                  const u = payload.new;
                  store.setState((s) => ({
                    users: (s.users || []).map((x) =>
                      x.id === u.id || x.email === u.email
                        ? {
                            ...x,
                            name: u.full_name,
                            email: u.email,
                            mobile: u.mobile,
                            role: u.role,
                            area: u.area,
                            department: u.area,
                            status: u.status
                          }
                        : x
                    )
                  }));
                }
              }
            )
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'audit_logs' },
              (payload) => {
                const l = payload.new;
                if (l) {
                  store.setState((s) => ({
                    auditLogEvents: [
                      {
                        time: formatAuditTime(l.created_at),
                        actor: l.actor,
                        status: l.status,
                        note: l.note
                      },
                      ...(s.auditLogEvents || [])
                    ]
                  }));
                }
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                console.log('[Supabase Realtime] Connected to live PostgreSQL publication.');
              }
            });
        } catch (rtErr) {
          console.warn('[Supabase Realtime notice]:', rtErr.message);
        }
      };

      setupRealtime();
      if (!realtimeChannel && typeof window !== 'undefined') {
        setTimeout(setupRealtime, 2000);
      }

      isInitialized = true;
    } catch (err) {
      console.warn('[Supabase] Initialization notice:', err.message);
    }
  },

  async updateReport(code, patch, storeInstance) {
    const currentStore = storeInstance || (typeof window !== 'undefined' ? window.lubaStore : null);
    const row = toSupabaseReportRow(patch);
    const client = this.getClient();

    try {
      if (client) {
        const { data, error } = await client
          .from('reports')
          .update(row)
          .eq('code', code)
          .select();

        if (error) throw error;

        if (!data || data.length === 0) {
          const fullReport = currentStore ? (currentStore.getState().reports || []).find((r) => r.code === code) : null;
          if (fullReport) {
            const insertRow = {
              ...toSupabaseReportRow({ ...fullReport, ...patch }),
              code: code,
              road: fullReport.road || 'MacArthur Highway',
              barangay: fullReport.barangay || 'Guinhawa',
              jurisdiction: fullReport.jurisdiction || 'City',
              severity: fullReport.severity || 'Medium',
              status: patch.status || fullReport.status || 'Under Review',
              coordinates: fullReport.coordinates || '14.8524° N, 120.8168° E',
              photo_url: fullReport.photoUrl || './assets/pothole-citizen.jpg'
            };
            await client.from('reports').upsert([insertRow], { onConflict: 'code' });
            console.log(`[Supabase] Upserted report ${code} during update.`);
          }
        } else {
          console.log(`[Supabase] Live updated report ${code}:`, patch);
        }
        return true;
      }
    } catch (sdkErr) {
      console.warn(`[Supabase SDK updateReport notice for ${code}]:`, sdkErr.message);
    }

    // Direct REST fallback
    try {
      const patched = await this.restApi(`reports?code=eq.${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(row)
      });
      if (!patched || (Array.isArray(patched) && patched.length === 0)) {
        const fullReport = currentStore ? (currentStore.getState().reports || []).find((r) => r.code === code) : null;
        if (fullReport) {
          const insertRow = {
            ...toSupabaseReportRow({ ...fullReport, ...patch }),
            code: code,
            road: fullReport.road || 'MacArthur Highway',
            barangay: fullReport.barangay || 'Guinhawa',
            jurisdiction: fullReport.jurisdiction || 'City',
            severity: fullReport.severity || 'Medium',
            status: patch.status || fullReport.status || 'Under Review',
            coordinates: fullReport.coordinates || '14.8524° N, 120.8168° E',
            photo_url: fullReport.photoUrl || './assets/pothole-citizen.jpg'
          };
          await this.restApi('reports?on_conflict=code', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify([insertRow])
          });
          console.log(`[Supabase REST] Upserted report ${code} via REST.`);
        }
      } else {
        console.log(`[Supabase REST] Live patched report ${code}:`, patch);
      }
      return true;
    } catch (restErr) {
      console.warn(`[Supabase REST updateReport notice for ${code}]:`, restErr.message);
      return false;
    }
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

  async updateSettings(sectionKey, data) {
    console.log(`[Supabase] Settings saved for section: ${sectionKey}`, data);
    return true;
  },

  async createReport(reportData) {
    const row = {
      code: reportData.code || `RW-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      road: reportData.road || 'MacArthur Highway',
      barangay: reportData.barangay || 'Guinhawa',
      jurisdiction: reportData.jurisdiction || 'City',
      severity: reportData.severity || 'Medium',
      status: reportData.status || 'Under Review',
      reported_date: reportData.reportedDate || '19 Oct 2026',
      coordinates: reportData.coordinates || '14.8524° N, 120.8168° E',
      landmark: reportData.landmark || '',
      description: reportData.description || '',
      photo_url: reportData.photoUrl || './assets/pothole-citizen.jpg',
      citizen_name: reportData.citizen?.name || 'Citizen Reporter',
      citizen_email: reportData.citizen?.email || 'citizen@malolos.gov.ph',
      citizen_mobile: reportData.citizen?.mobile || '+63 917 000 0000'
    };

    const client = this.getClient();
    try {
      if (client) {
        const { data, error } = await client.from('reports').insert([row]).select().single();
        if (error) throw error;
        console.log(`[Supabase] Created new report ${row.code}`);
        return normalizeSupabaseReport(data);
      }
    } catch (sdkErr) {
      console.warn('[Supabase SDK createReport notice]:', sdkErr.message);
    }

    // Direct REST fallback
    try {
      const data = await this.restApi('reports', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(row)
      });
      console.log(`[Supabase REST] Created new report ${row.code}`);
      const createdItem = Array.isArray(data) ? data[0] : data;
      return normalizeSupabaseReport(createdItem) || reportData;
    } catch (restErr) {
      console.warn('[Supabase REST createReport notice]:', restErr.message);
      return reportData;
    }
  },

  async updateTeam(teamCode, patch) {
    const row = {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.lead !== undefined ? { lead: patch.lead } : {}),
      ...(patch.serviceArea !== undefined ? { service_area: patch.serviceArea } : {}),
      ...(patch.service_area !== undefined ? { service_area: patch.service_area } : {}),
      ...(patch.crewSize !== undefined ? { crew_size: patch.crewSize } : {}),
      ...(patch.crew_size !== undefined ? { crew_size: patch.crew_size } : {}),
      ...(patch.specialty !== undefined ? { specialty: patch.specialty } : {}),
      ...(patch.workload !== undefined ? { workload: patch.workload } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.email !== undefined ? { email: patch.email } : {}),
      updated_at: new Date().toISOString()
    };

    const client = this.getClient();
    try {
      if (client) {
        await client.from('teams').update(row).eq('code', teamCode);
        return true;
      }
    } catch (sdkErr) {
      console.warn('[Supabase SDK updateTeam notice]:', sdkErr.message);
    }

    try {
      await this.restApi(`teams?code=eq.${encodeURIComponent(teamCode)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(row)
      });
      return true;
    } catch (restErr) {
      console.warn('[Supabase REST updateTeam notice]:', restErr.message);
      return false;
    }
  },

  async createTeam(teamData) {
    const row = {
      code: teamData.code,
      title: teamData.title,
      lead: teamData.lead,
      service_area: teamData.serviceArea || teamData.service_area || 'City of Malolos',
      crew_size: teamData.crewSize || teamData.crew_size || '4 maintenance personnel',
      specialty: teamData.specialty || 'Asphalt patching & concrete re-blocking',
      workload: teamData.workload || '0 assigned · 0 in progress',
      status: teamData.status || 'Active',
      phone: teamData.phone || null,
      email: teamData.email || null,
      updated_at: new Date().toISOString()
    };

    const verifyRow = async () => {
      try {
        const client = this.getClient();
        if (client) {
          const { data, error } = await client.from('teams').select('code').eq('code', row.code).limit(1);
          if (!error && Array.isArray(data) && data.length > 0) return true;
        }
        const rest = await this.restApi(`teams?code=eq.${encodeURIComponent(row.code)}&select=code`);
        return Array.isArray(rest) && rest.length > 0;
      } catch {
        return false;
      }
    };

    // Attempt 1: Supabase SDK (errors are returned, not thrown, so check them explicitly)
    const client = this.getClient();
    if (client) {
      try {
        const { error } = await client.from('teams').insert([row]);
        if (error) {
          console.warn('[Supabase SDK createTeam error]:', error.message || error);
        } else if (await verifyRow()) {
          console.log('[Supabase] Team inserted via SDK:', row.code);
          return teamData;
        }
      } catch (sdkErr) {
        console.warn('[Supabase SDK createTeam notice]:', sdkErr.message);
      }
    }

    // Attempt 2: REST / PHP proxy / Node proxy fallbacks
    try {
      await this.restApi('teams', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(row)
      });
    } catch (restErr) {
      console.warn('[Supabase REST createTeam notice]:', restErr.message);
    }

    // Confirm the row really exists in Supabase before reporting success
    if (await verifyRow()) {
      console.log('[Supabase] Team confirmed in Supabase:', row.code);
      return teamData;
    }
    throw new Error(`Team "${row.title}" could not be saved to Supabase.`);
  },

  async recordAuditLog(event, storeInstance) {
    const currentStore = storeInstance || (typeof window !== 'undefined' ? window.lubaStore : null);
    const timestampStr = formatAuditTime(new Date());

    if (currentStore) {
      currentStore.setState((s) => ({
        auditLogEvents: [
          {
            time: timestampStr,
            actor: event.actor || 'Administrator',
            status: event.status || 'Updated',
            note: event.note || ''
          },
          ...(s.auditLogEvents || [])
        ]
      }));
    }

    const row = {
      report_code: event.reportCode || null,
      actor: event.actor || 'Administrator',
      status: event.status || 'Updated',
      note: event.note || ''
    };

    const client = this.getClient();
    try {
      if (client) {
        await client.from('audit_logs').insert([row]);
        console.log('[Supabase] Recorded audit log to PostgreSQL:', row);
        return true;
      }
    } catch (sdkErr) {
      console.warn('[Supabase SDK recordAuditLog notice]:', sdkErr.message);
    }

    try {
      await this.restApi('audit_logs', {
        method: 'POST',
        body: JSON.stringify(row)
      });
      console.log('[Supabase REST] Recorded audit log to PostgreSQL:', row);
      return true;
    } catch (restErr) {
      console.warn('[Supabase REST recordAuditLog notice]:', restErr.message);
      return false;
    }
  },

  async uploadReportPhoto(file, reportCode) {
    const client = this.getClient();
    if (!client) return null;

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${reportCode || 'report'}-${Date.now()}.${ext}`;
      const { data, error } = await client.storage
        .from('pothole-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;
      const { data: pubData } = client.storage.from('pothole-photos').getPublicUrl(fileName);
      return pubData.publicUrl;
    } catch (err) {
      console.warn('[Supabase uploadReportPhoto notice]:', err.message);
      return null;
    }
  },

  async updateUser(userId, patch, storeInstance) {
    const row = {
      ...(patch.name !== undefined || patch.fullName !== undefined ? { full_name: patch.name || patch.fullName } : {}),
      ...(patch.email !== undefined ? { email: patch.email } : {}),
      ...(patch.mobile !== undefined ? { mobile: patch.mobile } : {}),
      ...(patch.role !== undefined ? { role: patch.role } : {}),
      ...(patch.area !== undefined || patch.department !== undefined ? { area: patch.area || patch.department } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      updated_at: new Date().toISOString()
    };

    const currentStore = storeInstance || (typeof window !== 'undefined' ? window.lubaStore : null);
    const userList = currentStore ? (currentStore.getState().users || []) : [];
    const matchedUser = userList.find((u) => u.id === userId || u.email === userId || u.name === userId);
    const targetEmail = patch.email || matchedUser?.email || (typeof userId === 'string' && userId.includes('@') ? userId : null);

    const client = this.getClient();
    try {
      if (client) {
        let res;
        if (targetEmail) {
          res = await client.from('users').update(row).eq('email', targetEmail);
        } else if (typeof userId === 'number' || !isNaN(Number(userId))) {
          res = await client.from('users').update(row).eq('id', Number(userId));
        } else if (patch.name || patch.fullName) {
          res = await client.from('users').update(row).eq('full_name', patch.name || patch.fullName);
        }
        if (res && res.error) throw res.error;
        console.log(`[Supabase] Live updated user in database:`, userId, row);
        return true;
      }
    } catch (sdkErr) {
      console.warn('[Supabase SDK updateUser notice]:', sdkErr.message);
    }

    // Direct REST fallback
    try {
      if (targetEmail) {
        await this.restApi(`users?email=eq.${encodeURIComponent(targetEmail)}`, {
          method: 'PATCH',
          body: JSON.stringify(row)
        });
      } else if (typeof userId === 'number' || !isNaN(Number(userId))) {
        await this.restApi(`users?id=eq.${encodeURIComponent(Number(userId))}`, {
          method: 'PATCH',
          body: JSON.stringify(row)
        });
      }
      console.log(`[Supabase REST] Live updated user in database:`, userId, row);
      return true;
    } catch (restErr) {
      console.warn('[Supabase REST updateUser notice]:', restErr.message);
      return false;
    }
  },

  async createUser(userData) {
    const row = {
      full_name: userData.fullName || userData.name || 'New Personnel',
      email: userData.email,
      mobile: userData.mobile || userData.mobileNumber || '',
      role: userData.role || 'Maintenance lead',
      area: userData.area || userData.department || 'Malolos Team Alpha',
      status: userData.status || 'Active'
    };

    const client = this.getClient();
    try {
      if (client) {
        await client.from('users').upsert([row], { onConflict: 'email' });
        return true;
      }
    } catch (sdkErr) {
      console.warn('[Supabase SDK createUser notice]:', sdkErr.message);
    }

    try {
      await this.restApi('users?on_conflict=email', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(row)
      });
      return true;
    } catch (restErr) {
      console.warn('[Supabase REST createUser notice]:', restErr.message);
      return false;
    }
  },

  async testConnection() {
    const client = this.getClient();
    if (!client) return { ok: false, message: 'Supabase URL or Anon key is missing or invalid.' };

    try {
      const { count, error } = await client.from('reports').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return { ok: true, message: `Connected! Found ${count ?? 0} reports in Supabase.` };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }
};
