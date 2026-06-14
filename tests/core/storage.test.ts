import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Config } from '@/core/types';
import { DEFAULT_CONFIG } from '@/core/types';

// Mock chrome.storage.sync
const mockStorage: Record<string, unknown> = {};
const chromeMock = {
  storage: {
    sync: {
      get: vi.fn((keys: string[]) =>
        Promise.resolve(
          Object.fromEntries(keys.filter((k) => k in mockStorage).map((k) => [k, mockStorage[k]]))
        )
      ),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
};

vi.stubGlobal('chrome', chromeMock);

// Import after mocking
const { getConfig, saveConfig, incrementCounter } = await import('@/core/storage');

describe('storage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    vi.clearAllMocks();
  });

  it('returns default config when storage is empty', async () => {
    const config = await getConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns merged config when storage has partial data', async () => {
    mockStorage['config'] = { mailDomain: 'test.com' };
    const config = await getConfig();
    expect(config.mailDomain).toBe('test.com');
    expect(config.defaultTemplate).toBe(DEFAULT_CONFIG.defaultTemplate);
  });

  it('saves config to storage', async () => {
    const config: Config = { ...DEFAULT_CONFIG, mailDomain: 'test.com' };
    await saveConfig(config);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith({ config });
  });

  it('increments counter and returns new value', async () => {
    mockStorage['config'] = { ...DEFAULT_CONFIG, counter: 5 };
    const value = await incrementCounter();
    expect(value).toBe(5);
    expect(mockStorage['config'].counter).toBe(6);
  });
});
