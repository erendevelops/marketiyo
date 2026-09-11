'use client';

import { useMemo, useState } from 'react';
import { IdeaCard } from '@/components/IdeaCard';
import { inputClass } from '@/components/fields';
import { t } from '@/lib/i18n';
import type { Idea, IdeaStatus, Language, Platform } from '@/lib/schema';

const PLATFORMS: Platform[] = ['short-video', 'x', 'linkedin', 'instagram-static'];
const STATUSES: IdeaStatus[] = ['new', 'kept', 'rejected', 'expanded', 'scheduled'];

const PLATFORM_LABEL: Record<Platform, string> = {
  'short-video': 'Kisa video',
  x: 'X',
  linkedin: 'LinkedIn',
  'instagram-static': 'Instagram',
};

type Props = {
  initial: Idea[];
  language: Language;
  activePlatforms: Platform[];
};

export function IdeaBoard({ initial, language, activePlatforms }: Props) {
  const dict = t(language);
  const platforms = activePlatforms.length ? activePlatforms : PLATFORMS;

  const [ideas, setIdeas] = useState<Idea[]>(initial);
  const [platform, setPlatform] = useState<Platform>(platforms[0]);
  const [count, setCount] = useState(10);
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'all'>('new');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      ideas
        .filter((idea) => filterPlatform === 'all' || idea.platform === filterPlatform)
        .filter((idea) => filterStatus === 'all' || idea.status === filterStatus)
        .slice()
        .sort((a, b) => b.score - a.score),
    [ideas, filterPlatform, filterStatus],
  );

  async function generate() {
    setBusy(true);
    setMessage(null);

    const response = await fetch('/api/ideas/generate', {
      method: 'POST',
      body: JSON.stringify({ platform, count, angles: [] }),
    });
    const body = await response.json();

    if (!response.ok) {
      setMessage(body.error ?? dict.errorGeneric);
    } else {
      const result = body as { ideas: Idea[]; discarded: number };
      setIdeas((current) => [...current, ...result.ideas]);
      setFilterStatus('new');
      setMessage(
        result.discarded > 0
          ? `${result.ideas.length} + ${result.discarded} ${dict.ideasDiscarded}`
          : `${result.ideas.length}`,
      );
    }
    setBusy(false);
  }

  async function update(id: string, patch: Partial<Idea>) {
    const previous = ideas;
    setIdeas((current) =>
      current.map((idea) => (idea.id === id ? { ...idea, ...patch } : idea)),
    );

    const response = await fetch(`/api/ideas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      setIdeas(previous);
      setMessage(dict.errorGeneric);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">{dict.ideasTitle}</h1>

      <div className="mb-8 flex flex-wrap items-end gap-3 rounded border border-neutral-800 p-4">
        <label className="text-sm">
          <span className="mb-1 block text-neutral-400">{dict.brandPlatforms}</span>
          <select
            className={inputClass}
            value={platform}
            onChange={(event) => setPlatform(event.target.value as Platform)}
          >
            {platforms.map((item) => (
              <option key={item} value={item}>
                {PLATFORM_LABEL[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-400">{dict.ideasCount}</span>
          <input
            type="number"
            min={1}
            max={50}
            className={`${inputClass} w-24`}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>

        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="rounded bg-neutral-100 px-4 py-2 font-medium text-neutral-900 disabled:opacity-50"
        >
          {busy ? dict.ideasGenerating : dict.ideasGenerate}
        </button>

        {message && <p className="text-sm text-neutral-400">{message}</p>}
      </div>

      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <select
          aria-label={dict.brandPlatforms}
          className={`${inputClass} w-auto`}
          value={filterPlatform}
          onChange={(event) => setFilterPlatform(event.target.value as Platform | 'all')}
        >
          <option value="all">{dict.ideasFilterAll}</option>
          {PLATFORMS.map((item) => (
            <option key={item} value={item}>
              {PLATFORM_LABEL[item]}
            </option>
          ))}
        </select>

        <select
          aria-label={dict.ideasTitle}
          className={`${inputClass} w-auto`}
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value as IdeaStatus | 'all')}
        >
          <option value="all">{dict.ideasFilterAll}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="text-neutral-500">{dict.ideasEmpty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} dict={dict} onUpdate={update} />
          ))}
        </div>
      )}
    </main>
  );
}
