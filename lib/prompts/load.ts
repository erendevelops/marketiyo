import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Language, Platform } from '@/lib/schema';

const root = path.join(process.cwd(), 'lib', 'prompts');

function readOrNull(filePath: string): string | null {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/** Turkish is the source of truth. English falls back to Turkish with a warning. */
function readLocalised(kind: 'templates' | 'platforms', name: string, language: Language): string {
  const requested = readOrNull(path.join(root, kind, language, `${name}.md`));
  if (requested !== null) return requested;

  if (language === 'en') {
    const fallback = readOrNull(path.join(root, kind, 'tr', `${name}.md`));
    if (fallback !== null) {
      console.warn(`[marketiyo] Missing English ${kind}/${name}, falling back to Turkish.`);
      return fallback;
    }
  }

  throw new Error(`Missing prompt file: ${kind}/${language}/${name}.md`);
}

export function loadTemplate(name: string, language: Language): string {
  return readLocalised('templates', name, language);
}

export function loadPlatformCard(platform: Platform, language: Language): string {
  return readLocalised('platforms', platform, language);
}
