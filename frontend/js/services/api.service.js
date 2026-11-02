const API_BASE = (typeof window !== 'undefined' && window.location.port === '4000')
  ? '/api/v1/admin'
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:4000/api/v1/admin'
      : '/api/v1/admin');

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
  createTeam(body) {
    return request('/teams', {
      method: 'POST',
      body: JSON.stringify(body)
    });
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
 * Client-Side Local Machine Excel Spreadsheet (.xls) Download Helper
 * Generates an Excel Spreadsheet XML document with styled headers, custom widths, and alternating rows.
 * Opens natively in Microsoft Excel on Windows / Mac without warnings.
 */
export function triggerLocalExcelDownload(filename = 'LUBA_canFindIT_Malolos_Reports.xls', rows = [], includeCitizenPii = false) {
  const escXml = (val) => String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const cleanFilename = filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename.replace(/\.csv$/, '')}.xls`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>LUBA CanFindIT · Malolos Road Defect Reports</Title>
  <Subject>City of Malolos Road Maintenance Export</Subject>
  <Author>City Engineering Office, City of Malolos</Author>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E3959"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0B1F36"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#102D4F" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="14" ss:Bold="1" ss:Color="#102D4F"/>
  </Style>
  <Style ss:ID="DataStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#1E3959"/>
  </Style>
  <Style ss:ID="ResolvedStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#197653"/>
   <Interior ss:Color="#E8F5EE" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HighStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#B93838"/>
   <Interior ss:Color="#FDF2F2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="MedStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#D95820"/>
   <Interior ss:Color="#FFF7ED" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Malolos Road Defects">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="105"/>
   <Column ss:Width="175"/>
   <Column ss:Width="125"/>
   <Column ss:Width="135"/>
   <Column ss:Width="155"/>
   <Column ss:Width="90"/>
   <Column ss:Width="105"/>
   <Column ss:Width="105"/>
   ${includeCitizenPii ? '<Column ss:Width="135"/><Column ss:Width="165"/><Column ss:Width="125"/>' : ''}
   <Row ss:Height="28">
    <Cell ss:MergeAcross="${includeCitizenPii ? 10 : 7}" ss:StyleID="TitleStyle">
     <Data ss:Type="String">LUBA CanFindIT · City of Malolos, Bulacan · Official Road Defect Export</Data>
    </Cell>
   </Row>
   <Row ss:Height="24" ss:StyleID="HeaderStyle">
    <Cell><Data ss:Type="String">Report ID</Data></Cell>
    <Cell><Data ss:Type="String">Road Location</Data></Cell>
    <Cell><Data ss:Type="String">Jurisdiction</Data></Cell>
    <Cell><Data ss:Type="String">Barangay</Data></Cell>
    <Cell><Data ss:Type="String">Coordinates</Data></Cell>
    <Cell><Data ss:Type="String">Severity</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
    <Cell><Data ss:Type="String">Reported Date</Data></Cell>
    ${includeCitizenPii ? '<Cell><Data ss:Type="String">Citizen Name</Data></Cell><Cell><Data ss:Type="String">Citizen Email</Data></Cell><Cell><Data ss:Type="String">Citizen Mobile</Data></Cell>' : ''}
   </Row>`;

  rows.forEach((r) => {
    const sevStyle = r.severity === 'High' ? ' ss:StyleID="HighStyle"' : r.severity === 'Medium' ? ' ss:StyleID="MedStyle"' : ' ss:StyleID="DataStyle"';
    const statusStyle = r.status === 'Resolved' ? ' ss:StyleID="ResolvedStyle"' : ' ss:StyleID="DataStyle"';

    xml += `\n   <Row ss:Height="19">
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.code)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.road)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.jurisdiction || 'City')}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.barangay)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.coordinates)}</Data></Cell>
    <Cell${sevStyle}><Data ss:Type="String">${escXml(r.severity)}</Data></Cell>
    <Cell${statusStyle}><Data ss:Type="String">${escXml(r.status)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.reportedDate || '')}</Data></Cell>`;

    if (includeCitizenPii && r.citizen) {
      xml += `\n    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.citizen.name || '')}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.citizen.email || '')}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escXml(r.citizen.mobile || '')}</Data></Cell>`;
    }

    xml += `\n   </Row>`;
  });

  xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Client-Side Local Machine PDF Summary Generator
 * Creates a valid multi-page binary PDF document (%PDF-1.4) with official City of Malolos branding,
 * executive analytics KPIs, formatted defect listings with color-coded severities, and running page numbers.
 */
export function triggerLocalPdfDownload(filename = 'LUBA_canFindIT_Malolos_Summary.pdf', rows = [], options = {}) {
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename.replace(/\.[^/.]+$/, '')}.pdf`;
  const dateStr = options.date || '21 October 2026';
  const kpis = options.kpis || { total: rows.length || 1284, resolved: 620, inProgress: 382, assigned: 244 };

  const esc = (txt) => String(txt ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u00B7]/g, '|')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

  const pages = [];
  const rowsPerPage = 22;
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  for (let p = 0; p < totalPages; p++) {
    const pageRows = rows.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    let stream = '';

    // Draw Navy Header Bar (x: 40, y: 725, w: 532, h: 50)
    stream += '0.063 0.176 0.310 rg 40 725 532 50 re f\n'; // #102D4F
    
    // Header text
    stream += '1 1 1 rg\n';
    stream += 'BT /F2 13 Tf 55 754 Td (' + esc('LUBA CanFindIT | City of Malolos, Bulacan') + ') Tj ET\n';
    stream += 'BT /F1 8.5 Tf 55 738 Td (' + esc('Road Defect Operations | Analytical Summary Report | ' + dateStr) + ') Tj ET\n';

    let tableTop = 705;
    if (p === 0) {
      stream += '0.95 0.96 0.98 rg 40 660 532 50 re f\n'; // #F3F6FA
      stream += '0.80 0.85 0.90 RG 1 w 40 660 532 50 re S\n';
      
      stream += '0.12 0.22 0.35 rg\n'; // #1E3959
      stream += 'BT /F2 10 Tf 55 693 Td (' + esc('TOTAL MONITORED DEFECTS: ' + kpis.total) + ') Tj ET\n';
      stream += 'BT /F1 8.5 Tf 55 675 Td (' + esc('Resolved: ' + kpis.resolved + '  |  In Progress: ' + kpis.inProgress + '  |  Assigned: ' + kpis.assigned) + ') Tj ET\n';
      
      stream += 'BT /F2 8.5 Tf 365 693 Td (' + esc('JURISDICTION: City of Malolos LGU') + ') Tj ET\n';
      stream += 'BT /F1 8 Tf 365 675 Td (' + esc('City Engineering Office Official Export') + ') Tj ET\n';
      tableTop = 645;
    }

    // Table Header Bar (x: 40, y: tableTop - 18, w: 532, h: 20)
    stream += '0.12 0.22 0.35 rg 40 ' + (tableTop - 18) + ' 532 20 re f\n'; // #1E3959
    stream += '1 1 1 rg\n';
    stream += 'BT /F2 8 Tf 50 ' + (tableTop - 12) + ' Td (REPORT ID) Tj ET\n';
    stream += 'BT /F2 8 Tf 135 ' + (tableTop - 12) + ' Td (ROAD LOCATION) Tj ET\n';
    stream += 'BT /F2 8 Tf 265 ' + (tableTop - 12) + ' Td (BARANGAY) Tj ET\n';
    stream += 'BT /F2 8 Tf 375 ' + (tableTop - 12) + ' Td (SEVERITY) Tj ET\n';
    stream += 'BT /F2 8 Tf 440 ' + (tableTop - 12) + ' Td (STATUS) Tj ET\n';
    stream += 'BT /F2 8 Tf 510 ' + (tableTop - 12) + ' Td (DATE) Tj ET\n';

    // Rows
    let y = tableTop - 34;
    pageRows.forEach((r, idx) => {
      if (idx % 2 === 1) {
        stream += '0.97 0.98 0.99 rg 40 ' + (y - 4) + ' 532 16 re f\n';
      }
      stream += '0.90 0.92 0.94 RG 0.5 w 40 ' + (y - 4) + ' m 572 ' + (y - 4) + ' l S\n';

      stream += '0.12 0.22 0.35 rg\n';
      stream += 'BT /F2 8 Tf 50 ' + y + ' Td (' + esc(r.code) + ') Tj ET\n';
      stream += 'BT /F1 8 Tf 135 ' + y + ' Td (' + esc((r.road || '').slice(0, 24)) + ') Tj ET\n';
      stream += 'BT /F1 8 Tf 265 ' + y + ' Td (' + esc((r.barangay || '').slice(0, 20)) + ') Tj ET\n';

      if (r.severity === 'High') {
        stream += '0.73 0.22 0.22 rg\n'; // Red #B93838
      } else if (r.severity === 'Medium') {
        stream += '0.85 0.35 0.13 rg\n'; // Amber #D95820
      } else {
        stream += '0.13 0.35 0.57 rg\n'; // Blue #225A91
      }
      stream += 'BT /F2 8 Tf 375 ' + y + ' Td (' + esc(r.severity) + ') Tj ET\n';

      if (r.status === 'Resolved') {
        stream += '0.10 0.46 0.33 rg\n'; // Green #197653
      } else if (r.status === 'Rejected') {
        stream += '0.73 0.22 0.22 rg\n';
      } else {
        stream += '0.13 0.35 0.57 rg\n';
      }
      stream += 'BT /F2 8 Tf 440 ' + y + ' Td (' + esc(r.status) + ') Tj ET\n';

      stream += '0.38 0.48 0.61 rg\n'; // #627B9B
      stream += 'BT /F1 7.5 Tf 510 ' + y + ' Td (' + esc((r.reportedDate || '21 Oct').slice(0, 10)) + ') Tj ET\n';

      y -= 17;
    });

    // Running Footer
    stream += '0.38 0.48 0.61 rg\n';
    stream += 'BT /F1 8 Tf 40 30 Td (' + esc('City Engineering Office | City of Malolos, Bulacan | Official Operational Document') + ') Tj ET\n';
    stream += 'BT /F1 8 Tf 505 30 Td (' + esc('Page ' + (p + 1) + ' of ' + totalPages) + ') Tj ET\n';

    pages.push(stream);
  }

  // Assemble PDF document
  let body = '%PDF-1.4\n';
  const offsets = [];

  function writeObj(str) {
    offsets.push(body.length);
    body += str + '\n';
  }

  writeObj('1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj');
  
  const pageObjNums = [];
  for (let i = 0; i < pages.length; i++) {
    pageObjNums.push(5 + i * 2);
  }
  writeObj('2 0 obj\n<</Type /Pages /Kids [' + pageObjNums.map((n) => n + ' 0 R').join(' ') + '] /Count ' + pages.length + '>>\nendobj');
  writeObj('3 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>\nendobj');
  writeObj('4 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding>>\nendobj');

  pages.forEach((streamText, idx) => {
    const pageNum = 5 + idx * 2;
    const contentNum = pageNum + 1;
    writeObj(pageNum + ' 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 3 0 R /F2 4 0 R>>>> /Contents ' + contentNum + ' 0 R>>\nendobj');
    const streamLen = streamText.length;
    writeObj(contentNum + ' 0 obj\n<</Length ' + streamLen + '>>\nstream\n' + streamText + 'endstream\nendobj');
  });

  const startXref = body.length;
  body += 'xref\n0 ' + (offsets.length + 1) + '\n';
  body += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    body += String(offset).padStart(10, '0') + ' 00000 n \n';
  });

  body += 'trailer\n<</Size ' + (offsets.length + 1) + ' /Root 1 0 R>>\n';
  body += 'startxref\n' + startXref + '\n%%EOF';

  const blob = new Blob([body], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Phase 4.3 Client-Side Local Machine CSV Download Helper
 * Generates a UTF-8 BOM CSV file and triggers native browser download directly to the user's local Downloads folder.
 */
export function triggerLocalCsvDownload(filename, rows, includeCitizenPii = false) {
  const headers = [
    'Report ID', 'Road', 'Jurisdiction', 'Barangay', 'Coordinates', 'Severity', 'Status', 'Reported Date'
  ];
  if (includeCitizenPii) {
    headers.push('Citizen Name', 'Citizen Email', 'Citizen Mobile');
  }

  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csvRows = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => {
      const cols = [r.code, r.road, r.jurisdiction || 'City', r.barangay, r.coordinates, r.severity, r.status, r.reportedDate];
      if (includeCitizenPii && r.citizen) {
        cols.push(r.citizen.name, r.citizen.email, r.citizen.mobile);
      }
      return cols.map(escapeCsv).join(',');
    })
  ];

  // Create a UTF-8 Blob and trigger native browser save-to-disk
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'application/vnd.ms-excel;charset=utf-8;' });
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
 * with automatic fallback to client-side triggerLocalExcelDownload if running offline.
 */
export async function downloadCsvToLocalMachine({
  filename = `LUBA canFindIT_Malolos_2026-10-21.xls`,
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
    // Fallback to client-side local machine Excel generator
  }
  triggerLocalExcelDownload(filename, rows, includeCitizenPii);
  return true;
}
