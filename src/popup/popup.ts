import { getConfig } from '../core/storage';

async function init(): Promise<void> {
  const config = await getConfig();

  const mailDomainEl = document.getElementById('mail-domain')!;
  const templateEl = document.getElementById('default-template')!;
  const optionsBtn = document.getElementById('open-options')!;

  mailDomainEl.textContent = config.mailDomain || 'Not configured';
  templateEl.textContent = config.defaultTemplate;

  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

init();
