import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { createStubProvider } from '@/lib/providers';
import { distributeBudget, generateCampaign } from '@/lib/ads/generate';
import type { BrandProfile, CampaignInput } from '@/lib/schema';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-ads-'));
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

const campaignInput: CampaignInput = {
  name: 'Lansman',
  objective: 'traffic',
  audienceRef: 'Geliştirici',
  networks: ['meta'],
  totalBudget: 1000,
  currency: 'TRY',
  periodDays: 14,
  notes: '',
};

function adSet(angle: string, budgetShare: number) {
  return {
    angle,
    hypothesis: 'Bu açı işe yarar.',
    targeting: 'Yazılım ilgi alanları',
    budgetShare,
    budgetRationale: 'Denenmiş bir açı.',
    creatives: {
      meta: {
        primaryTexts: ['Kısa ve net bir birincil metin.'],
        headlines: ['Kısa başlık'],
        descriptions: ['Kısa açıklama'],
        visualDirection: 'Ekran kaydı, koyu arka plan.',
      },
    },
  };
}

function plan(sets: unknown[]) {
  return JSON.stringify({ positioning: 'Anahtar gerektirmeyen araç.', adSets: sets });
}

describe('distributeBudget', () => {
  it('normalises shares that do not add up to 100', () => {
    const result = distributeBudget([30, 30, 30], 900);
    expect(result.map((r) => r.share)).toEqual([33.33, 33.33, 33.33]);
    expect(result.reduce((total, r) => total + r.amount, 0)).toBeCloseTo(900, 0);
  });

  it('keeps the user total when shares already add to 100', () => {
    const result = distributeBudget([50, 30, 20], 1000);
    expect(result.map((r) => r.amount)).toEqual([500, 300, 200]);
  });

  it('falls back to an even split when every share is zero', () => {
    const result = distributeBudget([0, 0], 500);
    expect(result.map((r) => r.amount)).toEqual([250, 250]);
  });
});

describe('generateCampaign', () => {
  it('stores the campaign with identifiers and derived amounts', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([
      plan([adSet('Hız', 50), adSet('Maliyet', 30), adSet('Gizlilik', 20)]),
    ]);

    const result = await generateCampaign({ store, provider, campaign: campaignInput });

    expect(result.campaign.adSets).toHaveLength(3);
    expect(result.campaign.adSets[0].budgetAmount).toBe(500);
    expect(new Set(result.campaign.adSets.map((s) => s.id)).size).toBe(3);
    expect(await store.readCampaigns()).toHaveLength(1);
  });

  it('writes a readable markdown copy', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([plan([adSet('Hız', 100)])]);

    const result = await generateCampaign({ store, provider, campaign: campaignInput });
    const doc = await store.readCampaignDoc(result.campaign.id);

    expect(doc).toContain('# Lansman');
    expect(doc).toContain('## Hız');
    expect(doc).toContain('Kısa başlık');
  });

  it('discards an ad set whose copy exceeds a character limit', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);

    const tooLong = adSet('Uzun', 50);
    tooLong.creatives.meta.headlines = ['x'.repeat(41)];

    const provider = createStubProvider([plan([adSet('Hız', 50), tooLong])]);
    const result = await generateCampaign({ store, provider, campaign: campaignInput });

    expect(result.campaign.adSets).toHaveLength(1);
    expect(result.discarded).toBe(1);
  });

  it('rescales the budget after a set is discarded so the total still holds', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);

    const broken = adSet('Bozuk', 50);
    broken.creatives.meta.descriptions = ['y'.repeat(31)];

    const provider = createStubProvider([plan([adSet('Hız', 50), broken])]);
    const result = await generateCampaign({ store, provider, campaign: campaignInput });

    expect(result.campaign.adSets[0].budgetAmount).toBe(1000);
    expect(result.campaign.adSets[0].budgetShare).toBe(100);
  });

  it('throws when every ad set is invalid', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([plan([{ junk: true }]), plan([{ junk: true }])]);

    await expect(generateCampaign({ store, provider, campaign: campaignInput })).rejects.toThrow(
      /reklam seti/i,
    );
  });

  it('throws a readable error when no brand profile exists', async () => {
    const store = createStore(root);
    const provider = createStubProvider([plan([adSet('Hız', 100)])]);

    await expect(generateCampaign({ store, provider, campaign: campaignInput })).rejects.toThrow(
      /marka profili/i,
    );
  });
});
