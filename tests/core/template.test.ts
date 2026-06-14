import { describe, it, expect } from 'vitest';
import { renderTemplate, validateTemplate } from '@/core/template';
import type { TemplateContext } from '@/core/types';

const ctx: TemplateContext = {
  domain: 'amazon.de',
  counter: 42,
  mailDomain: 'personal-mail-domain.com',
};

describe('renderTemplate', () => {
  it('resolves {{domain}}', () => {
    expect(renderTemplate('{{domain}}', ctx)).toBe('amazon.de');
  });

  it('resolves {{mailDomain}}', () => {
    expect(renderTemplate('{{mailDomain}}', ctx)).toBe('personal-mail-domain.com');
  });

  it('resolves {{counter}}', () => {
    expect(renderTemplate('{{counter}}', ctx)).toBe('42');
  });

  it('resolves {{random:N}} with correct length', () => {
    const result = renderTemplate('{{random:12}}', ctx);
    expect(result).toMatch(/^[a-z0-9]{12}$/);
  });

  it('resolves {{date:yyyyMMdd}} to current date', () => {
    const result = renderTemplate('{{date:yyyyMMdd}}', ctx);
    expect(result).toMatch(/^\d{8}$/);
  });

  it('preserves literal text around placeholders', () => {
    const result = renderTemplate('spam-{{domain}}-{{counter}}@{{mailDomain}}', ctx);
    expect(result).toBe('spam-amazon.de-42@personal-mail-domain.com');
  });

  it('handles template with no placeholders', () => {
    expect(renderTemplate('literal@example.com', ctx)).toBe('literal@example.com');
  });

  it('handles adjacent placeholders', () => {
    const result = renderTemplate('{{domain}}{{counter}}', ctx);
    expect(result).toBe('amazon.de42');
  });

  it('uses default format for {{date}} without arg', () => {
    const result = renderTemplate('{{date}}', ctx);
    expect(result).toMatch(/^\d{8}$/);
  });

  it('uses default length for {{random}} without arg', () => {
    const result = renderTemplate('{{random}}', ctx);
    expect(result).toMatch(/^[a-z0-9]{8}$/);
  });
});

describe('validateTemplate', () => {
  it('returns valid for known placeholders', () => {
    const result = validateTemplate('{{domain}}-{{counter}}@{{mailDomain}}');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns error for unknown placeholder', () => {
    const result = validateTemplate('{{domain}}-{{foo}}@{{mailDomain}}');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Unknown placeholder: foo');
  });

  it('returns valid for template with no placeholders', () => {
    const result = validateTemplate('literal@example.com');
    expect(result.valid).toBe(true);
  });

  it('returns error for unclosed placeholder', () => {
    const result = validateTemplate('{{domain}-{{counter}}');
    expect(result.valid).toBe(false);
  });
});
