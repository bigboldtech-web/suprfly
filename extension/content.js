// ─── Suprfly Content Script ───
// Runs on linkedin.com and x.com pages

(function () {
  const platform = window.location.hostname.includes('linkedin') ? 'linkedin' : 'twitter';

  // Notify background that user is on a supported platform
  chrome.runtime.sendMessage({
    action: 'PLATFORM_DETECTED',
    platform,
    url: window.location.href,
  });

  // Extract profile info from the page (for LinkedIn)
  function extractLinkedInProfile() {
    const nameEl = document.querySelector('.feed-identity-module__actor-meta a');
    const imgEl = document.querySelector('.feed-identity-module__actor-meta img');

    return {
      name: nameEl?.textContent?.trim() || null,
      avatarUrl: imgEl?.src || null,
    };
  }

  // Extract profile info from the page (for X)
  function extractTwitterProfile() {
    const nameEl = document.querySelector('[data-testid="UserName"]');
    const imgEl = document.querySelector('[data-testid="UserAvatar"] img');

    return {
      name: nameEl?.textContent?.trim() || null,
      avatarUrl: imgEl?.src || null,
    };
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'EXTRACT_PROFILE') {
      const profile =
        platform === 'linkedin' ? extractLinkedInProfile() : extractTwitterProfile();
      sendResponse(profile);
    }
  });
})();
