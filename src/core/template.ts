import { format } from 'date-fns';
import type { TemplateContext, PlaceholderHandler } from './types';

const PLACEHOLDER_RE = /\{\{([^}]+)\}\}/g;
const UNCLOSED_RE = /\{\{[^}]*(?:\}[^}]|$)/;

const KNOWN_PLACEHOLDERS = ['domain', 'mailDomain', 'counter', 'date', 'random'];

const handlers: Record<string, PlaceholderHandler> = {
  domain: {
    resolve: (_arg, ctx) => ctx.domain,
  },
  mailDomain: {
    resolve: (_arg, ctx) => ctx.mailDomain,
  },
  counter: {
    resolve: (_arg, ctx) => String(ctx.counter),
  },
  date: {
    resolve: (arg, _ctx) => format(new Date(), arg ?? 'yyyyMMdd'),
  },
  random: {
    resolve: (arg, _ctx) => {
      const len = parseInt(arg ?? '8', 10);
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const array = new Uint8Array(len);
      crypto.getRandomValues(array);
      for (let i = 0; i < len; i++) {
        result += chars[array[i] % chars.length];
      }
      return result;
    },
  },
};

export function renderTemplate(template: string, ctx: TemplateContext): string {
  return template.replace(PLACEHOLDER_RE, (_match, token: string) => {
    const [name, ...rest] = token.split(':');
    const arg = rest.length > 0 ? rest.join(':') : undefined;
    const handler = handlers[name];
    if (!handler) {
      return `{{${token}}}`;
    }
    return handler.resolve(arg, ctx);
  });
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTemplate(template: string): ValidationResult {
  const errors: string[] = [];

  if (UNCLOSED_RE.test(template)) {
    errors.push('Unclosed placeholder detected');
    return { valid: false, errors };
  }

  let match;
  const re = new RegExp(PLACEHOLDER_RE.source, 'g');
  while ((match = re.exec(template)) !== null) {
    const token = match[1];
    const name = token.split(':')[0];
    if (!KNOWN_PLACEHOLDERS.includes(name)) {
      errors.push(`Unknown placeholder: ${name}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
