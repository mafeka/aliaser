import { getConfig, saveConfig } from '../core/storage';
import { renderTemplate, validateTemplate } from '../core/template';
import type { Config, Preset, TemplateContext } from '../core/types';

const SAMPLE_CTX: TemplateContext = {
  domain: 'example.com',
  counter: 1,
  mailDomain: '',
};

let currentConfig: Config;

async function init(): Promise<void> {
  currentConfig = await getConfig();

  const mailDomainInput = document.getElementById('mail-domain') as HTMLInputElement;
  const templateInput = document.getElementById('default-template') as HTMLInputElement;
  const previewEl = document.getElementById('template-preview')!;
  const errorEl = document.getElementById('template-error')!;
  const presetsListEl = document.getElementById('presets-list')!;
  const addPresetBtn = document.getElementById('add-preset')!;
  const saveBtn = document.getElementById('save')!;
  const statusEl = document.getElementById('save-status')!;
  const counterEl = document.getElementById('counter-value')!;

  mailDomainInput.value = currentConfig.mailDomain;
  templateInput.value = currentConfig.defaultTemplate;
  counterEl.textContent = String(currentConfig.counter);
  updatePreview(templateInput.value, mailDomainInput.value, previewEl, errorEl);
  renderPresets(currentConfig.presets, presetsListEl);

  templateInput.addEventListener('input', () => {
    updatePreview(templateInput.value, mailDomainInput.value, previewEl, errorEl);
  });
  mailDomainInput.addEventListener('input', () => {
    updatePreview(templateInput.value, mailDomainInput.value, previewEl, errorEl);
  });

  addPresetBtn.addEventListener('click', () => {
    currentConfig.presets.push({ name: '', template: '' });
    renderPresets(currentConfig.presets, presetsListEl);
  });

  saveBtn.addEventListener('click', async () => {
    const validation = validateTemplate(templateInput.value);
    if (!validation.valid) {
      errorEl.textContent = validation.errors.join(', ');
      return;
    }

    currentConfig.mailDomain = mailDomainInput.value.trim();
    currentConfig.defaultTemplate = templateInput.value;
    readPresetsFromDOM(presetsListEl);

    await saveConfig(currentConfig);
    statusEl.textContent = 'Settings saved';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);
  });
}

function updatePreview(
  template: string,
  mailDomain: string,
  previewEl: HTMLElement,
  errorEl: HTMLElement
): void {
  const validation = validateTemplate(template);
  if (!validation.valid) {
    errorEl.textContent = validation.errors.join(', ');
    previewEl.textContent = '';
    return;
  }
  errorEl.textContent = '';
  const ctx: TemplateContext = { ...SAMPLE_CTX, mailDomain: mailDomain || 'your-domain.com' };
  previewEl.textContent = `Preview: ${renderTemplate(template, ctx)}`;
}

function renderPresets(presets: Preset[], container: HTMLElement): void {
  container.innerHTML = '';
  presets.forEach((preset, i) => {
    const row = document.createElement('div');
    row.className = 'preset-row';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Name';
    nameInput.value = preset.name;
    nameInput.dataset.presetName = String(i);

    const templateInput = document.createElement('input');
    templateInput.type = 'text';
    templateInput.placeholder = 'Template';
    templateInput.value = preset.template;
    templateInput.dataset.presetTemplate = String(i);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.presetDelete = String(i);

    row.appendChild(nameInput);
    row.appendChild(templateInput);
    row.appendChild(deleteBtn);
    deleteBtn.addEventListener('click', () => {
      presets.splice(i, 1);
      renderPresets(presets, container);
    });
    container.appendChild(row);
  });
}

function readPresetsFromDOM(container: HTMLElement): void {
  const nameInputs = container.querySelectorAll<HTMLInputElement>('[data-preset-name]');
  const templateInputs = container.querySelectorAll<HTMLInputElement>('[data-preset-template]');
  currentConfig.presets = [];
  nameInputs.forEach((nameInput, i) => {
    const templateInput = templateInputs[i];
    if (nameInput.value.trim() && templateInput.value.trim()) {
      currentConfig.presets.push({
        name: nameInput.value.trim(),
        template: templateInput.value.trim(),
      });
    }
  });
}

init();
