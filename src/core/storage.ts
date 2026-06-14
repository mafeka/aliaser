import type { Config } from './types';
import { DEFAULT_CONFIG } from './types';

export async function getConfig(): Promise<Config> {
  const result = await chrome.storage.sync.get(['config']);
  if (!result.config) {
    return { ...DEFAULT_CONFIG };
  }
  return { ...DEFAULT_CONFIG, ...result.config };
}

export async function saveConfig(config: Config): Promise<void> {
  await chrome.storage.sync.set({ config });
}

// IMPORTANT: Only call this from the background service worker to serialize
// counter access across tabs. Do NOT call from content scripts directly.
export async function incrementCounter(): Promise<number> {
  const config = await getConfig();
  const current = config.counter;
  config.counter = current + 1;
  await saveConfig(config);
  return current;
}
