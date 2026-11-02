// Sidebar navigation component and active state synchronization.

export function updateSidebarNav(activeNavSection, state = null) {
  document.querySelectorAll('[data-nav-section]').forEach((btn) => {
    const section = btn.getAttribute('data-nav-section');
    const icon = btn.querySelector('[data-nav-icon]');
    if (section === activeNavSection) {
      btn.className = 'luba-nav-btn luba-nav-btn-active';
      if (icon) icon.setAttribute('class', 'w-4 h-4 text-luba-cta shrink-0');
    } else {
      btn.className = 'luba-nav-btn';
      if (icon) icon.setAttribute('class', 'w-4 h-4 text-luba-sidebarIcon shrink-0');
    }
  });

  // Dynamic live count for pending reports (Submitted + Under Review)
  if (state && Array.isArray(state.reports)) {
    const badgeEl = document.getElementById('sidebar-reports-badge');
    if (badgeEl) {
      const pendingCount = state.reports.filter(
        (r) => r.status === 'Submitted' || r.status === 'Under Review'
      ).length;
      badgeEl.textContent = pendingCount;
    }
  }
}
