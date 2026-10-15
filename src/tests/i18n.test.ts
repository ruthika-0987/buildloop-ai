import { describe, it, expect } from 'vitest';
import { en } from '../i18n/en';
import { te } from '../i18n/te';
import { hi } from '../i18n/hi';

describe('i18n Multilingual Completeness Tests', () => {
  it('All English dictionary keys exist in Telugu (te)', () => {
    const enKeys = Object.keys(en);
    const teKeys = new Set(Object.keys(te));

    const missingInTelugu = enKeys.filter(k => !teKeys.has(k) || !(te as any)[k]);
    expect(missingInTelugu).toEqual([]);
    expect(Object.keys(te).length).toBe(enKeys.length);
  });

  it('All English dictionary keys exist in Hindi (hi)', () => {
    const enKeys = Object.keys(en);
    const hiKeys = new Set(Object.keys(hi));

    const missingInHindi = enKeys.filter(k => !hiKeys.has(k) || !(hi as any)[k]);
    expect(missingInHindi).toEqual([]);
    expect(Object.keys(hi).length).toBe(enKeys.length);
  });
});
