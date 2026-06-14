import { describe, it, expect } from 'vitest';
import { extractDomain } from '@/core/domain';

describe('extractDomain', () => {
  it('strips www subdomain', () => {
    expect(extractDomain('https://www.amazon.de/register')).toBe('amazon.de');
  });

  it('strips deep subdomains', () => {
    expect(extractDomain('https://login.store.amazon.co.uk/auth')).toBe('amazon.co.uk');
  });

  it('handles domain without subdomain', () => {
    expect(extractDomain('https://github.com/signup')).toBe('github.com');
  });

  it('handles multi-part TLDs', () => {
    expect(extractDomain('https://my.custom.co.uk')).toBe('custom.co.uk');
  });

  it('falls back to hostname for localhost', () => {
    expect(extractDomain('http://localhost:3000/register')).toBe('localhost');
  });

  it('falls back to hostname for IP addresses', () => {
    expect(extractDomain('http://192.168.1.1:8080/form')).toBe('192.168.1.1');
  });
});
