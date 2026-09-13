'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Language } from '@/lib/schema';

/** Switches the interface language and persists it to the workspace settings. */
export function LanguageSwitcher({ current }: { current: Language }) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>(current);
  const [pending, startTransition] = useTransition();

  async function change(next: Language) {
    const previous = language;
    setLanguage(next);

    const response = await fetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ interfaceLanguage: next }),
    });

    if (!response.ok) {
      setLanguage(previous);
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <select
      aria-label="Dil / Language"
      value={language}
      disabled={pending}
      onChange={(event) => change(event.target.value as Language)}
      className="cursor-pointer h-6 rounded border border-neutral-800 bg-neutral-950 px-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-100 disabled:opacity-50"
    >
      <option value="tr">Türkçe</option>
      <option value="en">English</option>
    </select>
  );
}
