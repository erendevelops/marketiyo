'use client';

import { useState } from 'react';
import type { Theme } from '@/lib/schema';

/**
 * Flips the theme on the page at once, then saves it. The server renders the
 * saved theme on the next load, so there is no flash of the wrong colours.
 */
export function ThemeSwitcher({
  current,
  labels,
}: {
  current: Theme;
  labels: { light: string; dark: string; toLight: string; toDark: string };
}) {
  const [theme, setTheme] = useState<Theme>(current);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  async function toggle() {
    const previous = theme;
    setTheme(next);
    document.documentElement.dataset.theme = next;

    const response = await fetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ theme: next }),
    }).catch(() => null);

    if (!response?.ok) {
      setTheme(previous);
      document.documentElement.dataset.theme = previous;
    }
  }

  const label = next === 'light' ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="inline-flex h-6 cursor-pointer items-center gap-1.5 rounded border border-neutral-800 px-2 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-100"
    >
      <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3 fill-current">
        {theme === 'dark' ? (
          <path d="M6 1.5a6.5 6.5 0 1 0 8.5 8.5A5.5 5.5 0 0 1 6 1.5Z" />
        ) : (
          <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-3.5.9 2H7.1l.9-2Zm0 15-.9-2h1.8l-.9 2ZM.5 8l2-.9v1.8L.5 8Zm15 0-2 .9V7.1l2 .9ZM2.7 2.7l2.1.7-1.3 1.3-.8-2Zm10.6 10.6-2.1-.7 1.3-1.3.8 2Zm0-10.6-.7 2.1-1.3-1.3 2-.8ZM2.7 13.3l.7-2.1 1.3 1.3-2 .8Z" />
        )}
      </svg>
      {theme === 'dark' ? labels.dark : labels.light}
    </button>
  );
}
