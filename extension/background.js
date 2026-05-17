// ─── Suprfly Background Service Worker ───
// Core engine: cookie capture, session sync, auto-refresh

importScripts('utils.js');

// ─── Cookie Capture ───
async function captureCookies(platform) {
  const config = CONFIG.PLATFORMS[platform];

  const allCookies = await chrome.cookies.getAll({ domain: config.domain });

  // Also check without leading dot
  const altDomain = config.domain.startsWith('.')
    ? config.domain.slice(1)
    : '.' + config.domain;
  const altCookies = await chrome.cookies.getAll({ domain: altDomain });

  // Merge and deduplicate, keeping only essential cookies
  const cookieMap = {};
  [...allCookies, ...altCookies].forEach((cookie) => {
    if (config.essentialCookies.includes(cookie.name)) {
      cookieMap[cookie.name] = {
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
      };
    }
  });

  return cookieMap;
}

// ─── Session Validation ───
async function validateSession(platform, cookies) {
  const config = CONFIG.PLATFORMS[platform];
  const authCookie = cookies[config.authCookie];

  if (!authCookie || !authCookie.value) {
    return { valid: false, reason: 'AUTH_COOKIE_MISSING' };
  }

  // Check expiry
  if (authCookie.expirationDate && authCookie.expirationDate * 1000 < Date.now()) {
    return { valid: false, reason: 'AUTH_COOKIE_EXPIRED' };
  }

  return { valid: true };
}

// ─── Connect Account ───
async function connectAccount(platform, options = {}) {
  const { suprflyToken } = await chrome.storage.local.get('suprflyToken');
  if (!suprflyToken) {
    return { success: false, error: 'NOT_LOGGED_IN', message: 'Please log into Suprfly first' };
  }

  // Capture cookies
  const cookies = await captureCookies(platform);

  // Validate session
  const validation = await validateSession(platform, cookies);
  if (!validation.valid) {
    const config = CONFIG.PLATFORMS[platform];
    return {
      success: false,
      error: validation.reason,
      message: `Please log into ${platform === 'linkedin' ? 'LinkedIn' : 'X'} in your browser first, then try connecting again.`,
      loginUrl: config.loginUrl,
    };
  }

  // Send to backend
  try {
    const payload = {
      platform: platform === 'linkedin' ? 'LINKEDIN' : 'TWITTER',
      cookies: cookies,
      ...(options.accountKind && { accountKind: options.accountKind }),
      ...(options.organizationUrn && { organizationUrn: options.organizationUrn }),
      ...(options.organizationName && { organizationName: options.organizationName }),
      ...(options.organizationLogoUrl && { organizationLogoUrl: options.organizationLogoUrl }),
      ...(options.organizationVanity && { organizationVanity: options.organizationVanity }),
    };

    const response = await fetch(`${CONFIG.API_BASE}/api/v1/accounts/sync-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${suprflyToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      await updateConnectionState(platform, true, data.data);

      // Set up auto-refresh alarm
      chrome.alarms.create(`refresh_${platform}`, {
        periodInMinutes: CONFIG.COOKIE_REFRESH_INTERVAL,
      });

      return { success: true, data: data.data };
    } else {
      return { success: false, error: 'BACKEND_ERROR', message: data.message };
    }
  } catch (error) {
    console.error('[Suprfly] Connect failed:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Could not connect to Suprfly servers. Please try again.',
    };
  }
}

// ─── List Managed LinkedIn Organizations ───
async function listManagedOrgs(personalAccountId) {
  const { suprflyToken } = await chrome.storage.local.get('suprflyToken');
  if (!suprflyToken) return { success: false, error: 'NOT_LOGGED_IN' };

  try {
    const response = await fetch(
      `${CONFIG.API_BASE}/api/v1/accounts/${personalAccountId}/organizations`,
      { headers: { Authorization: `Bearer ${suprflyToken}` } },
    );
    const data = await response.json();
    return { success: data.success, organizations: data.data || [] };
  } catch (e) {
    return { success: false, error: 'NETWORK_ERROR' };
  }
}

// ─── Disconnect Account ───
async function disconnectAccount(platform) {
  const { suprflyToken } = await chrome.storage.local.get('suprflyToken');
  const { connections } = await chrome.storage.local.get('connections');

  const accountId = connections?.[platform]?.accountId;
  if (!accountId) return { success: false, error: 'NOT_CONNECTED' };

  try {
    await fetch(`${CONFIG.API_BASE}/api/v1/accounts/${accountId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${suprflyToken}` },
    });
  } catch (e) {
    // OK if backend fails, still clean up locally
  }

  await updateConnectionState(platform, false, null);
  chrome.alarms.clear(`refresh_${platform}`);

  return { success: true };
}

// ─── Connection State Management ───
async function updateConnectionState(platform, isConnected, accountData = null, error = null) {
  const { connections = {} } = await chrome.storage.local.get('connections');

  connections[platform] = {
    isConnected,
    accountId: accountData?.id || connections[platform]?.accountId || null,
    username: accountData?.platformUsername || connections[platform]?.username || null,
    avatarUrl: accountData?.avatarUrl || connections[platform]?.avatarUrl || null,
    lastRefreshed: isConnected ? new Date().toISOString() : null,
    error: error,
  };

  await chrome.storage.local.set({ connections });

  // Update badge
  const connectedCount = Object.values(connections).filter((c) => c.isConnected).length;

  if (error) {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
  } else if (connectedCount > 0) {
    chrome.action.setBadgeText({ text: `${connectedCount}` });
    chrome.action.setBadgeBackgroundColor({ color: '#22C55E' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

async function getConnectionStatus() {
  const { connections = {} } = await chrome.storage.local.get('connections');
  const { suprflyToken, suprflyUser } = await chrome.storage.local.get([
    'suprflyToken',
    'suprflyUser',
  ]);

  return {
    isLoggedIn: !!suprflyToken,
    user: suprflyUser || null,
    connections,
  };
}

// ─── Auto-Refresh Handler ───
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('refresh_')) {
    const platform = alarm.name.replace('refresh_', '');
    console.log(`[Suprfly] Auto-refreshing ${platform} cookies...`);

    const cookies = await captureCookies(platform);
    const validation = await validateSession(platform, cookies);

    if (validation.valid) {
      const { suprflyToken } = await chrome.storage.local.get('suprflyToken');
      if (suprflyToken) {
        try {
          await fetch(`${CONFIG.API_BASE}/api/v1/accounts/sync-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${suprflyToken}`,
            },
            body: JSON.stringify({
              platform: platform === 'linkedin' ? 'LINKEDIN' : 'TWITTER',
              cookies: cookies,
            }),
          });
          await updateConnectionState(platform, true);
          console.log(`[Suprfly] ${platform} cookies refreshed successfully`);
        } catch (e) {
          console.error(`[Suprfly] Cookie refresh failed for ${platform}:`, e);
        }
      }
    } else {
      // Session expired
      await updateConnectionState(platform, false, null, 'SESSION_EXPIRED');
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
    }
  }
});

// ─── Message Listener (popup communication) ───
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handlers = {
    LOGIN: async () => {
      try {
        const response = await fetch(`${CONFIG.API_BASE}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: message.email, password: message.password }),
        });
        const data = await response.json();
        if (data.success) {
          await chrome.storage.local.set({
            suprflyToken: data.data.accessToken,
            suprflyRefreshToken: data.data.refreshToken,
            suprflyUser: data.data.user,
          });
        }
        return data;
      } catch (e) {
        return { success: false, message: 'Network error. Check your connection.' };
      }
    },

    LOGOUT: async () => {
      const { suprflyRefreshToken } = await chrome.storage.local.get('suprflyRefreshToken');
      try {
        await fetch(`${CONFIG.API_BASE}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: suprflyRefreshToken }),
        });
      } catch (e) {
        /* ignore */
      }

      // Clear all alarms
      chrome.alarms.clearAll();
      await chrome.storage.local.clear();
      chrome.action.setBadgeText({ text: '' });
      return { success: true };
    },

    CONNECT_ACCOUNT: () => connectAccount(message.platform, message.options || {}),
    CONNECT_COMPANY: () => connectAccount('linkedin', {
      accountKind: 'COMPANY',
      organizationUrn: message.organizationUrn,
      organizationName: message.organizationName,
      organizationLogoUrl: message.organizationLogoUrl,
      organizationVanity: message.organizationVanity,
    }),
    LIST_MANAGED_ORGS: () => listManagedOrgs(message.personalAccountId),
    DISCONNECT_ACCOUNT: () => disconnectAccount(message.platform),
    GET_STATUS: () => getConnectionStatus(),

    REFRESH_TOKEN: async () => {
      const { suprflyRefreshToken } = await chrome.storage.local.get('suprflyRefreshToken');
      if (!suprflyRefreshToken) return { success: false };
      try {
        const response = await fetch(`${CONFIG.API_BASE}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: suprflyRefreshToken }),
        });
        const data = await response.json();
        if (data.success) {
          await chrome.storage.local.set({
            suprflyToken: data.data.accessToken,
            suprflyRefreshToken: data.data.refreshToken,
          });
        }
        return data;
      } catch (e) {
        return { success: false };
      }
    },

    PLATFORM_DETECTED: async () => {
      // Content script notified us user is on a platform page
      console.log(`[Suprfly] Platform detected: ${message.platform} at ${message.url}`);
      return { received: true };
    },
  };

  if (handlers[message.action]) {
    handlers[message.action]().then(sendResponse);
    return true; // Keep channel open for async response
  }
});

// ─── Install/Update Handler ───
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://app.suprfly.io/welcome?source=extension' });
  }
});
