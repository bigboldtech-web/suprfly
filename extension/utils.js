// ─── Suprfly Extension Utilities ───

const CONFIG = {
  // Switch between dev and prod
  API_BASE: 'https://api.suprfly.io', // Change to http://localhost:5000 for dev

  PLATFORMS: {
    linkedin: {
      domain: '.linkedin.com',
      url: 'https://www.linkedin.com',
      authCookie: 'li_at',
      essentialCookies: ['li_at', 'JSESSIONID', 'li_mc', 'bcookie', 'bscookie', 'lang', 'lidc'],
      csrfCookie: 'JSESSIONID',
      loginUrl: 'https://www.linkedin.com/login',
      testEndpoint: 'https://www.linkedin.com/voyager/api/me',
    },
    twitter: {
      domain: '.x.com',
      url: 'https://x.com',
      authCookie: 'auth_token',
      essentialCookies: ['auth_token', 'ct0', 'twid', 'guest_id', 'guest_id_marketing', 'guest_id_ads', 'personalization_id'],
      csrfCookie: 'ct0',
      loginUrl: 'https://x.com/i/flow/login',
      testEndpoint: 'https://x.com/i/api/1.1/account/settings.json',
    },
  },

  COOKIE_REFRESH_INTERVAL: 30, // minutes
  SESSION_CHECK_INTERVAL: 60,  // minutes
};

// Helper to make API calls to the Suprfly backend
async function apiCall(endpoint, options = {}) {
  const { suprflyToken } = await chrome.storage.local.get('suprflyToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(suprflyToken && { Authorization: `Bearer ${suprflyToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error('[Suprfly] API call failed:', error);
    return { success: false, message: 'Network error. Check your connection.' };
  }
}

// Format relative time
function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
