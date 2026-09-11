import { describe, it, expect } from 'vitest';
import { t } from '@/lib/i18n';
import { tr } from '@/lib/i18n/tr';
import { en } from '@/lib/i18n/en';

describe('i18n', () => {
  it('defaults to Turkish', () => {
    expect(t('tr').appName).toBe('Marketiyo');
  });

  it('returns English when asked', () => {
    expect(t('en').setupTitle).toBe('Setup');
  });

  it('has identical key sets in both dictionaries', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(tr).sort());
  });

  it('has no empty strings', () => {
    for (const dictionary of [tr, en]) {
      for (const [key, value] of Object.entries(dictionary)) {
        expect(value, `empty value for ${key}`).not.toBe('');
      }
    }
  });
});
