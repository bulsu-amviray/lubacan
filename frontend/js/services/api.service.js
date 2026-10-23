const API_BASE = '/api/v1/admin';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export const apiService = {
  getOverviewAnalytics(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/analytics/overview${qs ? `?${qs}` : ''}`);
  },
  listReports(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports${qs ? `?${qs}` : ''}`);
  },
  getReportDetails(reportCode) {
    return request(`/reports/${encodeURIComponent(reportCode)}`);
  },
  verifyReport(reportCode, body) {
    return request(`/reports/${encodeURIComponent(reportCode)}/verify`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  compareDuplicate(reportCode, body) {
    return request(`/reports/${encodeURIComponent(reportCode)}/compare-duplicate`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  assignTeam(reportCode, body) {
    return request(`/reports/${encodeURIComponent(reportCode)}/assign`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  reviewCompletion(reportCode, body) {
    return request(`/reports/${encodeURIComponent(reportCode)}/review-completion`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  getReportAuditLog(reportCode, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/${encodeURIComponent(reportCode)}/audit-log${qs ? `?${qs}` : ''}`);
  },
  listTeams() {
    return request('/teams');
  },
  getTeamDetails(teamCode) {
    return request(`/teams/${encodeURIComponent(teamCode)}`);
  },
  invitePersonnel(body) {
    return request('/teams/personnel/invite', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  updatePersonnel(userId, body) {
    return request(`/teams/personnel/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },
  listUsers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/users${qs ? `?${qs}` : ''}`);
  },
  getUserDetails(userId) {
    return request(`/users/${encodeURIComponent(userId)}`);
  },
  updateUserStatus(userId, body) {
    return request(`/users/${encodeURIComponent(userId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },
  getAdminProfile() {
    return request('/profile/preferences');
  },
  updateAdminProfile(body) {
    return request('/profile/preferences', {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },
  getWorkspaceSettings() {
    return request('/settings/workspace');
  },
  updateWorkspaceSettings(body) {
    return request('/settings/workspace', {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }
};

/**
 * Phase 4.3 Client-Side Local Machine CSV Download Helper
 * Generates a UTF-8 BOM CSV file and triggers native browser download directly to the user's local Downloads folder.
 */
export function triggerLocalCsvDownload(filename, rows, includeCitizenPii = false) {
  const headers = [
    'Report ID', 'Road', 'Barangay', 'Coordinates', 'Severity', 'Status', 'Reported Date'
  ];
  if (includeCitizenPii) {
    headers.push('Citizen Name', 'Citizen Email', 'Citizen Mobile');
  }

  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csvRows = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => {
      const cols = [r.code, r.road, r.barangay, r.coordinates, r.severity, r.status, r.reportedDate];
      if (includeCitizenPii && r.citizen) {
        cols.push(r.citizen.name, r.citizen.email, r.citizen.mobile);
      }
      return cols.map(escapeCsv).join(',');
    })
  ];

  // Create a UTF-8 Blob and trigger native browser save-to-disk
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Triggers direct browser download from Backend /api/v1/admin/exports/download-csv
 * with automatic fallback to client-side triggerLocalCsvDownload if running offline.
 */
export async function downloadCsvToLocalMachine({
  filename = `LUBA canFindIT_QC_2026-10-21.csv`,
  rows = [],
  includeCitizenPii = false
}) {
  try {
    const res = await fetch(
      `${API_BASE}/exports/download-csv?includeCitizenPii=${includeCitizenPii ? 'true' : 'false'}&snapshotDate=2026-10-21`
    );
    if (res.ok) {
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      return true;
    }
  } catch {
    // Fallback to client-side local machine CSV generator
  }
  triggerLocalCsvDownload(filename, rows, includeCitizenPii);
  return true;
}
