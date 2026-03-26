const DISTRACTION_KEYWORDS = [
  // Social / short-form
  'tiktok',
  'instagram',
  'facebook',
  'twitter',
  'x.com',
  'reddit',
  'youtube',
  // Adult / explicit
  'porn',
  'adult',
  // Gambling / “quick money”
  'casino',
  'bet',
  'casino',
  'free money',
  'crypto',
  // Videos / streaming (common distraction intent)
  'watch',
  'stream',
  'live',
  // Clickbait / engagement prompts
  'click here',
  'you won',
  'winner',
  // Gaming intent
  'game',
  'gaming',
  'loot',
  'ranked',
  // Generic
  'distract',
];

function normalize(text) {
  return (text ?? '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Keyword-based classification MVP.
 * Returns a label and (optionally) the first matching keyword.
 */
function classifyText(text) {
  const lc = normalize(text);
  if (!lc) return { label: 'FOCUS' };

  const hit = DISTRACTION_KEYWORDS.find((kw) => lc.includes(kw));
  if (hit) return { label: 'DISTRACTION', hit };
  return { label: 'FOCUS' };
}

/**
 * Extract limited text and classify an element.
 * Keep extraction small to avoid performance issues.
 */
function classifyElement(element, options = {}) {
  const maxChars = typeof options.maxChars === 'number' ? options.maxChars : 220;
  if (!element || !(element instanceof Element)) return { label: 'FOCUS' };

  const raw = element.textContent ?? '';
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!text) return { label: 'FOCUS' };

  const clipped = text.length > maxChars ? text.slice(0, maxChars) : text;
  return classifyText(clipped);
}

// Expose as a plain global so content.js can run as a classic script.
// (This avoids Manifest V3 content-script module compatibility issues.)
globalThis.FSAIClassifier = {
  classifyText,
  classifyElement,
};

