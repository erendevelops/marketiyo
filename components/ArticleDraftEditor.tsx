'use client';

import Link from 'next/link';
import { Busy } from '@/components/Spinner';
import { useState } from 'react';
import { inputClass, primaryButton, secondaryButton } from '@/components/fields';
import { t } from '@/lib/i18n';
import { funnelStageLabel, searchIntentLabel } from '@/lib/i18n/labels';
import type { Article, Language } from '@/lib/schema';

type Props = {
  article: Article;
  initialMarkdown: string | null;
  language: Language;
};

export function ArticleDraftEditor({ article, initialMarkdown, language }: Props) {
  const dict = t(language);
  const [markdown, setMarkdown] = useState(initialMarkdown ?? '');
  const [running, setRunning] = useState<'generate' | 'save' | null>(null);
  const busy = running !== null;
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function generate() {
    setRunning('generate');
    setMessage(null);
    const response = await fetch(`/api/articles/${article.id}/draft`, { method: 'POST' });
    const body = await response.json();
    if (!response.ok) setMessage({ ok: false, text: body.error ?? dict.errorGeneric });
    else setMarkdown(body.markdown as string);
    setRunning(null);
  }

  async function save() {
    setRunning('save');
    setMessage(null);
    const response = await fetch(`/api/articles/${article.id}/draft`, {
      method: 'PUT',
      body: JSON.stringify({ markdown }),
    });
    const body = await response.json();
    setMessage(
      response.ok
        ? { ok: true, text: dict.brandSaved }
        : { ok: false, text: body.error ?? dict.errorGeneric },
    );
    setRunning(null);
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/seo" className="mb-6 inline-block text-sm text-neutral-400 transition-colors hover:text-neutral-100">
        {dict.seoBackToList}
      </Link>

      <h1 className="mb-2 text-2xl font-semibold leading-snug">{article.title}</h1>

      <div className="mb-6 flex flex-wrap gap-2 text-xs text-neutral-500">
        <span className="rounded bg-neutral-900 px-2 py-1">
          {searchIntentLabel(dict, article.searchIntent)}
        </span>
        <span className="rounded bg-neutral-900 px-2 py-1">
          {funnelStageLabel(dict, article.funnelStage)}
        </span>
        <span className="rounded bg-neutral-900 px-2 py-1">
          {dict.seoPrimaryKeyword}: {article.primaryKeyword}
        </span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className={primaryButton}
        >
          {running === 'generate' ? (
            <Busy label={dict.seoGenerating} />
          ) : markdown.length ? (
            dict.seoDraftRegenerate
          ) : (
            dict.seoDraftGenerate
          )}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy || markdown.length === 0}
          className={`${secondaryButton} px-4 py-2`}
        >
          {running === 'save' ? <Busy label={dict.brandSaving} /> : dict.seoDraftSave}
        </button>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
          {message.text}
        </p>
      )}

      {markdown.length === 0 ? (
        <p className="text-neutral-500">{dict.seoDraftEmpty}</p>
      ) : (
        <textarea
          aria-label={dict.seoDraftTitle}
          className={`${inputClass} min-h-[32rem] font-mono text-sm`}
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
        />
      )}
    </main>
  );
}
