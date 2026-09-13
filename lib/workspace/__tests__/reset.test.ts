import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-reset-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function seedEverything() {
  for (const file of [
    'brand.json',
    'ideas.json',
    'calendar.json',
    'campaigns.json',
    'articles.json',
    'settings.local.json',
  ]) {
    await writeFile(path.join(root, file), '{}', 'utf8');
  }
  for (const dir of ['expansions', 'campaigns', 'articles']) {
    await mkdir(path.join(root, dir), { recursive: true });
    await writeFile(path.join(root, dir, 'a.md'), '# x', 'utf8');
  }
}

describe('resetWorkspace', () => {
  it('removes every file and folder the app owns', async () => {
    await seedEverything();
    await createStore(root).resetWorkspace();
    expect(await readdir(root)).toEqual([]);
  });

  it('never touches a file the app does not own', async () => {
    await seedEverything();
    await writeFile(path.join(root, 'notlarim.txt'), 'kişisel not', 'utf8');
    await mkdir(path.join(root, 'baska-klasor'), { recursive: true });
    await writeFile(path.join(root, 'baska-klasor', 'dosya.txt'), 'dokunma', 'utf8');

    await createStore(root).resetWorkspace();

    expect((await readdir(root)).sort()).toEqual(['baska-klasor', 'notlarim.txt']);
    expect(await readFile(path.join(root, 'notlarim.txt'), 'utf8')).toBe('kişisel not');
  });

  it('succeeds on a workspace that is already empty', async () => {
    await expect(createStore(root).resetWorkspace()).resolves.toBeUndefined();
  });

  it('leaves the store usable afterwards with first-run defaults', async () => {
    await seedEverything();
    const store = createStore(root);
    await store.resetWorkspace();

    expect(await store.readBrand()).toBeNull();
    expect(await store.readIdeas()).toEqual([]);
    const settings = await store.readSettings();
    expect(settings.onboarded).toBe(false);
  });

});
