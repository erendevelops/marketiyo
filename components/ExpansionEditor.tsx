'use client';

import { useState } from 'react';
import Link from 'next/link';
import { inputClass } from '@/components/fields';
import { t } from '@/lib/i18n';
import type { Idea, Language } from '@/lib/schema';

type Props = {
  idea: Idea;
  initialMarkdown: string | null;
  language: Language;
};

export function ExpansionEditor({ idea, initialMarkdown, language }: Props) {
  const dict = t(language);
  const [markdown, setMarkdown] = useState(initialMarkdown ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function generate() {
    setBusy(true);
    setMessage(null);
    const response = await fetch(`/api/ideas/${idea.id}/expansion`, { method: 'POST' });
    const body = await response.json();
    if (!response.ok) setMessage({ ok: false, text: body.error ?? dict.errorGeneric });
    else setMarkdown(body.markdown as string);
    setBusy(false);
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    const response = await fetch(`/api/ideas/${idea.id}/expansion`, {
      method: 'PUT',
      body: JSON.stringify({ markdown }),
    });
    const body = await response.json();
    setMessage(
      response.ok
        ? { ok: true, text: dict.brandSaved }
        : { ok: false, text: body.error ?? dict.errorGeneric },
    );
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/ideas" className="mb-6 inline-block text-sm text-neutral-400">
        {dict.navIdeas}
      </Link>

      <h1 className="mb-2 text-2xl font-semibold leading-snug">{idea.hook}</h1>
      <p className="mb-6 text-neutral-400">{idea.premise}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="rounded bg-neutral-100 px-4 py-2 font-medium text-neutral-900 disabled:opacity-50"
        >
          {busy ? dict.ideasGenerating : dict.expansionGenerate}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy || markdown.length === 0}
          className="rounded border border-neutral-700 px-4 py-2 disabled:opacity-40"
        >
          {dict.expansionSave}
        </button>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
          {message.text}
        </p>
      )}

      {markdown.length === 0 ? (
        <p className="text-neutral-500">{dict.expansionEmpty}</p>
      ) : (
        <textarea
          aria-label={dict.expansionTitle}
          className={`${inputClass} min-h-[28rem] font-mono text-sm`}
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
        />
      )}
    </main>
  );
}
