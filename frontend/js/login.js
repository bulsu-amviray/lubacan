/**
 * LUBA CanFindIT · Administrator sign in
 * Reusable components: renderField, renderSelectField, renderPasswordField,
 * renderButton, renderAuthBanner. States: default | focus | error | warning | loading
 * (select via ?state=<name>, or the review switcher in the bottom-right corner).
 * No hard-coded colors — all styling lives in /css/luba-reference.css tokens.
 */

const ICONS = {
  chevron: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  eye: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/></svg>',
  lock: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
  alert: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  warning: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  sso: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 21h18M5 21V10M19 21V10M9 21v-6h6v6M2 10l10-6 10 6"/></svg>'
};

const STATES = ['default', 'focus', 'error', 'warning', 'loading'];
export const VALID_ACCOUNTS = [
  {
    email: 'admin@malolos.gov.ph',
    password: 'admin123',
    fullName: 'System Administrator',
    role: 'LGU administrator · City of Malolos',
    department: 'City Engineering Office'
  },
  {
    email: 'ana.delacruz@malolos.gov.ph',
    password: 'admin123',
    altPassword: 'correcthorse24',
    fullName: 'Ana Dela Cruz',
    role: 'LGU administrator · City of Malolos',
    department: 'City Engineering Office'
  }
];

const FILLED = { email: 'admin@malolos.gov.ph', password: 'admin123' };

const state = {
  view: 'default',
  email: '',
  password: '',
  remember: false,
  showPassword: false
};

/* ---------- Reusable components ---------- */
function renderAuthBanner(variant, message) {
  const icon = variant === 'warning' ? ICONS.warning : ICONS.alert;
  return `<div class="luba-auth-banner luba-auth-banner-${variant}" role="alert">${icon}<span>${message}</span></div>`;
}

function renderField({ id, label, type = 'text', value = '', placeholder = '', autocomplete = '', focused = false, error = false, disabled = false }) {
  const cls = ['luba-input', focused && 'is-focused', error && 'is-error'].filter(Boolean).join(' ');
  return `
    <div class="luba-field">
      <label class="luba-field-label" for="${id}">${label}</label>
      <div class="luba-input-wrap">
        <input id="${id}" name="${id}" type="${type}" class="${cls}" value="${value}" placeholder="${placeholder}"
          autocomplete="${autocomplete}" ${error ? 'aria-invalid="true"' : ''} ${disabled ? 'disabled' : ''} />
      </div>
    </div>`;
}

function renderSelectField({ id, label, options, value, disabled = false }) {
  return `
    <div class="luba-field">
      <label class="luba-field-label" for="${id}">${label}</label>
      <div class="luba-input-wrap">
        <select id="${id}" name="${id}" class="luba-input luba-select" ${disabled ? 'disabled' : ''}>
          ${options.map((o) => `<option ${o === value ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
        <span class="luba-input-icon is-static">${ICONS.chevron}</span>
      </div>
    </div>`;
}

function renderPasswordField({ value, focused, error, disabled, visible }) {
  const cls = ['luba-input', 'luba-input-has-icon', focused && 'is-focused', error && 'is-error'].filter(Boolean).join(' ');
  return `
    <div class="luba-field">
      <label class="luba-field-label" for="password">Password</label>
      <div class="luba-input-wrap">
        <input id="password" name="password" type="${visible ? 'text' : 'password'}" class="${cls}" value="${value}"
          placeholder="Enter your password" autocomplete="current-password" ${error ? 'aria-invalid="true"' : ''} ${disabled ? 'disabled' : ''} />
        <button type="button" class="luba-input-icon" data-toggle-password aria-label="${visible ? 'Hide' : 'Show'} password" ${disabled ? 'disabled' : ''}>
          ${visible ? ICONS.eyeOff : ICONS.eye}
        </button>
      </div>
    </div>`;
}

function renderButton({ label, variant = 'cta', type = 'button', loading = false, disabled = false, icon = '', attrs = '' }) {
  const cls = `luba-btn luba-btn-${variant}${loading ? ' is-loading' : ''}`;
  const content = loading ? `<span class="luba-spinner" aria-hidden="true"></span><span>Signing in…</span>` : `${icon}<span>${label}</span>`;
  return `<button type="${type}" class="${cls}" ${disabled || loading ? 'disabled' : ''} ${loading ? 'aria-busy="true"' : ''} ${attrs}>${content}</button>`;
}

/* ---------- Card ---------- */
function renderCard() {
  const v = state.view;
  const isError = v === 'error';
  const isLoading = v === 'loading';

  let banner = '';
  if (isError) banner = renderAuthBanner('error', 'Incorrect email or password. Try again.');
  if (v === 'warning') banner = renderAuthBanner('warning', 'Your account is suspended. Contact your LGU administrator.');

  return `
    <header>
      <p class="luba-login-eyebrow">LGU WORKSPACE</p>
      <h2 class="luba-login-title">Administrator sign in</h2>
      <p class="luba-login-subtitle">Use your LGU-issued account to manage road reports.</p>
    </header>

    ${banner}

    ${renderField({ id: 'email', label: 'Work email', type: 'email', value: state.email, placeholder: 'admin@malolos.gov.ph', autocomplete: 'username', error: isError, disabled: isLoading })}
    ${renderPasswordField({ value: state.password, focused: v === 'focus', error: isError, disabled: isLoading, visible: state.showPassword })}

    <div class="luba-login-row">
      <label class="luba-checkbox">
        <input type="checkbox" id="remember" ${state.remember ? 'checked' : ''} ${isLoading ? 'disabled' : ''} />
        Remember this device
      </label>
      <a href="#" class="luba-link">Forgot password?</a>
    </div>

    ${renderButton({ label: 'Sign in', type: 'submit', loading: isLoading })}
    <div class="luba-divider">or</div>
    ${renderButton({ label: 'Sign in with LGU single sign-on', variant: 'outline', icon: ICONS.sso, disabled: isLoading })}

    <p class="luba-login-footnote">${ICONS.lock}<span>Authorized personnel only. Activity is logged.</span></p>
  `;
}

function setView(view) {
  state.view = STATES.includes(view) ? view : 'default';
  const filled = state.view !== 'default';
  state.email = filled ? FILLED.email : '';
  state.password = filled ? FILLED.password : '';
  render();
  if (state.view === 'focus') document.getElementById('password')?.focus();
}

function render() {
  document.getElementById('login-card').innerHTML = renderCard();
}

/* ---------- Events ---------- */
document.addEventListener('click', (e) => {
  const stateBtn = e.target.closest('[data-state]');
  if (stateBtn) {
    const view = stateBtn.dataset.state;
    history.replaceState(null, '', `?state=${view}`);
    setView(view);
    return;
  }
  if (e.target.closest('[data-toggle-password]')) {
    state.password = document.getElementById('password').value;
    state.email = document.getElementById('email').value;
    state.showPassword = !state.showPassword;
    render();
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'email') state.email = e.target.value;
  if (e.target.id === 'password') state.password = e.target.value;
  if (e.target.id === 'remember') state.remember = e.target.checked;
});

// Administrator authentication handler: validates credentials against active administrator accounts.
document.getElementById('login-card').addEventListener('submit', (e) => {
  e.preventDefault();
  const emailInput = (state.email || '').trim().toLowerCase();
  const passwordInput = (state.password || '').trim();

  if (!emailInput || !passwordInput) {
    state.view = 'error';
    render();
    return;
  }

  const matched = VALID_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === emailInput &&
      (acc.password === passwordInput || acc.altPassword === passwordInput)
  );

  if (!matched) {
    state.view = 'error';
    render();
    return;
  }

  state.view = 'loading';
  render();

  sessionStorage.setItem('luba_authenticated', 'true');
  sessionStorage.setItem(
    'luba_user',
    JSON.stringify({
      email: matched.email,
      fullName: matched.fullName,
      role: matched.role,
      department: matched.department
    })
  );

  const targetUrl = location.pathname.includes('/frontend/') || location.pathname.endsWith('login.html')
    ? './index.html?screen=1'
    : '/dashboard?screen=1';
  setTimeout(() => { location.href = targetUrl; }, 1000);
});

setView(new URLSearchParams(location.search).get('state') || 'default');
