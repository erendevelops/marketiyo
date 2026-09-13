import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { WorkspaceCorruptError } from '@/lib/workspace/errors';
import type { BrandProfile, Idea } from '@/lib/schema';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'Test',
  category: 'tool',
  audiences: [{ label: 'A', pain: 'B', desire: 'C', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

function idea(id: string): Idea {
  return {
    id,
    createdAt: '2026-09-11T00:00:00.000Z',
    batchId: 'b1',
    platform: 'x',
    format: 'thread',
    angle: 'education',
    hook: `hook-${id}`,
    premise: 'p',
    whyItWorks: 'w',
    audienceRef: 'A',
    score: 3,
    tags: [],
    status: 'new',
    promptVersion: 'idea-batch@1',
  };
}

describe('workspace store', () => {
  it('returns null when the brand profile does not exist', async () => {
    expect(await createStore(root).readBrand()).toBeNull();
  });

  it('round-trips the brand profile', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    expect((await store.readBrand())?.productName).toBe('Marketiyo');
  });

  it('returns an empty array for a missing ideas file', async () => {
    expect(await createStore(root).readIdeas()).toEqual([]);
  });

  it('appends ideas without dropping existing ones', async () => {
    const store = createStore(root);
    await store.appendIdeas([idea('i1')]);
    await store.appendIdeas([idea('i2')]);
    expect((await store.readIdeas()).map((i) => i.id)).toEqual(['i1', 'i2']);
  });

  it('updates a single idea in place', async () => {
    const store = createStore(root);
    await store.appendIdeas([idea('i1'), idea('i2')]);
    await store.updateIdea('i2', { status: 'kept' });
    const ideas = await store.readIdeas();
    expect(ideas.map((i) => i.status)).toEqual(['new', 'kept']);
  });

  it('throws WorkspaceCorruptError on unparseable json', async () => {
    await writeFile(path.join(root, 'brand.json'), '{ not json', 'utf8');
    await expect(createStore(root).readBrand()).rejects.toBeInstanceOf(WorkspaceCorruptError);
  });

  it('throws WorkspaceCorruptError when json is valid but the shape is wrong', async () => {
    await writeFile(path.join(root, 'brand.json'), JSON.stringify({ productName: 1 }), 'utf8');
    await expect(createStore(root).readBrand()).rejects.toBeInstanceOf(WorkspaceCorruptError);
  });

  it('serialises concurrent writes so no update is lost', async () => {
    const store = createStore(root);
    await Promise.all(Array.from({ length: 10 }, (_, n) => store.appendIdeas([idea(`i${n}`)])));
    expect(await store.readIdeas()).toHaveLength(10);
  });

  it('round-trips an expansion markdown file', async () => {
    const store = createStore(root);
    await store.writeExpansion('i1', '# Hook\n');
    expect(await store.readExpansion('i1')).toContain('# Hook');
    expect(await store.readExpansion('missing')).toBeNull();
  });

  it('returns default settings when none are stored', async () => {
    const settings = await createStore(root).readSettings();
    expect(settings.providerId).toBe('claude-code');
    expect(settings.onboarded).toBe(false);
  });

  it('leaves no temporary files behind after a write', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const entries = await readdir(root);
    expect(entries.some((entry) => entry.endsWith('.tmp'))).toBe(false);
  });
});

describe('updateSettings', () => {
  it('does not lose a patch when two updates run at the same time', async () => {
    const store = createStore(root);
    await Promise.all([
      store.updateSettings((current) => ({ ...current, theme: 'light' })),
      store.updateSettings((current) => ({ ...current, interfaceLanguage: 'en' })),
    ]);
    const saved = await store.readSettings();
    expect(saved.theme).toBe('light');
    expect(saved.interfaceLanguage).toBe('en');
  });

  it('skips the write when the change is rejected', async () => {
    const store = createStore(root);
    expect(await store.updateSettings(() => null)).toBeNull();
    expect(await readdir(root)).toEqual([]);
  });
});
