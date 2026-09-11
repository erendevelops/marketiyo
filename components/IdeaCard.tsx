'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n';
import type { Idea, RejectionReason } from '@/lib/schema';

const REJECTION_REASONS: RejectionReason[] = [
  'off-brand',
  'too-generic',
  'already-done',
  'wrong-audience',
  'weak-hook',
  'other',
];

const REASON_LABEL: Record<RejectionReason, string> = {
  'off-brand': 'Marka disi',
  'too-generic': 'Cok jenerik',
  'already-done': 'Zaten yapildi',
  'wrong-audience': 'Yanlis kitle',
  'weak-hook': 'Zayif kanca',
  other: 'Diger',
};

const STATUS_STYLE: Record<Idea['status'], string> = {
  new: 'border-neutral-800',
  kept: 'border-emerald-800',
  rejected: 'border-neutral-900 opacity-50',
  expanded: 'border-sky-800',
  scheduled: 'border-violet-800',
};

type Props = {
  idea: Idea;
  dict: Dictionary;
  onUpdate: (id: string, patch: Partial<Idea>) => void;
};

export function IdeaCard({ idea, dict, onUpdate }: Props) {
  const [asking, setAsking] = useState(false);

  return (
    <article className={`rounded border p-4 ${STATUS_STYLE[idea.status]}`}>
      <h3 className="mb-2 font-medium leading-snug">{idea.hook}</h3>
      <p className="mb-3 text-sm text-neutral-400">{idea.premise}</p>

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-neutral-500">
        <span className="rounded bg-neutral-900 px-2 py-1">{idea.format}</span>
        <span className="rounded bg-neutral-900 px-2 py-1">{idea.angle}</span>
        <span className="rounded bg-neutral-900 px-2 py-1">{idea.audienceRef}</span>
      </div>

      {asking ? (
        <div className="flex flex-wrap gap-2">
          {REJECTION_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300"
              onClick={() => {
                setAsking(false);
                onUpdate(idea.id, { status: 'rejected', rejectionReason: reason });
              }}
            >
              {REASON_LABEL[reason]}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-neutral-700 px-3 py-1 text-sm"
            onClick={() => onUpdate(idea.id, { status: 'kept' })}
          >
            {dict.ideasKeep}
          </button>
          <button
            type="button"
            className="rounded border border-neutral-800 px-3 py-1 text-sm text-neutral-400"
            onClick={() => setAsking(true)}
          >
            {dict.ideasReject}
          </button>
          <Link
            href={`/ideas/${idea.id}`}
            className="rounded border border-neutral-700 px-3 py-1 text-sm"
          >
            {dict.ideasExpand}
          </Link>
        </div>
      )}
    </article>
  );
}
