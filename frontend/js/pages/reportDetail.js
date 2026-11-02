// Page renderer for Screen 3: Report Details (RW-2026-0842 citizen photo, evidence, schematic map, activity timeline) with Malolos localization.

import { renderBanner } from '../components/banner.js';
import { renderStatusBadge, renderSeverityBadge } from '../components/badge.js';
import { parseCoordinates } from '../components/realMalolosMap.js';
import { getReportPhotoUrl } from '../utils/format.js';

export function renderReportDetail(state) {
  const currentCode = (state && state.selectedReportCode) || 'RW-2026-0842';
  const report = (state && state.reports && state.reports.find((r) => r.code === currentCode)) || {
    code: currentCode,
    road: 'MacArthur Highway (Manila North Road)',
    barangay: 'Guinhawa',
    jurisdiction: 'DPWH-National',
    severity: 'High',
    status: 'Under Review',
    reportedDate: '19 Oct 2026',
    coordinates: '14.8524° N, 120.8168° E',
    landmark: 'Northbound lane near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan',
    description: 'Deep asphalt pothole along MacArthur Highway northbound lane. Motorcycles and jeepneys swerve into oncoming traffic; water collects during rain.',
    citizen: {
      name: 'Mika Reyes',
      email: 'mika.reyes@malolos.gov.ph',
      mobile: '+63 917 000 0184'
    }
  };

  const isDpwh = report.jurisdiction === 'DPWH-National';
  const coords = parseCoordinates(report.coordinates) || [14.8524, 120.8168];
  const mapViewType = (state && state.detailMapViewType) || 'real';

  return `
    <div class="space-y-5">
      <!-- Breadcrumb & Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs text-luba-textSubtle mb-1">
            <button type="button" data-screen-jump="2" class="hover:text-luba-info hover:underline">Reports</button>
            <span>/</span>
            <span class="font-bold text-luba-textPrimary">${report.code}</span>
          </div>
          <h1 class="luba-page-title">${report.code}</h1>
          <p class="luba-page-subtitle">Report details · City of Malolos · Received ${report.reportedDate || '19 October 2026'}</p>
        </div>

        <div class="flex items-center gap-2.5">
          <button type="button" data-screen-jump="2" class="luba-btn-secondary px-4 py-2.5 font-semibold inline-flex items-center gap-1.5 shadow-sm hover:bg-luba-canvas">
            <svg class="w-4 h-4 text-luba-textSecondary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to reports
          </button>

          ${
            report.status === 'Verified'
              ? (isDpwh
                  ? `<button type="button" data-forward-dpwh="${report.code}" class="luba-btn-primary bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center gap-1.5 px-4 py-2.5 font-bold shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      Forward to DPWH
                    </button>`
                  : `<button type="button" data-assign-report="${report.code}" class="luba-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5 font-bold shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                      Assign crew →
                    </button>`
                )
              : (report.status === 'In Progress')
                ? `<button type="button" data-review-completion="${report.code}" class="luba-btn-primary bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 px-4 py-2.5 font-bold shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Review repair completion →
                  </button>`
              : (report.status === 'Assigned')
                ? `<button type="button" data-resolve-report="${report.code}" class="luba-btn-primary bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 px-4 py-2.5 font-bold shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Mark as Resolved
                  </button>`
                : (report.status === 'Resolved')
                  ? `<span class="px-3 py-1.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                      ✓ Repair Resolved & Approved
                    </span>`
                  : (report.status === 'Forwarded to DPWH')
                    ? `<span class="px-3 py-1.5 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                        Forwarded to DPWH Bulacan 1st DEO
                      </span>`
                    : (report.status === 'Rejected' || report.status === 'Duplicate')
                      ? `<span class="px-3 py-1.5 text-xs font-semibold rounded bg-gray-100 text-gray-600 border border-gray-200">
                          Closed · ${report.status}
                        </span>`
                      : `
                        <button type="button" data-open-modal="reject_report" class="luba-btn-secondary text-xs text-luba-danger px-3 py-2 border-luba-border hover:bg-red-50">
                          Reject
                        </button>
                        <button type="button" data-open-modal="duplicate_outcome" class="luba-btn-secondary text-xs px-3 py-2 border-luba-border hover:bg-luba-canvas">
                          Duplicate
                        </button>
                        <button type="button" data-screen-jump="4" class="luba-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5 font-bold shadow-sm">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                          Verify report →
                        </button>
                      `
          }
        </div>
      </div>

      ${
        isDpwh
          ? renderBanner({
              variant: 'warning',
              title: 'DPWH National Road Corridor',
              body: `${report.road} is under DPWH Bulacan 1st District Engineering Office jurisdiction. Verified reports can be forwarded directly to DPWH.`
            })
          : ''
      }

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <!-- Left 8 cols -->
        <div class="lg:col-span-8 space-y-5">
          <div class="luba-card overflow-hidden">
            <img src="${getReportPhotoUrl(report)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Citizen reported pothole" class="w-full h-[304px] object-cover"/>
          </div>

          <div class="luba-card p-5 space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-lg font-bold text-luba-textPrimary">${report.road}</h2>
                <span class="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  isDpwh
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-50 text-luba-info border border-luba-infoBorder'
                }">
                  ${report.jurisdiction}
                </span>
              </div>
              ${renderStatusBadge(report.status)}
            </div>
            <p class="text-xs text-luba-textSubtle">${report.landmark}</p>
            <p class="text-xs text-luba-textPrimary leading-relaxed">${report.description}</p>
            <div class="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p class="text-[11px] text-luba-textSubtle mb-1">Citizen-reported severity</p>
                ${renderSeverityBadge(report.severity)}
              </div>
              <div>
                <p class="text-[11px] text-luba-textSubtle mb-1">Evidence</p>
                <p class="text-xs font-bold text-luba-textPrimary">1 photo · 2.4 MB</p>
              </div>
            </div>
          </div>

          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-luba-textPrimary">Location evidence</h3>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-luba-border rounded-lg text-xs font-semibold text-luba-navy shadow-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>OpenStreetMap (GPS)</span>
              </div>
            </div>

            <div class="relative w-full h-[288px] rounded-card overflow-hidden border border-luba-border bg-[#F8FAFC] shadow-xs">
              <div id="report-detail-leaflet-map" class="w-full h-full z-0"></div>
              <!-- Live GPS Malolos Watermark / Status Badge -->
              <div class="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-luba-border shadow-xs text-[11px] text-luba-textSecondary flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-semibold text-luba-textPrimary">City of Malolos GPS</span>
                <span class="text-luba-textSubtle">· ${report.coordinates}</span>
              </div>
              <!-- Recenter Crosshair Button matching Figma Screen 3 -->
              <button
                type="button"
                id="btn-recenter-report-detail-map"
                title="Recenter map to pothole location"
                class="absolute bottom-3 right-3 z-[400] w-8 h-8 rounded-lg bg-white border border-luba-border flex items-center justify-center text-luba-textPrimary shadow-sm hover:bg-luba-canvas cursor-pointer transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
                </svg>
              </button>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
              <p class="text-luba-textSecondary">
                Coordinates · <strong class="text-luba-textPrimary font-semibold">${report.coordinates}</strong> · GPS accuracy ±8 m
              </p>
              ${
                coords
                  ? `<a
                      href="https://www.google.com/maps?q=${coords[0]},${coords[1]}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-luba-info hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open in Google Maps</span>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>`
                  : ''
              }
            </div>
          </div>
        </div>

        <!-- Right 4 cols -->
        <div class="lg:col-span-4 space-y-5">
          <!-- Submitter Info -->
          <div class="luba-card p-5 space-y-2.5">
            <h3 class="text-base font-bold text-luba-textPrimary">Submitted by</h3>
            <p class="text-xs text-luba-textSecondary">Citizen · ${report.citizen ? report.citizen.name : 'Citizen'}</p>
            <p class="text-xs text-luba-textSecondary">Email · ${report.citizen ? report.citizen.email : 'contact@malolos.gov.ph'}</p>
            <p class="text-xs text-luba-textSecondary">Mobile · ${report.citizen ? report.citizen.mobile : '+63 900 000 0000'}</p>
            <p class="text-xs text-luba-textSecondary">Barangay · ${report.barangay}</p>
            <p class="text-xs text-luba-textSecondary">Submitted · ${report.reportedDate || '19 Oct 2026'}</p>
            ${renderBanner({
              variant: 'info',
              title: 'Restricted personal data',
              body: 'Visible only to authorized City of Malolos LGU staff.',
              extraClass: 'mt-2'
            })}
          </div>

          <!-- Activity & history -->
          <div class="luba-card p-5 space-y-3">
            <h3 class="text-base font-bold text-luba-textPrimary">Activity & history</h3>
            <div class="space-y-3 text-xs">
              <div class="border-l-2 border-luba-success pl-3">
                <p class="font-bold text-luba-success">Submitted · ${report.reportedDate || '19 Oct'} · 9:24 AM</p>
                <p class="text-luba-textSubtle">Report received from ${report.citizen ? report.citizen.name : 'Citizen'} in Brgy. ${report.barangay}.</p>
              </div>

              ${
                report.status !== 'Submitted'
                  ? `<div class="border-l-2 border-luba-success pl-3">
                      <p class="font-bold text-luba-success">Under Review · 19 Oct · 9:31 AM</p>
                      <p class="text-luba-textSubtle">Location and photo verified on ${report.road}.</p>
                    </div>`
                  : ''
              }

              ${
                report.status === 'Verified' || report.status === 'Assigned' || report.status === 'In Progress' || report.status === 'Resolved' || report.status === 'Forwarded to DPWH'
                  ? `<div class="border-l-2 border-luba-success pl-3">
                      <p class="font-bold text-luba-success">Verified · 19 Oct · 10:15 AM</p>
                      <p class="text-luba-textSubtle">Approved by Ana Dela Cruz (LGU Admin).</p>
                    </div>`
                  : `<div class="border-l-2 border-luba-border pl-3">
                      <p class="font-semibold text-luba-textMuted">Verified · Pending</p>
                      <p class="text-luba-textSubtle">Awaiting administrator verification.</p>
                    </div>`
              }

              ${
                report.status === 'Assigned' || report.status === 'In Progress' || report.status === 'Resolved'
                  ? `<div class="border-l-2 border-luba-success pl-3">
                      <p class="font-bold text-luba-success">Assigned · Malolos Team Alpha</p>
                      <p class="text-luba-textSubtle">Dispatched for asphalt repair.</p>
                    </div>`
                  : report.status === 'Forwarded to DPWH'
                    ? `<div class="border-l-2 border-amber-500 pl-3">
                        <p class="font-bold text-amber-700">Forwarded to DPWH</p>
                        <p class="text-luba-textSubtle">Transmitted to DPWH Bulacan 1st DEO.</p>
                      </div>`
                    : `<div class="border-l-2 border-luba-border pl-3">
                        <p class="font-semibold text-luba-textMuted">Dispatch / Forward · Pending</p>
                        <p class="text-luba-textSubtle">DPWH or Malolos Team Alpha assignment.</p>
                      </div>`
              }

              ${
                report.status === 'Resolved'
                  ? `<div class="border-l-2 border-emerald-600 pl-3">
                      <p class="font-bold text-emerald-700">Resolved · 21 Oct · 11:20 AM</p>
                      <p class="text-luba-textSubtle">Inspection completed and accepted.</p>
                    </div>`
                  : ''
              }
            </div>

            <div class="pt-2 border-t border-luba-border">
              <button type="button" data-screen-jump="12" class="text-xs font-bold text-luba-cta hover:underline inline-flex items-center gap-1 cursor-pointer">
                View complete activity & audit log →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export { renderReportDetail as renderReportDetailsView };
