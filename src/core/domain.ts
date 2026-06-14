import { getDomain } from 'tldts';

export function extractDomain(url: string): string {
  const domain = getDomain(url);
  if (domain) {
    return domain;
  }
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
