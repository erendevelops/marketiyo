'use client';

import type { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-neutral-100 placeholder:text-neutral-600';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Editable list of plain strings, used for proof, banned claims and voice rules. */
export function StringList({
  values,
  onChange,
  addLabel,
  removeLabel,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
  removeLabel: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            className={inputClass}
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="rounded border border-neutral-700 px-3 text-sm text-neutral-400"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            {removeLabel}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300"
        onClick={() => onChange([...values, ''])}
      >
        {addLabel}
      </button>
    </div>
  );
}
