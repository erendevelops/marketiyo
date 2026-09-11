'use client';

import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-neutral-100 placeholder:text-neutral-600';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-300">{label}</span>
      {hint && <span className="mb-2 block text-xs text-neutral-500">{hint}</span>}
      {children}
    </label>
  );
}

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-base font-semibold text-neutral-100">{title}</h2>
      {hint && <p className="mb-3 text-sm text-neutral-500">{hint}</p>}
      {!hint && <div className="mb-3" />}
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
            className="rounded border border-neutral-700 px-3 text-sm text-neutral-400 hover:text-neutral-200"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            {removeLabel}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300 hover:text-neutral-100"
        onClick={() => onChange([...values, ''])}
      >
        {addLabel}
      </button>
    </div>
  );
}
