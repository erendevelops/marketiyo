'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Field, inputClass, primaryButton, secondaryButton, subtleButton } from '@/components/fields';
import { t } from '@/lib/i18n';
import { funnelStageLabel, searchIntentLabel } from '@/lib/i18n/labels';
import type { Article, ArticleStatus, Language } from '@/lib/schema';

const STATUSES: ArticleStatus[] = ['new', 'kept', 'rejected', 'drafted'];

const STATUS_STYLE: Record<ArticleStatus, string> = {
  new: 'border-neutral-800',
  kept: 'border-emerald-800',
  rejected: 'border-neutral-900 opacity-50',
  drafted: 'border-sky-800',
};

type Props = { initial: Article[]; language: Language };

export function ArticleBoard({ initial, language }: Props) {
  const dict = t(language);

  const [articles, setArticles] = useState<Article[]>(initial);
  const [count, setCount] = useState(8);
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | 'all'>('new');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const statusLabel: Record<ArticleStatus, string> = {
    new: dict.statusNew,
    kept: dict.statusKept,
    rejected: dict.statusRejected,
    drafted: dict.statusExpanded,
  };

  const visible = useMemo(
    () => articles.filter((article) => filterStatus === 'all' || article.status === filterStatus),
    [articles, filterStatus],
  );

  async function generate() {
    setBusy(true);
    setMessage(null);

    const response = await fetch('/api/articles/generate', {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
    const body = await response.json();

    if (!response.ok) {
      setMessage(body.error ?? dict.errorGeneric);
    } else {
      const result = body as { articles: Article[]; discarded: number };
      setArticles((current) => [...current, ...result.articles]);
      setFilterStatus('new');
      setMessage(
        result.discarded > 0
          ? `${result.articles.length} ${dict.seoGenerated}, ${result.discarded} ${dict.seoDiscarded}`
          : `${result.articles.length} ${dict.seoGenerated}`,
      );
    }
    setBusy(false);
  }

  async function update(id: string, status: ArticleStatus) {
    const previous = articles;
    setArticles((current) =>
      current.map((article) => (article.id === id ? { ...article, status } : article)),
    );

    const response = await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setArticles(previous);
      setMessage(dict.errorGeneric);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">{dict.seoTitle}</h1>
      <p className="mb-8 text-sm text-neutral-500">{dict.seoIntro}</p>

      <section className="mb-8 rounded border border-neutral-800 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={1}
            max={25}
            aria-label={dict.seoCount}
            className={`${inputClass} w-20 text-center`}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
          <span className="text-sm text-neutral-300">{dict.seoCountSuffix}</span>

          <button type="button" onClick={generate} disabled={busy} className={primaryButton}>
            {busy ? dict.seoGenerating : dict.seoGenerate}
          </button>
        </div>

        <p className="mt-3 text-xs text-neutral-600">
          {message ?? dict.seoRepeatNote}
        </p>
      </section>

      <div className="mb-6 w-44">
        <Field label={dict.ideasFilterStatus}>
          <select
            className={inputClass}
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as ArticleStatus | 'all')}
          >
            <option value="all">{dict.ideasFilterAll}</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {visible.length === 0 ? (
        <p className="text-neutral-500">{dict.seoEmpty}</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((article) => (
            <li key={article.id} className={`rounded border p-4 ${STATUS_STYLE[article.status]}`}>
              <h2 className="mb-2 font-medium leading-snug">{article.title}</h2>

              <p className="mb-3 text-sm text-neutral-400">{article.angle}</p>

              <div className="mb-3 flex flex-wrap gap-2 text-xs text-neutral-500">
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

              <details className="mb-3">
                <summary className="cursor-pointer text-xs text-neutral-500">
                  {dict.seoOutline}
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-400">
                  {article.outlinePoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </details>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => update(article.id, 'kept')}
                >
                  {dict.seoKeep}
                </button>
                <button
                  type="button"
                  className={subtleButton}
                  onClick={() => update(article.id, 'rejected')}
                >
                  {dict.seoReject}
                </button>
                <Link
                  href={`/seo/${article.id}`}
                  className={secondaryButton}
                >
                  {dict.seoOpen}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
