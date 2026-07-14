import { injectValue } from './injector';

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;

export function attachOverlay(field: HTMLInputElement): void {
  const wrapper = ensureWrapper(field);
  const host = document.createElement('div');
  wrapper.appendChild(host);

  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = `
    <style>
      :host {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2147483647;
      }
      .aliaser-icon {
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.15s;
        display: flex;
        align-items: center;
        padding: 2px;
        border-radius: 3px;
      }
      .aliaser-icon:hover {
        opacity: 1;
        background: rgba(0,0,0,0.05);
      }
      .aliaser-popup {
        position: absolute;
        right: 0;
        top: calc(100% + 4px);
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 320px;
        font-family: system-ui, sans-serif;
        font-size: 13px;
        color: #333;
        display: none;
      }
      .aliaser-popup.open { display: block; }
      .aliaser-popup input {
        width: 100%;
        box-sizing: border-box;
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 13px;
        margin: 4px 0;
      }
      .aliaser-popup select {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 13px;
        margin: 4px 0;
      }
      .aliaser-popup button {
        width: 100%;
        padding: 6px 12px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        margin-top: 4px;
      }
      .aliaser-popup button:hover { background: #1d4ed8; }
      .aliaser-popup label {
        font-size: 11px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    </style>
    <div class="aliaser-icon">${ICON_SVG}</div>
    <div class="aliaser-popup">
      <label>Preset</label>
      <select class="aliaser-preset"></select>
      <label>Address</label>
      <input class="aliaser-address" type="text" />
      <button class="aliaser-fill">Fill</button>
    </div>
  `;

  const icon = shadow.querySelector('.aliaser-icon') as HTMLElement;
  const popup = shadow.querySelector('.aliaser-popup') as HTMLElement;
  const addressInput = shadow.querySelector('.aliaser-address') as HTMLInputElement;
  const presetSelect = shadow.querySelector('.aliaser-preset') as HTMLSelectElement;
  const fillButton = shadow.querySelector('.aliaser-fill') as HTMLButtonElement;

  async function openPopup(): Promise<void> {
    if (popup.classList.contains('open')) {
      popup.classList.remove('open');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'aliaser:generate',
      url: window.location.href,
    });

    if (response.error === 'no-mail-domain') {
      chrome.runtime.sendMessage({ type: 'aliaser:open-options' });
      return;
    }

    addressInput.value = response.address;

    const config = await chrome.storage.sync.get(['config']);
    const presets = config.config?.presets ?? [];
    presetSelect.innerHTML = '<option value="">Default</option>';
    for (const preset of presets) {
      const opt = document.createElement('option');
      opt.value = preset.template;
      opt.textContent = preset.name;
      presetSelect.appendChild(opt);
    }

    popup.classList.add('open');
  }

  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    openPopup();
  });

  // Listen for keyboard shortcut trigger from detector.ts
  field.addEventListener('aliaser:open', () => {
    openPopup();
  });

  // Regenerate when preset changes
  presetSelect.addEventListener('change', async () => {
    const template = presetSelect.value || undefined;
    const response = await chrome.runtime.sendMessage({
      type: 'aliaser:generate',
      url: window.location.href,
      templateOverride: template,
    });
    if (response.address) {
      addressInput.value = response.address;
    }
  });

  // Fill button
  fillButton.addEventListener('click', () => {
    injectValue(field, addressInput.value);
    popup.classList.remove('open');
  });

  // Close popup on outside click
  document.addEventListener('click', () => {
    popup.classList.remove('open');
  });
}

function ensureWrapper(field: HTMLInputElement): HTMLElement {
  const parent = field.parentElement;
  if (!parent) return document.body;

  const computedStyle = window.getComputedStyle(parent);
  if (computedStyle.position !== 'static') {
    return parent;
  }

  // Wrap the field in a positioned container to avoid mutating host page styles
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  wrapper.style.width = '100%';
  parent.insertBefore(wrapper, field);
  wrapper.appendChild(field);
  return wrapper;
}
