import { getConfig, incrementCounter, saveConfig } from '../core/storage';
import { renderTemplate } from '../core/template';
import { extractDomain } from '../core/domain';
import type { TemplateContext } from '../core/types';

// Register context menu on install
chrome.runtime.onInstalled.addListener(async () => {
  await rebuildContextMenu();
});

// Rebuild context menu when config changes
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.config) {
    await rebuildContextMenu();
  }
});

async function rebuildContextMenu(): Promise<void> {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: 'aliaser-default',
    title: 'Generate email address',
    contexts: ['editable'],
  });

  const config = await getConfig();
  for (const preset of config.presets) {
    chrome.contextMenus.create({
      id: `aliaser-preset-${preset.name}`,
      parentId: 'aliaser-default',
      title: preset.name,
      contexts: ['editable'],
    });
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !tab.url) return;
  if (!info.menuItemId.toString().startsWith('aliaser')) return;

  const config = await getConfig();
  if (!config.mailDomain) {
    chrome.runtime.openOptionsPage();
    return;
  }

  let template = config.defaultTemplate;
  const presetPrefix = 'aliaser-preset-';
  if (info.menuItemId.toString().startsWith(presetPrefix)) {
    const presetName = info.menuItemId.toString().slice(presetPrefix.length);
    const preset = config.presets.find((p) => p.name === presetName);
    if (preset) template = preset.template;
  }

  const counter = await incrementCounter();
  const domain = extractDomain(tab.url);

  const ctx: TemplateContext = {
    domain,
    counter,
    mailDomain: config.mailDomain,
  };

  const address = renderTemplate(template, ctx);

  chrome.tabs.sendMessage(tab.id, {
    type: 'aliaser:insert',
    address,
  });
});

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === 'generate-email' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'aliaser:trigger-popup' });
  }
});

// Handle messages from content script requesting address generation
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'aliaser:generate') {
    handleGenerate(message.url, message.templateOverride).then(sendResponse);
    return true; // async response
  }
  if (message.type === 'aliaser:open-options') {
    chrome.runtime.openOptionsPage();
  }
});

async function handleGenerate(
  url: string,
  templateOverride?: string
): Promise<{ address: string } | { error: string }> {
  const config = await getConfig();
  if (!config.mailDomain) {
    return { error: 'no-mail-domain' };
  }

  const template = templateOverride ?? config.defaultTemplate;
  const counter = await incrementCounter();
  const domain = extractDomain(url);

  const ctx: TemplateContext = {
    domain,
    counter,
    mailDomain: config.mailDomain,
  };

  return { address: renderTemplate(template, ctx) };
}
