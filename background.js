const SETTINGS_KEY = 'enabled';
const DEFAULT_ENABLED = true;

// #region runtime evidence
try {
  console.info('[FocusShieldAI] background service worker started');
} catch {}
// #endregion

async function getEnabledFromStorage() {
  const res = await chrome.storage.local.get([SETTINGS_KEY]);
  const value = res?.[SETTINGS_KEY];
  if (typeof value === 'boolean') return value;
  await chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_ENABLED });
  return DEFAULT_ENABLED;
}

async function setEnabledInStorage(enabled) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: !!enabled });
  return !!enabled;
}

chrome.runtime.onInstalled.addListener(async () => {
  const res = await chrome.storage.local.get([SETTINGS_KEY]);
  if (typeof res?.[SETTINGS_KEY] !== 'boolean') {
    await chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_ENABLED });
  }
});

// Popup <-> background messaging (keeps lifecycle concerns in one place).
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return;

  if (message.type === 'GET_ENABLED') {
    getEnabledFromStorage()
      .then((enabled) => {
        // #region runtime evidence
        try {
          console.info('[FocusShieldAI] GET_ENABLED ->', enabled);
        } catch {}
        // #endregion
        sendResponse({ enabled });
      })
      .catch((err) => sendResponse({ enabled: DEFAULT_ENABLED, error: String(err) }));
    return true; // keep the message channel open for async response
  }

  if (message.type === 'SET_ENABLED') {
    const enabled = !!message.enabled;
    setEnabledInStorage(enabled)
      .then(async (savedEnabled) => {
        // #region runtime evidence
        try {
          console.info('[FocusShieldAI] SET_ENABLED ->', savedEnabled);
        } catch {}
        // #endregion
        // Tell already-open tabs to apply changes immediately.
        chrome.tabs.query({}, async (tabs) => {
          const candidateTabs = tabs.filter((t) => typeof t.id === 'number');

          let successCount = 0;
          let failureCount = 0;
          let firstError = null;

          const promises = candidateTabs.map(async (t) => {
            try {
              await chrome.tabs.sendMessage(t.id, { type: 'UPDATE_ENABLED', enabled: savedEnabled });
              successCount += 1;
            } catch (err) {
              failureCount += 1;
              if (!firstError) firstError = String(err);
            }
          });

          await Promise.all(promises);
        });

        sendResponse({ ok: true, enabled: savedEnabled });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));

    return true; // async response
  }
});

