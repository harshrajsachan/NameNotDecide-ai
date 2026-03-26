const enabledToggle = document.getElementById('enabledToggle');
const statusText = document.getElementById('statusText');

function setStatus(enabled) {
  statusText.textContent = enabled ? 'Enabled' : 'Disabled';
}

function runtimeSendMessage(message) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        const err = chrome.runtime.lastError;
        if (err) resolve({ error: String(err), response: null });
        else resolve({ response });
      });
    } catch (e) {
      resolve({ error: String(e), response: null });
    }
  });
}

async function loadEnabled() {
  setStatus(false);

  const { response } = await runtimeSendMessage({ type: 'GET_ENABLED' });
  const enabled = !!response?.enabled;
  enabledToggle.checked = enabled;
  setStatus(enabled);
}

enabledToggle.addEventListener('change', async () => {
  const nextEnabled = enabledToggle.checked;
  setStatus(nextEnabled);

  const { response } = await runtimeSendMessage({ type: 'SET_ENABLED', enabled: nextEnabled });
  if (!response?.ok) {
    // Roll back if the background failed to persist the setting.
    enabledToggle.checked = !nextEnabled;
    setStatus(!nextEnabled);
  }
});

loadEnabled();

