// Production schematic QC map component (SVG roads, landmarks, and interactive severity pins) for City of Malolos, Bulacan.

export function renderSchematicMap({
  caption = 'LUBA canFindIT · Illustrative map / City of Malolos',
  showPinLabels = false,
  mode = 'standard', // 'standard' | 'comparison' | 'tall'
  selectedPin = 'RW-2026-0842'
} = {}) {
  const heightClass = mode === 'tall' ? 'h-[470px]' : 'h-[288px]';

  const pinsHtml =
    mode === 'comparison'
      ? `
        <button type="button" data-pin-select="RW-2026-0819" class="absolute top-[33%] left-[51%] flex items-center gap-1.5 group">
          <span class="w-4 h-4 rounded-full bg-luba-danger ring-[3px] ring-white shadow"></span>
          <span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-danger shadow-sm border border-luba-border">0819 · High</span>
        </button>
        <button type="button" data-pin-select="RW-2026-0842" class="absolute top-[52%] left-[37%] flex items-center gap-1.5 group">
          <span class="w-4 h-4 rounded-full bg-luba-danger ring-[3px] ring-white shadow"></span>
          <span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-danger shadow-sm border border-luba-border">0842 · High</span>
        </button>
        <button type="button" data-pin-select="RW-2026-0840" class="absolute bottom-[18%] left-[23%] flex items-center gap-1.5 group">
          <span class="w-4 h-4 rounded-full bg-luba-info ring-[3px] ring-white shadow"></span>
          <span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-info shadow-sm border border-luba-border">0840 · High</span>
        </button>
      `
      : `
        <button type="button" data-pin-select="RW-2026-0841" class="absolute top-[30%] left-[51%] flex items-center gap-1.5 transition-transform ${selectedPin === 'RW-2026-0841' ? 'scale-110 z-20' : 'z-10'}">
          <span class="w-4 h-4 rounded-full bg-luba-cta ring-[3px] ${selectedPin === 'RW-2026-0841' ? 'ring-[#102D4F]' : 'ring-white'} shadow"></span>
          ${showPinLabels ? '<span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-cta shadow-sm">Medium</span>' : ''}
        </button>
        <button type="button" data-pin-select="RW-2026-0842" class="absolute top-[51%] left-[37%] flex items-center gap-1.5 transition-transform ${selectedPin === 'RW-2026-0842' ? 'scale-110 z-20' : 'z-10'}">
          <span class="w-4 h-4 rounded-full bg-luba-danger ring-[3px] ${selectedPin === 'RW-2026-0842' ? 'ring-[#102D4F]' : 'ring-white'} shadow"></span>
          ${showPinLabels ? '<span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-danger shadow-sm">High</span>' : ''}
        </button>
        <button type="button" data-pin-select="RW-2026-0840" class="absolute bottom-[20%] left-[23%] flex items-center gap-1.5 transition-transform ${selectedPin === 'RW-2026-0840' ? 'scale-110 z-20' : 'z-10'}">
          <span class="w-4 h-4 rounded-full bg-luba-info ring-[3px] ${selectedPin === 'RW-2026-0840' ? 'ring-[#102D4F]' : 'ring-white'} shadow"></span>
          ${showPinLabels ? '<span class="px-2 py-0.5 bg-white rounded text-[11px] font-bold text-luba-info shadow-sm">High</span>' : ''}
        </button>
        ${
          !showPinLabels
            ? `<span class="absolute bottom-[20%] left-[35%] w-4 h-4 rounded-full bg-luba-mapCluster ring-2 ring-white flex items-center justify-center"><span class="w-1.5 h-1.5 rounded-full bg-luba-info"></span></span>`
            : ''
        }
      `;

  return `
    <div class="relative w-full ${heightClass} bg-luba-mapBg rounded-card border border-luba-border overflow-hidden select-none">
      <!-- Green parks / river basins (Malolos Capitol Grounds & Poblacion Plaza) -->
      <div class="absolute top-6 left-8 w-44 h-28 bg-luba-mapPark1 rounded-[18px]"></div>
      <div class="absolute bottom-6 right-12 w-56 h-36 bg-luba-mapPark2 rounded-[18px]"></div>

      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="none">
        <!-- Paseo del Congreso branching towards Poblacion / Barasoain -->
        <path d="M 0 160 Q 260 150 480 185" class="luba-map-road-stroke" stroke-width="14" fill="none"/>
        <path d="M 0 160 Q 260 150 480 185" class="luba-map-corridor-stroke" stroke-width="2" fill="none"/>

        <!-- Blas Ople Diversion Road & Capitol Connector Loop -->
        <path d="M 220 50 L 590 50 L 610 250 L 260 230 Z" class="luba-map-road-stroke" stroke-width="7" fill="none"/>

        <!-- Primary Corridor: MacArthur Highway (Manila North Road) through Guinhawa, Bulihan & Tikay -->
        <path d="M 180 320 L 470 0" class="luba-map-road-stroke" stroke-width="22" fill="none"/>
        <path d="M 175 320 L 465 0" class="luba-map-corridor-stroke" stroke-width="3" fill="none"/>
        <path d="M 187 320 L 477 0" class="luba-map-corridor-stroke" stroke-width="3" fill="none"/>
      </svg>

      <!-- Road & Zone Labels for Malolos City -->
      <span class="absolute top-11 left-64 text-xs font-bold text-luba-textPrimary">MacArthur Hwy (DPWH)</span>
      <span class="absolute top-6 right-48 text-[11px] font-semibold uppercase tracking-wider text-luba-textSubtle">BULIHAN</span>
      <span class="absolute top-24 left-10 text-xs font-semibold text-luba-textMuted">Paseo del Congreso</span>
      <span class="absolute top-16 left-6 text-[10px] uppercase font-bold tracking-wider text-luba-info">POBLACION · SAN VICENTE</span>
      <span class="absolute bottom-16 left-[41%] text-xs font-semibold text-luba-textMuted">Guinhawa Crossing</span>
      <span class="absolute bottom-9 right-36 text-xs text-luba-textSubtle">Tikay / NLEX Access</span>

      ${pinsHtml}

      <button type="button" title="Recenter map to Malolos City Hall" class="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-lg bg-white border border-luba-border flex items-center justify-center text-luba-textPrimary shadow-sm hover:bg-luba-canvas">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
        </svg>
      </button>
      <span class="absolute bottom-2.5 left-3.5 text-[10px] text-luba-textSubtle">${caption}</span>
    </div>
  `;
}
