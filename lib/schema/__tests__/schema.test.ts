import { describe, it, expect } from 'vitest';
import { brandProfileSchema, ideaSchema, ideaBatchResponseSchema, schemaByName } from '@/lib/schema';

const validBrand = {
  productName: 'Marketiyo',
  oneLiner: 'Urunun icin sosyal medya icerigi uretir.',
  category: 'developer tool',
  audiences: [
    { label: 'Indie hacker', pain: 'Pazarlama zamani yok', desire: 'Duzenli icerik', whereTheyHangOut: 'X' },
  ],
  offers: [{ label: 'Repo', cta: 'Yildiz birak', url: 'https://example.com' }],
  voice: { do: ['Net ol'], dont: ['Abartma'], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: ['En iyi'],
  outputLanguage: 'tr',
  platforms: ['short-video'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

describe('brandProfileSchema', () => {
  it('accepts a complete profile', () => {
    expect(brandProfileSchema.parse(validBrand).productName).toBe('Marketiyo');
  });

  it('rejects an unknown output language', () => {
    expect(() => brandProfileSchema.parse({ ...validBrand, outputLanguage: 'de' })).toThrow();
  });

  it('requires at least one audience', () => {
    expect(() => brandProfileSchema.parse({ ...validBrand, audiences: [] })).toThrow();
  });
});

describe('ideaSchema', () => {
  it('defaults status to new', () => {
    const idea = ideaSchema.parse({
      id: 'i1',
      createdAt: '2026-09-11T00:00:00.000Z',
      batchId: 'b1',
      platform: 'short-video',
      format: 'talking-head',
      angle: 'education',
      hook: 'Bunu bilmiyordun',
      premise: 'Bir ozelligi gosterir.',
      whyItWorks: 'Merak uyandirir.',
      audienceRef: 'Indie hacker',
      score: 4,
      tags: [],
      promptVersion: 'idea-batch@1',
    });
    expect(idea.status).toBe('new');
  });
});

describe('ideaBatchResponseSchema', () => {
  it('accepts a well formed batch envelope', () => {
    const parsed = ideaBatchResponseSchema.parse({
      ideas: [
        {
          platform: 'x',
          format: 'thread',
          angle: 'proof',
          hook: 'Su rakam ilginc',
          premise: 'Sonuclari paylas.',
          whyItWorks: 'Somut veri.',
          audienceRef: 'Indie hacker',
          score: 5,
          tags: ['veri'],
        },
      ],
    });
    expect(parsed.ideas).toHaveLength(1);
  });

  it('rejects a response with no ideas array', () => {
    expect(() => ideaBatchResponseSchema.parse({})).toThrow();
  });

  it('leaves per item validation to the caller so one bad item cannot void a batch', () => {
    const parsed = ideaBatchResponseSchema.parse({ ideas: [{ nonsense: true }, 42] });
    expect(parsed.ideas).toHaveLength(2);
  });
});

describe('schemaByName', () => {
  it('resolves a registered schema', () => {
    expect(schemaByName('ideaBatchResponse')).toBe(ideaBatchResponseSchema);
  });

  it('throws for an unknown schema name', () => {
    expect(() => schemaByName('nope')).toThrow(/unknown schema/i);
  });
});
