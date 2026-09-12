import { describe, it, expect } from 'vitest';
import { composeIdeaBatchPrompt } from '@/lib/prompts/compose';
import { loadPlatformCard, loadTemplate } from '@/lib/prompts/load';
import type { BrandProfile } from '@/lib/schema';

const brand: BrandProfile = {
  productName: 'Uzayalım',
  oneLiner: 'Boy gelişimi takibi',
  category: 'mobil uygulama',
  audiences: [
    { label: 'Ebeveynler', pain: 'Çocuğu yeterince büyüyor mu bilmiyor', desire: 'Netlik', whereTheyHangOut: 'Instagram' },
  ],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['short-video'],
  updatedAt: '2026-09-12T00:00:00.000Z',
};

const base = {
  brand,
  platform: 'short-video' as const,
  count: 3,
  angles: [],
  recentHooks: [],
  recentRejections: [],
};

describe('cold audience framing', () => {
  it('tells the model the viewer has never heard of the product', () => {
    const prompt = composeIdeaBatchPrompt(base).toLowerCase();
    expect(prompt).toContain('ürünü bilmiyor');
  });

  it('forbids opening a hook with the product or a feature name', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt).toContain('Ürün adıyla başlamamalı');
    expect(prompt).toContain('Özellik adı kullanmamalı');
  });

  it('rejects ideas that only make sense to existing users', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt).toContain('Yalnızca mevcut kullanıcıların anlayacağı bir fikir geçersizdir');
  });

  it('places the product after the viewer is interested, not first', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt).toMatch(/Baştan değil/);
  });

  it('scores hooks on whether they stop a stranger', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt).toContain('Kanca, ürünü bilmeyen birini durdurur mu?');
  });

  it('keeps the short video card focused on stopping the scroll', () => {
    const card = loadPlatformCard('short-video', 'tr');
    expect(card).toContain('kaydırmayı durdurur');
    expect(card).toContain('Ürün adıyla veya özellik adıyla açmak');
  });

  it('carries the same framing in English', () => {
    const template = loadTemplate('idea-batch', 'en');
    expect(template).toContain('does not know the product');
    expect(template).toContain('Open with the product name');

    const card = loadPlatformCard('short-video', 'en');
    expect(card).toContain('stops a scroll');
  });
});
