import type { Language } from '@/lib/schema';
import { tr, type Dictionary } from './tr';
import { en } from './en';

export function t(language: Language): Dictionary {
  return language === 'en' ? en : tr;
}

export type { Dictionary };
