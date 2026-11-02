// Interactive Real Geographic Map of City of Malolos, Bulacan powered by Leaflet & OpenStreetMap.
import { store } from '../state/store.js';
import { getReportPhotoUrl, FALLBACK_POTHOLE_SVG } from '../utils/format.js';
export { FALLBACK_POTHOLE_SVG };

// OpenStreetMap standard raster tiles configuration
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_TILE_OPTIONS = {
  maxZoom: 19,
  subdomains: ['a', 'b', 'c'],
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
};

export function createOsmTileLayer() {
  const layer = L.tileLayer(OSM_TILE_URL, OSM_TILE_OPTIONS);
  layer.on('tileerror', function(error, tile) {
    if (tile && !tile.dataset.fallbackTried) {
      tile.dataset.fallbackTried = 'true';
      tile.src = `https://tile.openstreetmap.de/${error.coords.z}/${error.coords.x}/${error.coords.y}.png`;
    }
  });
  return layer;
}

let mapInstance = null;
let markersLayer = null;
export let markersRegistry = [];
let lastSearchQuery = null;

export function selectPotholeMapPin(code) {
  if (!code) return;
  const match = markersRegistry.find((m) => m.code === code);
  if (match && mapInstance) {
    mapInstance.panTo(match.coords, { animate: true });
    match.marker.openPopup();
  }
  store.setSilentState((s) => ({
    mapFilters: { ...s.mapFilters, selectedPinCode: code }
  }));
  if (typeof window !== 'undefined' && typeof window.lubaUpdatePotholeSidebar === 'function') {
    window.lubaUpdatePotholeSidebar(code);
  }
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderRoundPushpinSvg(color, isSelected = false, size = 24) {
  const width = size;
  const height = Math.round((size * 30) / 24);
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));">
      <path d="M12 1.5C7.03 1.5 3 5.53 3 10.5C3 17 11.25 27.5 11.58 27.93C11.79 28.2 12.21 28.2 12.42 27.93C12.75 27.5 21 17 21 10.5C21 5.53 16.97 1.5 12 1.5Z" 
            fill="${color}" 
            stroke="#FFFFFF" 
            stroke-width="1.8" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>
      <circle cx="12" cy="10.5" r="3.6" fill="#FFFFFF"/>
      ${isSelected ? '<circle cx="12" cy="10.5" r="2" fill="#102D4F"/>' : ''}
    </svg>
  `;
}

export function createRoundPushpinIcon({ color, label, isSelected = false, className = '', size = 24 }) {
  const width = size;
  const height = Math.round((size * 30) / 24);
  const anchorX = Math.round(width / 2);
  const anchorY = height - 1;

  return L.divIcon({
    className: 'custom-pothole-pin-container',
    html: `
      <div class="flex items-start gap-1 cursor-pointer transform transition-transform duration-150 hover:scale-110 ${
        isSelected ? 'scale-110 z-50' : 'z-10'
      } ${className}" style="transform-origin: ${anchorX}px ${anchorY}px;">
        <div class="shrink-0 relative flex items-center justify-center">
          ${renderRoundPushpinSvg(color, isSelected, size)}
        </div>
        ${label ? `
          <span class="px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded-md text-[11px] font-bold shadow-sm border border-luba-border whitespace-nowrap ${
            isSelected ? 'ring-2 ring-[#102D4F]' : ''
          }" style="color: ${color}; margin-top: 1px;">
            ${escapeHtml(label)}
          </span>
        ` : ''}
      </div>
    `,
    iconSize: [label ? 140 : width, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -anchorY]
  });
}


export function parseCoordinates(coordStr) {
  if (!coordStr) return null;
  if (Array.isArray(coordStr) && coordStr.length >= 2) {
    return [parseFloat(coordStr[0]), parseFloat(coordStr[1])];
  }
  if (typeof coordStr === 'object' && coordStr.lat && coordStr.lng) {
    return [parseFloat(coordStr.lat), parseFloat(coordStr.lng)];
  }
  const str = String(coordStr).trim();
  const match = str.match(/([+-]?[\d\.]+)\s*°?\s*N?,\s*([+-]?[\d\.]+)\s*°?\s*E?/i);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[2])];
  }
  const parts = str.split(',');
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
  }
  return null;
}

export function filterMapReports(reports = [], mf = {}) {
  const q = (mf.search || '').trim().toLowerCase();
  const qClean = q.replace(/[^a-z0-9]/g, '');

  return (reports || []).filter((r) => {
    // Mode pill filter
    if (mf.modePill === 'Open only' && r.status === 'Resolved') return false;
    if (mf.modePill === 'Resolved' && r.status !== 'Resolved') return false;

    // Explicit Status filter
    if (mf.status && mf.status !== 'All statuses' && r.status !== mf.status) return false;

    // Severity filter
    if (mf.severity && mf.severity !== 'All severities' && r.severity !== mf.severity) return false;

    // Jurisdiction filter
    if (mf.jurisdiction && mf.jurisdiction !== 'All jurisdictions' && r.jurisdiction !== mf.jurisdiction) return false;

    // Barangay filter
    if (mf.barangay && mf.barangay !== 'All barangays' && r.barangay !== mf.barangay) return false;

    // Search query: checks code (e.g. RW-2026-0842, 0842, 842), road, barangay, landmark, description, status, jurisdiction, citizen name
    if (q) {
      const code = (r.code || '').toLowerCase();
      const codeClean = code.replace(/[^a-z0-9]/g, '');
      const codeMatch = code.includes(q) || (qClean.length >= 2 && codeClean.includes(qClean));
      const roadMatch = (r.road || '').toLowerCase().includes(q);
      const brgyMatch = (r.barangay || '').toLowerCase().includes(q);
      const landmarkMatch = (r.landmark || '').toLowerCase().includes(q);
      const descMatch = (r.description || '').toLowerCase().includes(q);
      const statusMatch = (r.status || '').toLowerCase().includes(q);
      const jurMatch = (r.jurisdiction || '').toLowerCase().includes(q);
      const citizenMatch = (r.citizen?.name || '').toLowerCase().includes(q);

      if (!codeMatch && !roadMatch && !brgyMatch && !landmarkMatch && !descMatch && !statusMatch && !jurMatch && !citizenMatch) {
        return false;
      }
    }

    return true;
  });
}

export function renderRealMalolosMapContainer({ selectedPin = 'RW-2026-0842', mapViewType = 'real' }) {
  return `
    <div class="relative w-full h-[540px] rounded-2xl overflow-hidden border border-luba-border bg-[#F8FAFC] shadow-xs">
      <div id="malolos-leaflet-map" class="w-full h-full z-0"></div>

      <!-- Real GPS / Schematic Toggle Switcher -->
      <div class="absolute top-3 right-3 z-[400] flex items-center bg-white/95 backdrop-blur-sm border border-luba-border rounded-lg p-1 shadow-sm gap-1 text-xs">
        <button
          type="button"
          data-map-view-toggle="real"
          class="px-3 py-1 rounded font-semibold transition cursor-pointer ${
            mapViewType !== 'schematic'
              ? 'bg-luba-navy text-white shadow-xs'
              : 'text-luba-textSecondary hover:text-luba-textPrimary'
          }"
        >
          Real Malolos Map (GPS)
        </button>
        <button
          type="button"
          data-map-view-toggle="schematic"
          class="px-3 py-1 rounded font-semibold transition cursor-pointer ${
            mapViewType === 'schematic'
              ? 'bg-luba-navy text-white shadow-xs'
              : 'text-luba-textSecondary hover:text-luba-textPrimary'
          }"
        >
          Schematic View
        </button>
      </div>

      <!-- Live GPS Malolos Watermark / Status Badge -->
      <div class="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-luba-border shadow-xs text-[11px] text-luba-textSecondary flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-semibold text-luba-textPrimary">City of Malolos GPS</span>
        <span class="text-luba-textSubtle">· 14.8527° N, 120.8160° E</span>
      </div>
    </div>
  `;
}

export function initRealMalolosMap(state) {
  const container = document.getElementById('malolos-leaflet-map');
  if (!container || typeof L === 'undefined') return;

  const mf = state.mapFilters || {};
  if (mf.mapViewType === 'schematic') return;

  const colorMap = {
    High: '#B93838',
    Medium: '#D95820',
    Low: '#225A91'
  };

  // Filter reports according to active filters
  const allReports = state.reports || [];
  const filtered = filterMapReports(allReports, mf);

  // If no reports match, overlay a friendly search notice
  if (filtered.length === 0) {
    const parent = container.parentElement;
    const existingNotice = parent.querySelector('.no-results-overlay');
    if (existingNotice) existingNotice.remove();

    const noResultsDiv = document.createElement('div');
    noResultsDiv.className = 'no-results-overlay absolute inset-0 z-[400] flex items-center justify-center bg-white/75 backdrop-blur-[2px] pointer-events-auto p-4';
    noResultsDiv.innerHTML = `
      <div class="bg-white border border-luba-border rounded-xl p-5 shadow-lg max-w-sm text-center space-y-3">
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-luba-textSubtle">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <p class="text-xs font-bold text-luba-textPrimary">No reports found</p>
        <p class="text-[11px] text-luba-textSubtle leading-relaxed">No pothole pins match "${escapeHtml(mf.search || '')}". Try adjusting your keywords or clearing the search filter.</p>
        <button type="button" data-clear-map-search class="px-3.5 py-1.5 bg-luba-navy text-white text-xs font-semibold rounded-lg hover:opacity-90 transition cursor-pointer">
          Clear Search
        </button>
      </div>
    `;
    parent.appendChild(noResultsDiv);
    return;
  } else {
    const parent = container.parentElement;
    const existingNotice = parent.querySelector('.no-results-overlay');
    if (existingNotice) existingNotice.remove();
  }

  // Reuse existing Leaflet map instance if container is already mounted
  let isNewInstance = false;
  if (!mapInstance || !container._leaflet_id) {
    if (mapInstance) {
      try {
        mapInstance.remove();
      } catch (_) {}
      mapInstance = null;
    }

    const defaultCenter = [14.8527, 120.8160];
    mapInstance = L.map(container, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: true,
      fadeAnimation: false,
      zoomAnimation: true
    });

    createOsmTileLayer().addTo(mapInstance);
    markersLayer = L.layerGroup().addTo(mapInstance);
    isNewInstance = true;
  } else if (!markersLayer) {
    markersLayer = L.layerGroup().addTo(mapInstance);
  }

  // Clear existing markers cleanly without re-creating the map
  markersLayer.clearLayers();
  markersRegistry = [];

  let effectiveSelectedCode = mf.selectedPinCode;
  const isSelectedVisible = filtered.some((r) => r.code === effectiveSelectedCode);
  if (!isSelectedVisible && filtered.length > 0) {
    effectiveSelectedCode = filtered[0].code;
  }

  let selectedMarker = null;
  const markers = [];

  filtered.forEach((r) => {
    let coords = parseCoordinates(r.coordinates);
    if (!coords && r.latitude && r.longitude && !isNaN(Number(r.latitude)) && !isNaN(Number(r.longitude))) {
      coords = [Number(r.latitude), Number(r.longitude)];
    }
    if (!coords) {
      coords = [14.8527, 120.8160];
    }

    const isSelected = r.code === effectiveSelectedCode;
    const color = colorMap[r.severity] || '#D95820';
    const shortCode = r.code.replace('RW-2026-', '');

    const customIcon = createRoundPushpinIcon({
      color,
      label: `${shortCode} · ${r.severity}`,
      isSelected,
      size: 24
    });

    const marker = L.marker(coords, { icon: customIcon });
    markersLayer.addLayer(marker);
    markers.push(marker);
    markersRegistry.push({ code: r.code, marker, coords });

    marker.bindPopup(
      `<div class="p-1 space-y-1 min-w-[170px]">
        <img src="${getReportPhotoUrl(r)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Citizen report photo" class="w-full h-20 object-cover rounded border border-gray-200 mt-0.5 mb-1" />
        <p class="font-bold text-xs text-[#102D4F]">${r.code}</p>
        <p class="text-xs text-gray-700">${r.road}</p>
        <p class="text-[11px] text-gray-500">${r.barangay} · ${r.jurisdiction}</p>
        <div class="flex items-center gap-1.5 pt-0.5">
          <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${
            r.severity === 'High' ? 'bg-red-100 text-red-800' : r.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }">${r.severity}</span>
          <span class="text-[10px] text-gray-600 font-semibold">${r.status}</span>
        </div>
      </div>`,
      { offset: [0, -10] }
    );

    marker.on('click', () => {
      selectPotholeMapPin(r.code);
    });

    if (isSelected) {
      selectedMarker = marker;
      marker.openPopup();
    }
  });

  // Only adjust camera on initial mount or when search query actually changes
  const currentSearch = (mf.search || '').trim();
  const searchChanged = currentSearch !== lastSearchQuery;
  lastSearchQuery = currentSearch;

  if (isNewInstance || searchChanged) {
    if (filtered.length === 1 && selectedMarker) {
      mapInstance.setView(selectedMarker.getLatLng(), 16, { animate: !isNewInstance });
      selectedMarker.openPopup();
    } else if (currentSearch && markers.length > 1) {
      const group = L.featureGroup(markers);
      mapInstance.fitBounds(group.getBounds().pad(0.2), { maxZoom: 16, animate: !isNewInstance });
    }
  }

  // Smooth immediate size invalidation without jittery delays
  requestAnimationFrame(() => {
    if (mapInstance) {
      mapInstance.invalidateSize({ pan: false });
    }
  });
}

// -------------------------------------------------------------
// Screen 3: Location Evidence Map for Report Details
// -------------------------------------------------------------
let detailMapInstance = null;

export function initReportDetailMap(state) {
  const container = document.getElementById('report-detail-leaflet-map');
  if (!container || typeof L === 'undefined') return;

  const currentCode = state.selectedReportCode || 'RW-2026-0842';

  // If map is already initialized for this exact report, simply invalidate size without re-mounting
  if (detailMapInstance && container._leaflet_id && container.dataset.mountedReportCode === currentCode) {
    requestAnimationFrame(() => {
      if (detailMapInstance) {
        detailMapInstance.invalidateSize({ pan: false });
      }
    });
    return;
  }

  if (detailMapInstance) {
    try {
      detailMapInstance.remove();
    } catch {
      // ignore
    }
    detailMapInstance = null;
  }
  if (container._leaflet_id) {
    delete container._leaflet_id;
  }

  container.dataset.mountedReportCode = currentCode;
  const report = (state.reports || []).find((r) => r.code === currentCode) || state.reports[0] || {};
  const coords = parseCoordinates(report.coordinates) || [14.8524, 120.8168];

  detailMapInstance = L.map(container, {
    center: coords,
    zoom: 16,
    zoomControl: true
  });

  // Standard OpenStreetMap raster tiles
  createOsmTileLayer().addTo(detailMapInstance);

  // GPS Accuracy Circle (±8 m radius)
  L.circle(coords, {
    radius: 8,
    color: '#225A91',
    fillColor: '#225A91',
    fillOpacity: 0.18,
    weight: 1.5
  }).addTo(detailMapInstance);

  const color = report.severity === 'High' ? '#B93838' : report.severity === 'Medium' ? '#D95820' : '#225A91';
  const shortCode = (report.code || '').replace('RW-2026-', '');

  const customIcon = createRoundPushpinIcon({
    color,
    label: `${shortCode} · ${report.severity || 'High'}`,
    isSelected: true,
    size: 24
  });

  const marker = L.marker(coords, { icon: customIcon }).addTo(detailMapInstance);
  marker.bindPopup(
    `<div class="p-1 space-y-1 min-w-[150px]">
      <p class="font-bold text-xs text-[#102D4F]">${report.code || 'Report'}</p>
      <p class="text-xs text-gray-700">${report.road || ''}</p>
      <p class="text-[11px] text-gray-500">Brgy. ${report.barangay || ''} · ${report.jurisdiction || ''}</p>
      <p class="text-[10px] text-emerald-700 font-bold">GPS Accuracy: ±8 m</p>
    </div>`,
    { autoPan: false }
  );

  // Crosshair recenter button listener
  const recenterBtn = document.getElementById('btn-recenter-report-detail-map');
  if (recenterBtn) {
    recenterBtn.addEventListener('click', () => {
      if (detailMapInstance) {
        detailMapInstance.setView(coords, 17, { animate: true });
        marker.openPopup();
      }
    });
  }

  requestAnimationFrame(() => {
    if (detailMapInstance) {
      detailMapInstance.invalidateSize({ pan: false });
    }
  });
}

// -------------------------------------------------------------
// Screen 8: Duplicate Comparison Map (Interactive OpenStreetMap)
// -------------------------------------------------------------
let duplicateMapInstance = null;

export function initDuplicateComparisonMap(state) {
  const container = document.getElementById('duplicate-comparison-leaflet-map');
  if (!container || typeof L === 'undefined') return;

  if (duplicateMapInstance) {
    try {
      duplicateMapInstance.remove();
    } catch (_) {}
    duplicateMapInstance = null;
  }
  if (container._leaflet_id) {
    delete container._leaflet_id;
  }

  // MacArthur Highway midpoint between candidate 0842 (northbound) and existing 0819 (southbound)
  const candidateCoords = [14.8524, 120.8168];
  const existingCoords = [14.8520, 120.8170];
  const centerCoords = [14.8522, 120.8169];

  duplicateMapInstance = L.map(container, {
    center: centerCoords,
    zoom: 17,
    zoomControl: true
  });

  createOsmTileLayer().addTo(duplicateMapInstance);

  // Pin A (Candidate 0842)
  const iconA = createRoundPushpinIcon({
    color: '#B93838',
    label: 'Pin A · 0842 (Northbound)',
    isSelected: true,
    size: 24
  });

  // Pin B (Existing 0819)
  const iconB = createRoundPushpinIcon({
    color: '#225A91',
    label: 'Pin B · 0819 (Southbound)',
    isSelected: true,
    size: 24
  });

  const markerA = L.marker(candidateCoords, { icon: iconA }).addTo(duplicateMapInstance);
  markerA.bindPopup('<b>Candidate Pin A (RW-2026-0842)</b><br>MacArthur Hwy Northbound lane');

  const markerB = L.marker(existingCoords, { icon: iconB }).addTo(duplicateMapInstance);
  markerB.bindPopup('<b>Existing Pin B (RW-2026-0819)</b><br>MacArthur Hwy Southbound lane');

  // Dashed line connecting candidate and existing potholes
  L.polyline([candidateCoords, existingCoords], {
    color: '#D95820',
    weight: 2.5,
    dashArray: '5, 8'
  }).addTo(duplicateMapInstance);

  requestAnimationFrame(() => {
    if (duplicateMapInstance) {
      duplicateMapInstance.invalidateSize({ pan: false });
    }
  });
}

// -------------------------------------------------------------
// Screen 1: Operations Overview Pothole Map (Interactive OpenStreetMap)
// -------------------------------------------------------------
let overviewMapInstance = null;
let overviewMarkersLayer = null;

export function renderOverviewMapContainer({ mapViewType = 'real' }) {
  return `
    <div class="relative w-full h-[380px] rounded-2xl overflow-hidden border border-luba-border bg-[#F8FAFC] shadow-xs">
      <div id="overview-leaflet-map" class="w-full h-full z-0"></div>

      <!-- Real GPS / Schematic Toggle Switcher -->
      <div class="absolute top-3 right-3 z-[400] flex items-center bg-white/95 backdrop-blur-sm border border-luba-border rounded-lg p-1 shadow-sm gap-1 text-xs">
        <button
          type="button"
          data-overview-map-toggle="real"
          class="px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
            mapViewType !== 'schematic'
              ? 'bg-luba-navy text-white shadow-xs'
              : 'text-luba-textSecondary hover:text-luba-textPrimary'
          }"
        >
          OpenStreetMap (GPS)
        </button>
        <button
          type="button"
          data-overview-map-toggle="schematic"
          class="px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
            mapViewType === 'schematic'
              ? 'bg-luba-navy text-white shadow-xs'
              : 'text-luba-textSecondary hover:text-luba-textPrimary'
          }"
        >
          Schematic View
        </button>
      </div>

      <!-- Live GPS Malolos Watermark / Status Badge -->
      <div class="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-luba-border shadow-xs text-[11px] text-luba-textSecondary flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-semibold text-luba-textPrimary">City of Malolos GPS</span>
        <span class="text-luba-textSubtle">· 14.8527° N, 120.8160° E</span>
      </div>
    </div>
  `;
}

export function initOverviewMap(state) {
  const container = document.getElementById('overview-leaflet-map');
  if (!container || typeof L === 'undefined') return;

  if (!overviewMapInstance || !container._leaflet_id) {
    if (overviewMapInstance) {
      try {
        overviewMapInstance.remove();
      } catch (_) {}
      overviewMapInstance = null;
    }
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    // City of Malolos Center (MacArthur Highway / Capitol / Guinhawa corridor)
    const defaultCenter = [14.8527, 120.8160];
    overviewMapInstance = L.map(container, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: true,
      fadeAnimation: false,
      zoomAnimation: true
    });

    // Standard OpenStreetMap raster tiles
    createOsmTileLayer().addTo(overviewMapInstance);
    overviewMarkersLayer = L.layerGroup().addTo(overviewMapInstance);
  } else if (!overviewMarkersLayer) {
    overviewMarkersLayer = L.layerGroup().addTo(overviewMapInstance);
  }

  // Clear existing markers cleanly without re-creating the map
  overviewMarkersLayer.clearLayers();

  const colorMap = {
    High: '#B93838',
    Medium: '#D95820',
    Low: '#225A91'
  };

  const allReports = state.reports || [];
  allReports.forEach((r) => {
    let coords = parseCoordinates(r.coordinates);
    if (!coords && r.latitude && r.longitude && !isNaN(Number(r.latitude)) && !isNaN(Number(r.longitude))) {
      coords = [Number(r.latitude), Number(r.longitude)];
    }
    if (!coords) {
      coords = [14.8527, 120.8160];
    }

    const color = colorMap[r.severity] || '#D95820';
    const shortCode = (r.code || '').replace('RW-2026-', '');

    const customIcon = createRoundPushpinIcon({
      color,
      label: `${shortCode} · ${r.severity}`,
      isSelected: false,
      size: 22
    });

    const marker = L.marker(coords, { icon: customIcon });
    overviewMarkersLayer.addLayer(marker);

    marker.bindPopup(
      `<div class="p-1 space-y-1 min-w-[170px]">
        <img src="${getReportPhotoUrl(r)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Citizen report photo" class="w-full h-20 object-cover rounded border border-gray-200 mt-0.5 mb-1" />
        <p class="font-bold text-xs text-[#102D4F]">${r.code}</p>
        <p class="text-xs text-gray-700 font-medium">${escapeHtml(r.road || '')}</p>
        <p class="text-[11px] text-gray-500">${escapeHtml(r.barangay || '')} · ${escapeHtml(r.jurisdiction || 'City')}</p>
        <div class="flex items-center gap-1.5 pt-0.5 pb-1">
          <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${
            r.severity === 'High' ? 'bg-red-100 text-red-800' : r.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }">${r.severity}</span>
          <span class="text-[10px] text-gray-600 font-semibold">${r.status}</span>
        </div>
        <button type="button" data-open-report="${r.code}" class="w-full text-center py-1 px-2 bg-[#102D4F] text-white text-[10px] font-bold rounded hover:opacity-90 transition cursor-pointer">
          View Report Details →
        </button>
      </div>`,
      { offset: [0, -10] }
    );
  });

  requestAnimationFrame(() => {
    if (overviewMapInstance) {
      overviewMapInstance.invalidateSize({ pan: false });
    }
  });
}

// -------------------------------------------------------------
// Screen 2: Reports Management Pothole Map (Interactive OpenStreetMap)
// -------------------------------------------------------------
let reportsMapInstance = null;

export function renderReportsMapContainer({ mapViewType = 'real', filteredCount = 0, totalCount = 0 }) {
  return `
    <div class="space-y-2">
      <div class="relative w-full h-[380px] rounded-2xl overflow-hidden border border-luba-border bg-[#F8FAFC] shadow-xs">
        <div id="reports-leaflet-map" class="w-full h-full z-0"></div>

        <!-- Real GPS / Schematic Toggle Switcher -->
        <div class="absolute top-3 right-3 z-[400] flex items-center bg-white/95 backdrop-blur-sm border border-luba-border rounded-lg p-1 shadow-sm gap-1 text-xs">
          <button
            type="button"
            data-reports-map-toggle="real"
            class="px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
              mapViewType !== 'schematic'
                ? 'bg-luba-navy text-white shadow-xs'
                : 'text-luba-textSecondary hover:text-luba-textPrimary'
            }"
          >
            OpenStreetMap (GPS)
          </button>
          <button
            type="button"
            data-reports-map-toggle="schematic"
            class="px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
              mapViewType === 'schematic'
                ? 'bg-luba-navy text-white shadow-xs'
                : 'text-luba-textSecondary hover:text-luba-textPrimary'
            }"
          >
            Schematic View
          </button>
        </div>

        <!-- Live GPS Malolos Watermark / Status Badge -->
        <div class="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-luba-border shadow-xs text-[11px] text-luba-textSecondary flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-semibold text-luba-textPrimary">City of Malolos GPS</span>
          <span class="text-luba-textSubtle">· Showing ${filteredCount} of ${totalCount} potholes</span>
        </div>
      </div>
    </div>
  `;
}

export function initReportsMap(state) {
  const container = document.getElementById('reports-leaflet-map');
  if (!container || typeof L === 'undefined') return;

  if (state.reportsMapViewType === 'schematic') return;

  if (reportsMapInstance) {
    try {
      reportsMapInstance.remove();
    } catch {
      // ignore
    }
    reportsMapInstance = null;
  }

  const defaultCenter = [14.8527, 120.8160];
  reportsMapInstance = L.map(container, {
    center: defaultCenter,
    zoom: 14,
    zoomControl: true
  });

  // Standard OpenStreetMap raster tiles
  createOsmTileLayer().addTo(reportsMapInstance);

  const colorMap = {
    High: '#B93838',
    Medium: '#D95820',
    Low: '#225A91'
  };

  const filtered = filterMapReports(state.reports || [], state.reportFilters);
  const q = (state.reportFilters?.search || '').trim().toLowerCase();

  const markers = [];
  let selectedMarker = null;

  filtered.forEach((r) => {
    let coords = parseCoordinates(r.coordinates);
    if (!coords && r.latitude && r.longitude && !isNaN(Number(r.latitude)) && !isNaN(Number(r.longitude))) {
      coords = [Number(r.latitude), Number(r.longitude)];
    }
    if (!coords) {
      coords = [14.8527, 120.8160];
    }

    const isSelected = r.code === state.reportsSelectedPin;
    const color = colorMap[r.severity] || '#D95820';
    const shortCode = (r.code || '').replace('RW-2026-', '');

    const customIcon = createRoundPushpinIcon({
      color,
      label: `${shortCode} · ${r.severity}`,
      isSelected,
      size: 22
    });

    const marker = L.marker(coords, { icon: customIcon }).addTo(reportsMapInstance);
    markers.push(marker);

    marker.bindPopup(
      `<div class="p-1 space-y-1 min-w-[170px]">
        <img src="${getReportPhotoUrl(r)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='./assets/pothole-citizen.jpg';}else{this.onerror=null;this.src=window.FALLBACK_POTHOLE_SVG;}" alt="Citizen report photo" class="w-full h-20 object-cover rounded border border-gray-200 mt-0.5 mb-1" />
        <p class="font-bold text-xs text-[#102D4F]">${r.code}</p>
        <p class="text-xs text-gray-700 font-medium">${escapeHtml(r.road || '')}</p>
        <p class="text-[11px] text-gray-500">${escapeHtml(r.barangay || '')} · ${escapeHtml(r.jurisdiction || 'City')}</p>
        <div class="flex items-center gap-1.5 pt-0.5 pb-1">
          <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${
            r.severity === 'High' ? 'bg-red-100 text-red-800' : r.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }">${r.severity}</span>
          <span class="text-[10px] text-gray-600 font-semibold">${r.status}</span>
        </div>
        <button type="button" data-open-report="${r.code}" class="w-full text-center py-1 px-2 bg-[#102D4F] text-white text-[10px] font-bold rounded hover:opacity-90 transition cursor-pointer">
          View Report Details →
        </button>
      </div>`,
      { offset: [0, -10] }
    );

    marker.on('click', () => {
      store.setState({ reportsSelectedPin: r.code });
      const rowEl = document.querySelector(`tr[data-report-row="${r.code}"]`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowEl.classList.add('bg-blue-50/70');
        setTimeout(() => rowEl.classList.remove('bg-blue-50/70'), 2000);
      }
    });

    if (isSelected) {
      selectedMarker = marker;
      marker.openPopup();
    }
  });

  if (markers.length > 0 && q) {
    const group = L.featureGroup(markers);
    reportsMapInstance.fitBounds(group.getBounds().pad(0.18));
  } else if (selectedMarker) {
    reportsMapInstance.setView(selectedMarker.getLatLng(), 15, { animate: true });
  }

  requestAnimationFrame(() => {
    if (reportsMapInstance) {
      reportsMapInstance.invalidateSize({ pan: false });
    }
  });
}
