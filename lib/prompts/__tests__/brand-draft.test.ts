import { describe, it, expect } from 'vitest';
import { composeBrandDraftPrompt } from '@/lib/prompts/brand-draft';
import { platformSchema } from '@/lib/schema';

const description = 'Tek kişilik geliştiriciler için yerel çalışan bir pazarlama aracı.';

describe('composeBrandDraftPrompt', () => {
  it('includes the product description', () => {
    expect(composeBrandDraftPrompt({ text: description, language: 'tr' })).toContain(description);
  });

  it('lists every allowed platform identifier', () => {
    const prompt = composeBrandDraftPrompt({ text: description, language: 'tr' });
    for (const platform of platformSchema.options) {
      expect(prompt, `missing ${platform}`).toContain(platform);
    }
  });

  it('states that platform values are identifiers, not labels', () => {
    const prompt = composeBrandDraftPrompt({ text: description, language: 'tr' });
    expect(prompt.toLowerCase()).toMatch(/çevirme|birebir|aynen/);
  });

  it('gives a complete json skeleton rather than a prose field list', () => {
    const prompt = composeBrandDraftPrompt({ text: description, language: 'tr' });
    for (const key of [
      '"productName"',
      '"oneLiner"',
      '"category"',
      '"audiences"',
      '"offers"',
      '"voice"',
      '"proof"',
      '"competitors"',
      '"bannedClaims"',
      '"outputLanguage"',
      '"platforms"',
      '"updatedAt"',
    ]) {
      expect(prompt, `missing ${key}`).toContain(key);
    }
  });

  it('pins the output language to the one requested', () => {
    expect(composeBrandDraftPrompt({ text: description, language: 'en' })).toContain('"en"');
    expect(composeBrandDraftPrompt({ text: description, language: 'tr' })).toContain('"tr"');
  });
});
