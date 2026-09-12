import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { createStubProvider } from '@/lib/providers';
import { draftArticle, generateArticles } from '@/lib/seo/generate';
import type { BrandProfile } from '@/lib/schema';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-seo-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'İçerik motoru',
  category: 'araç',
  audiences: [{ label: 'Geliştirici', pain: 'Zaman yok', desire: 'İçerik', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

function article(title: string) {
  return {
    title,
    primaryKeyword: 'geliştirici pazarlama',
    secondaryKeywords: ['indie hacker pazarlama'],
    searchIntent: 'informational',
    funnelStage: 'awareness',
    angle: 'Geliştirici gözünden',
    whyItWorks: 'Kitlenin asıl sorunu bu.',
    outlinePoints: ['Sorun', 'Yöntem', 'Örnek'],
  };
}

const batch = (items: unknown[]) => JSON.stringify({ articles: items });

describe('generateArticles', () => {
  it('assigns identifiers and stores the batch', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([batch([article('Bir'), article('İki')])]);

    const result = await generateArticles({ store, provider, count: 2 });

    expect(result.articles).toHaveLength(2);
    expect(new Set(result.articles.map((a) => a.id)).size).toBe(2);
    expect(result.articles.every((a) => a.status === 'new')).toBe(true);
    expect(await store.readArticles()).toHaveLength(2);
  });

  it('discards an item with too few outline points', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);

    const thin = article('Zayıf');
    thin.outlinePoints = ['Tek başlık'];

    const provider = createStubProvider([batch([article('Sağlam'), thin])]);
    const result = await generateArticles({ store, provider, count: 2 });

    expect(result.articles).toHaveLength(1);
    expect(result.discarded).toBe(1);
  });

  it('feeds prior titles back so topics are not repeated', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    await generateArticles({
      store,
      provider: createStubProvider([batch([article('Eski başlık')])]),
      count: 1,
    });

    const prompts: string[] = [];
    const inner = createStubProvider([batch([article('Yeni başlık')])]);
    await generateArticles({
      store,
      provider: {
        id: inner.id,
        isAvailable: inner.isAvailable,
        complete: async (req) => {
          prompts.push(req.prompt);
          return inner.complete(req);
        },
      },
      count: 1,
    });

    expect(prompts[0]).toContain('Eski başlık');
  });

  it('throws without a brand profile', async () => {
    const store = createStore(root);
    const provider = createStubProvider([batch([article('Bir')])]);
    await expect(generateArticles({ store, provider, count: 1 })).rejects.toThrow(/marka profili/i);
  });
});

describe('draftArticle', () => {
  it('writes the draft with meta tags in the front matter', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const created = await generateArticles({
      store,
      provider: createStubProvider([batch([article('Konu')])]),
      count: 1,
    });

    const provider = createStubProvider([
      JSON.stringify({
        markdown: '# Konu\n\nGövde',
        metaTitle: 'Kısa meta başlık',
        metaDescription: 'Kısa meta açıklama',
      }),
    ]);

    await draftArticle({ store, provider, articleId: created.articles[0].id });

    const draft = await store.readArticleDraft(created.articles[0].id);
    expect(draft).toContain('metaTitle: Kısa meta başlık');
    expect(draft).toContain('# Konu');
    expect((await store.readArticles())[0].status).toBe('drafted');
  });

  it('rejects a meta title over 60 characters', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const created = await generateArticles({
      store,
      provider: createStubProvider([batch([article('Konu')])]),
      count: 1,
    });

    const tooLong = JSON.stringify({
      markdown: 'Gövde',
      metaTitle: 'x'.repeat(61),
      metaDescription: 'Kısa',
    });

    await expect(
      draftArticle({
        store,
        provider: createStubProvider([tooLong, tooLong]),
        articleId: created.articles[0].id,
      }),
    ).rejects.toThrow();
  });

  it('throws when the topic does not exist', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ markdown: 'x', metaTitle: 'a', metaDescription: 'b' })]);
    await expect(draftArticle({ store, provider, articleId: 'yok' })).rejects.toThrow(/bulunamadı/i);
  });
});
