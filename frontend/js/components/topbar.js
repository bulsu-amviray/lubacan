// Topbar breadcrumb and footer operational status synchronization.

import { SCREENS_WITH_OPERATIONAL_DOT } from '../data/constants.js';

export function updateTopbarAndFooter(activeScreen) {
  const breadcrumbEl = document.getElementById('topbar-breadcrumb');
  if (breadcrumbEl && activeScreen?.breadcrumb) {
    breadcrumbEl.innerHTML = `
      <span>${activeScreen.breadcrumb[0]}</span>
      <span class="mx-2 text-luba-textSubtle">/</span>
      <span>${activeScreen.breadcrumb[1]}</span>
    `;
  }

  const footerOpBadgeEl = document.getElementById('footer-operational-badge');
  if (footerOpBadgeEl && activeScreen) {
    if (SCREENS_WITH_OPERATIONAL_DOT.has(activeScreen.id)) {
      footerOpBadgeEl.classList.remove('hidden');
    } else {
      footerOpBadgeEl.classList.add('hidden');
    }
  }
}
