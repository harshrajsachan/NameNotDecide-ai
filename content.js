const SETTINGS_KEY = 'enabled';
const BLUR_CLASS = 'fsai-distracted';
const STYLE_ID = 'fsai-style';

// Candidate elements to scan.
// MVP: keep the set narrow to limit DOM + text extraction cost.
const CANDIDATE_SELECTOR =
  'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, code';

const MAX_CANDIDATES_PER_SCAN = 60;
const MIN_TEXT_CHARS = 25;

let enabled = false;
let observer = null;
let processed = new WeakSet();

let scanTimer = null;
let lastScanRoot = null;

// #region runtime evidence
try {
  console.info('[FocusShieldAI] content.js loaded');
  console.info('[FocusShieldAI] classifier present:', !!globalThis.FSAIClassifier);
} catch {
  // Ignore console failures (very rare)
}
// #endregion

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${BLUR_CLASS} {
      filter: blur(8px) saturate(0.75);
      opacity: 0.55;
      pointer-events: none;
      user-select: none;
      position: relative;
      outline: 1px solid rgba(255, 80, 80, 0.25);
      border-radius: 8px;
    }
    .${BLUR_CLASS}::after {
      content: 'FocusShield AI';
      position: absolute;
      top: 6px;
      left: 6px;
      padding: 3px 6px;
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.95);
      background: rgba(0,0,0,0.60);
      border-radius: 999px;
      z-index: 2147483647;
      pointer-events: none;
    }
  `;
  const parent = document.head || document.documentElement;
  parent.appendChild(style);
}

function clearDistracted() {
  document.querySelectorAll(`.${BLUR_CLASS}`).forEach((el) => {
    el.classList.remove(BLUR_CLASS);
  });
}

function shouldSkipElement(el) {
  if (!(el instanceof Element)) return true;

  // Skip interactive or text-editing areas.
  if (el.closest('input, textarea, select, option, button, [contenteditable="true"]')) return true;

  // Skip script/style-ish content.
  if (el.closest('script, style, noscript')) return true;

  // Already blurred during this enable-session.
  if (el.classList.contains(BLUR_CLASS)) return true;

  // Avoid removing formatting blocks that are likely navigational chrome.
  if (el.closest('nav, header, footer')) return true;

  return false;
}

function scanRoot(root) {
  if (!enabled || !root) return;

  const candidates = [];

  try {
    // Include root itself if it matches.
    if (root instanceof Element && root.matches(CANDIDATE_SELECTOR)) candidates.push(root);

    if (root.querySelectorAll) {
      candidates.push(...root.querySelectorAll(CANDIDATE_SELECTOR));
    }
  } catch {
    // Some roots may not support querySelectorAll in certain edge cases.
  }

  const slice = candidates.slice(0, MAX_CANDIDATES_PER_SCAN);
  for (const el of slice) {
    if (processed.has(el) || shouldSkipElement(el)) continue;
    processed.add(el);

    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text.length < MIN_TEXT_CHARS) continue;

    const classifier = globalThis.FSAIClassifier;
    if (!classifier?.classifyElement) continue;

    const result = classifier.classifyElement(el, { maxChars: 220 });
    if (result.label === 'DISTRACTION') {
      el.classList.add(BLUR_CLASS);
    }
  }
}

function scheduleScan(root) {
  // Throttle scanning to stay fast while still reacting to changes.
  lastScanRoot = root;
  if (scanTimer) return;

  scanTimer = setTimeout(() => {
    scanTimer = null;
    scanRoot(lastScanRoot || document.body || document.documentElement);
  }, 350);
}

function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    if (!enabled) return;

    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof Element) scheduleScan(node);
      }
    }
  });

  const target = document.body || document.documentElement;
  observer.observe(target, { childList: true, subtree: true });
}

function stopObserver() {
  if (observer) observer.disconnect();
  observer = null;
}

function applyEnabled(nextEnabled) {
  const normalized = !!nextEnabled;
  if (normalized === enabled) return;

  enabled = normalized;
  processed = new WeakSet();

  if (!enabled) {
    // #region runtime evidence
    try {
      console.info('[FocusShieldAI] disabled -> cleared blurred elements');
    } catch {}
    // #endregion
    stopObserver();
    clearDistracted();
    return;
  }

  injectStyle();
  // #region runtime evidence
  try {
    console.info('[FocusShieldAI] enabled -> starting scan/observer; classifier present:', !!globalThis.FSAIClassifier);
  } catch {}
  // #endregion
  // Initial scan.
  scanRoot(document.body || document.documentElement);
  startObserver();
}

async function initFromStorage() {
  try {
    const res = await chrome.storage.local.get([SETTINGS_KEY]);
    applyEnabled(typeof res?.[SETTINGS_KEY] === 'boolean' ? res[SETTINGS_KEY] : true);
  } catch {
    // If storage fails for any reason, default to ON so the user isn't confused.
    applyEnabled(true);
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'UPDATE_ENABLED') {
    applyEnabled(message.enabled);
  }
});

initFromStorage();

