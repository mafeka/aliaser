import { attachOverlay } from './overlay';
import { injectValue } from './injector';

const EMAIL_SELECTORS = [
  'input[type="email"]',
  'input[name*="email" i]',
  'input[autocomplete="email"]',
  'input[placeholder*="email" i]',
  'input[id*="email" i]',
];

const COMBINED_SELECTOR = EMAIL_SELECTORS.join(', ');
const overlaidFields = new WeakSet<Element>();

function scanForEmailFields(): void {
  const fields = document.querySelectorAll<HTMLInputElement>(COMBINED_SELECTOR);
  for (const field of fields) {
    if (!overlaidFields.has(field)) {
      overlaidFields.add(field);
      attachOverlay(field);
    }
  }
}

// Initial scan
scanForEmailFields();

// Watch for dynamically added fields
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const observer = new MutationObserver(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(scanForEmailFields, 200);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Listen for insert messages from background (context menu path)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'mailfill:insert') {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement) {
      injectValue(active, message.address);
    }
  }
  if (message.type === 'mailfill:trigger-popup') {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement && overlaidFields.has(active)) {
      active.dispatchEvent(new CustomEvent('mailfill:open', { bubbles: true }));
    }
  }
});
