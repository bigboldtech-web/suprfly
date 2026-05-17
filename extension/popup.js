// ─── Suprfly Extension Popup Logic ───

document.addEventListener('DOMContentLoaded', async () => {
  const status = await sendMessage({ action: 'GET_STATUS' });

  if (!status || !status.isLoggedIn) {
    showLoginForm();
  } else {
    showDashboard(status);
  }
});

// ─── Message Helper ───
function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response || {});
    });
  });
}

// ─── Show Login Form ───
function showLoginForm() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('dashboard-view').classList.add('hidden');

  const loginBtn = document.getElementById('login-btn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  loginBtn.addEventListener('click', () => handleLogin());

  // Enter key submits
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') passwordInput.focus();
  });

  // External links
  document.getElementById('signup-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://app.suprfly.io/register' });
  });
  document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://app.suprfly.io/forgot-password' });
  });
}

// ─── Handle Login ───
async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  errorEl.classList.add('hidden');

  if (!email || !password) {
    errorEl.textContent = 'Please enter email and password.';
    errorEl.classList.remove('hidden');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.innerHTML = '<div class="spinner"></div> Logging in...';

  const result = await sendMessage({ action: 'LOGIN', email, password });

  if (result.success) {
    const status = await sendMessage({ action: 'GET_STATUS' });
    showDashboard(status);
  } else {
    errorEl.textContent = result.message || 'Login failed. Check your credentials.';
    errorEl.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
}

// ─── Show Dashboard ───
function showDashboard(status) {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('hidden');

  const user = status.user || {};
  const connections = status.connections || {};

  // User info
  const initials = (user.name || user.email || '?').substring(0, 2).toUpperCase();
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name').textContent = user.name || 'User';
  document.getElementById('user-email').textContent = user.email || '';
  document.getElementById('plan-badge').textContent = user.plan || 'FREE';

  // Connection count
  const connectedCount = Object.values(connections).filter((c) => c.isConnected).length;
  const countEl = document.getElementById('connection-count');
  const dotEl = document.getElementById('status-dot');

  countEl.textContent = `Connected ${connectedCount}/2`;
  dotEl.className = 'status-dot ' + (connectedCount === 2 ? 'green' : connectedCount === 1 ? 'amber' : 'red');

  // Render platform cards
  renderPlatformCard('linkedin', connections.linkedin);
  renderPlatformCard('twitter', connections.twitter);

  // Show/hide instructions
  const instructionsEl = document.getElementById('instructions');
  if (connectedCount === 0) {
    instructionsEl.classList.remove('hidden');
  } else {
    instructionsEl.classList.add('hidden');
  }

  // Dashboard button
  document.getElementById('dashboard-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://app.suprfly.io/dashboard' });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    await sendMessage({ action: 'LOGOUT' });
    showLoginForm();
  });
}

// ─── Render Platform Card ───
function renderPlatformCard(platform, connection) {
  const badge = document.getElementById(`${platform}-badge`);
  const details = document.getElementById(`${platform}-details`);
  const usernameEl = document.getElementById(`${platform}-username`);
  const refreshedEl = document.getElementById(`${platform}-refreshed`);
  const btn = document.getElementById(`${platform}-btn`);

  // Remove old listeners by cloning
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  if (connection && connection.isConnected) {
    badge.textContent = 'Active';
    badge.className = 'platform-badge active';

    details.classList.remove('hidden');
    usernameEl.textContent = connection.username || 'Connected';
    refreshedEl.textContent = timeAgo(connection.lastRefreshed);

    newBtn.textContent = 'Disconnect';
    newBtn.className = 'btn btn-disconnect';
    newBtn.addEventListener('click', () => handleDisconnect(platform));
  } else if (connection && connection.error) {
    badge.textContent = 'Expired';
    badge.className = 'platform-badge inactive';

    details.classList.remove('hidden');
    usernameEl.textContent = connection.username || '';
    refreshedEl.textContent = 'Session expired';

    newBtn.textContent = `Reconnect ${platform === 'linkedin' ? 'LinkedIn' : 'X'}`;
    newBtn.className = 'btn btn-connect';
    newBtn.addEventListener('click', () => handleConnect(platform));
  } else {
    badge.textContent = 'Not Connected';
    badge.className = 'platform-badge disconnected';

    details.classList.add('hidden');

    newBtn.textContent = `Connect ${platform === 'linkedin' ? 'LinkedIn' : 'X'}`;
    newBtn.className = 'btn btn-connect';
    newBtn.addEventListener('click', () => handleConnect(platform));
  }

  // LinkedIn-only: surface the company-page picker when personal is connected
  if (platform === 'linkedin') renderLinkedInCompanySection(connection);
}

// ─── LinkedIn Company-Page Picker ───
function renderLinkedInCompanySection(connection) {
  const section = document.getElementById('linkedin-company-section');
  const list = document.getElementById('linkedin-company-list');
  const toggle = document.getElementById('linkedin-company-toggle');

  if (!connection || !connection.isConnected || !connection.accountId) {
    section.classList.add('hidden');
    list.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  // Replace listener via clone (re-render-safe)
  const freshToggle = toggle.cloneNode(true);
  toggle.parentNode.replaceChild(freshToggle, toggle);

  freshToggle.addEventListener('click', async () => {
    if (!list.classList.contains('hidden')) {
      list.classList.add('hidden');
      return;
    }
    list.classList.remove('hidden');
    list.innerHTML = '<div style="font-size:11px;color:var(--text-dim);padding:4px 0;">Loading…</div>';

    const result = await sendMessage({
      action: 'LIST_MANAGED_ORGS',
      personalAccountId: connection.accountId,
    });

    if (!result.success || !result.organizations || result.organizations.length === 0) {
      list.innerHTML = '<div style="font-size:11px;color:var(--text-dim);padding:4px 0;">No company pages found on this account.</div>';
      return;
    }

    list.innerHTML = '';
    for (const org of result.organizations) {
      const row = document.createElement('div');
      row.className = 'company-row';
      const name = document.createElement('span');
      name.className = 'company-row-name';
      name.textContent = org.name || 'Company page';
      const btn = document.createElement('button');
      btn.className = 'company-row-connect';
      btn.textContent = 'Connect';
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Connecting…';
        const resp = await sendMessage({
          action: 'CONNECT_COMPANY',
          organizationUrn: org.orgUrn,
          organizationName: org.name,
          organizationLogoUrl: org.logoUrl,
          organizationVanity: org.vanityName,
        });
        if (resp && resp.success) {
          btn.textContent = 'Connected ✓';
          btn.classList.add('connected');
          showToast(`Connected company page: ${org.name}`, 'success');
        } else {
          btn.disabled = false;
          btn.textContent = 'Connect';
          showToast(resp?.message || 'Failed to connect company page', 'error');
        }
      });
      row.appendChild(name);
      row.appendChild(btn);
      list.appendChild(row);
    }
  });
}

// ─── Handle Connect ───
async function handleConnect(platform) {
  const btn = document.getElementById(`${platform}-btn`);
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Connecting...';

  const result = await sendMessage({ action: 'CONNECT_ACCOUNT', platform });

  if (result.success) {
    showToast(`${platform === 'linkedin' ? 'LinkedIn' : 'X'} connected!`, 'success');
    const status = await sendMessage({ action: 'GET_STATUS' });
    showDashboard(status);
  } else {
    if (result.loginUrl) {
      showToast(result.message, 'warning');
      chrome.tabs.create({ url: result.loginUrl });
    } else {
      showToast(result.message || 'Connection failed', 'error');
    }
    btn.disabled = false;
    btn.textContent = `Connect ${platform === 'linkedin' ? 'LinkedIn' : 'X'}`;
  }
}

// ─── Handle Disconnect ───
async function handleDisconnect(platform) {
  const btn = document.getElementById(`${platform}-btn`);
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Disconnecting...';

  await sendMessage({ action: 'DISCONNECT_ACCOUNT', platform });
  showToast(`${platform === 'linkedin' ? 'LinkedIn' : 'X'} disconnected`, 'success');

  const status = await sendMessage({ action: 'GET_STATUS' });
  showDashboard(status);
}

// ─── Toast ───
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
}
