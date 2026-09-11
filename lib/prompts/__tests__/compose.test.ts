import { describe, it, expect } from 'vitest';
import { composeExpansionPrompt, composeIdeaBatchPrompt } from '@/lib/prompts/compose';
import { loadPlatformCard, loadTemplate } from '@/lib/prompts/load';
import type { BrandProfile, Idea } from '@/lib/schema';

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'Sosyal medya icerik motoru',
  category: 'developer tool',
  audiences: [
    { label: 'Indie hacker', pain: 'Zaman yok', desire: 'Duzenli icerik', whereTheyHangOut: 'X' },
  ],
  offers: [{ label: 'Repo', cta: 'Dene', url: 'https://example.com' }],
  voice: { do: ['Net ol'], dont: ['Abartma'], referenceExamples: [] },
  proof: ['200 kullanici'],
  competitors: [],
  bannedClaims: ['Piyasanin en iyisi'],
  outputLanguage: 'tr',
  platforms: ['short-video'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

function idea(n: number, status: Idea['status'] = 'rejected'): Idea {
  return {
    id: `i${n}`,
    createdAt: '2026-09-11T00:00:00.000Z',
    batchId: 'b1',
    platform: 'short-video',
    format: 'talking-head',
    angle: 'education',
    hook: `hook-${n}`,
    premise: 'p',
    whyItWorks: 'w',
    audienceRef: 'Indie hacker',
    score: 3,
    tags: [],
    status,
    promptVersion: 'idea-batch@1',
  };
}

const base = {
  brand,
  platform: 'short-video' as const,
  count: 10,
  angles: [],
  recentHooks: [],
  recentRejections: [],
};

describe('composeIdeaBatchPrompt', () => {
  it('includes the brand profile and the banned claims', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt).toContain('Marketiyo');
    expect(prompt).toContain('Piyasanin en iyisi');
  });

  it('includes the platform rule card for the requested platform only', () => {
    const prompt = composeIdeaBatchPrompt(base).toLowerCase();
    expect(prompt).toContain('kisa video');
    expect(prompt).not.toContain('linkedin');
  });

  it('caps avoidance hooks at 150, newest first', () => {
    const hooks = Array.from({ length: 200 }, (_, n) => `hook-${n}`);
    const prompt = composeIdeaBatchPrompt({ ...base, recentHooks: hooks });
    expect(prompt).toContain('- hook-199');
    expect(prompt).not.toContain('- hook-10\n');
  });

  it('caps rejections at 40', () => {
    const rejections = Array.from({ length: 60 }, (_, n) => idea(n));
    const prompt = composeIdeaBatchPrompt({ ...base, recentRejections: rejections });
    const section = prompt.slice(prompt.indexOf('## REDDEDILENLER'));
    expect(section.split('- hook-').length - 1).toBe(40);
  });

  it('uses the output language of the brand, not the interface', () => {
    const prompt = composeIdeaBatchPrompt({
      ...base,
      brand: { ...brand, outputLanguage: 'en' },
    }).toLowerCase();
    expect(prompt).toContain('short video');
  });

  it('asks for the requested number of ideas', () => {
    expect(composeIdeaBatchPrompt({ ...base, count: 25 })).toContain('25');
  });

  it('places sections in the fixed order', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt.indexOf('## MARKA')).toBeLessThan(prompt.indexOf('## PLATFORM'));
    expect(prompt.indexOf('## PLATFORM')).toBeLessThan(prompt.indexOf('## CIKTI'));
  });

  it('omits the avoidance sections when there is no history', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt).not.toContain('## TEKRARLAMA');
    expect(prompt).not.toContain('## REDDEDILENLER');
  });
});

describe('composeExpansionPrompt', () => {
  it('uses the expansion template for the idea platform', () => {
    const prompt = composeExpansionPrompt({ brand, idea: idea(1, 'kept') });
    expect(prompt).toContain('Cekim notlari');
    expect(prompt).toContain('hook-1');
  });
});

describe('loadTemplate', () => {
  it('throws for a missing template', () => {
    expect(() => loadTemplate('does-not-exist', 'tr')).toThrow(/missing prompt file/i);
  });

  it('loads every platform card in both languages', () => {
    for (const platform of ['short-video', 'x', 'linkedin', 'instagram-static'] as const) {
      expect(loadPlatformCard(platform, 'tr').length).toBeGreaterThan(50);
      expect(loadPlatformCard(platform, 'en').length).toBeGreaterThan(50);
    }
  });
});
