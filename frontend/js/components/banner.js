// Banner component with info, warning, success, and danger semantic callout styling.

export function renderBanner({ variant = 'info', title, body, extraClass = '', extraAttrs = '' }) {
  const variantClasses = {
    info:    'luba-banner luba-banner-info bg-luba-infoBg border-luba-infoBorder text-luba-infoText',
    warning: 'luba-banner luba-banner-warning bg-luba-warningBg border-luba-warningBorder text-luba-warningText',
    success: 'luba-banner luba-banner-success bg-luba-successBg border-luba-successBorder text-luba-success',
    danger:  'luba-banner luba-banner-danger bg-luba-dangerBg border-luba-dangerBorder text-luba-danger'
  };
  const cls = variantClasses[variant] || variantClasses.info;
  return `
    <div ${extraAttrs} class="${cls} ${extraClass}">
      <p class="text-xs font-bold">${title}</p>
      <p class="text-xs mt-0.5 leading-relaxed">${body}</p>
    </div>
  `;
}
