# FocusShield AI (Chrome Extension, Manifest V3)

MVP: keyword-based distraction detection that blurs distracting text blocks in real time (client-side only).

## Project Layout

- `manifest.json` - MV3 manifest (popup + content script + service worker)
- `background.js` - stores the toggle state and broadcasts updates
- `content.js` - scans the page and applies DOM blur for distracting elements
- `classifier.js` - keyword-based text classifier (DISTRACTION vs FOCUS)
- `popup/` - toggle UI + styling

## Load Locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder (`NameNotDecide-ai/`)

## Toggle

Click the extension icon to enable/disable FocusShield AI. Preference is stored in `chrome.storage.local`.
