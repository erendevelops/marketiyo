import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function sources(dir: string): string[] {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sources(relative);
    return entry.name.endsWith('.tsx') ? [relative] : [];
  });
}

describe('light theme', () => {
  it('flips every colour scale the components use', () => {
    const css = readFileSync(path.join(root, 'app/globals.css'), 'utf8');
    const lightBlock = css.slice(css.indexOf(":root[data-theme='light']"));

    const used = new Set<string>();
    for (const file of [...sources('components'), ...sources('app')]) {
      const text = readFileSync(path.join(root, file), 'utf8');
      for (const match of text.matchAll(/-([a-z]+)-(?:50|[1-9]00|950)\b/g)) used.add(match[1]);
    }

    const scales = [...used].filter((name) =>
      readFileSync(path.join(root, 'node_modules/tailwindcss/theme.css'), 'utf8').includes(
        `--color-${name}-500`,
      ),
    );

    const missing = scales.filter((name) => !lightBlock.includes(`--color-${name}-800`));
    expect(missing).toEqual([]);
  });
});
