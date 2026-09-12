'use client';

import type { ReactNode } from 'react';

/** One set of button styles, so hover and disabled behave the same everywhere. */
export const primaryButton =
  'rounded bg-neutral-100 px-4 py-2 font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-50 disabled:hover:bg-neutral-100';

export const secondaryButton =
  'rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-200 transition-colors hover:border-neutral-500 hover:bg-neutral-900 hover:text-neutral-50 disabled:opacity-40 disabled:hover:border-neutral-700 disabled:hover:bg-transparent';

export const subtleButton =
  'rounded border border-neutral-800 px-3 py-1 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100 disabled:opacity-40';

export const tinyButton =
  'rounded border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-neutral-100';

export const linkButton =
  'text-xs text-neutral-500 transition-colors hover:text-neutral-100';

export const numberInputClass =
  'w-14 rounded border border-neutral-700 bg-neutral-900 px-1.5 py-1 text-center text-sm text-neutral-100';

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
            className={secondaryButton}
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            {removeLabel}
          </button>
        </div>
      ))}
      <button
        type="button"
        className={secondaryButton}
        onClick={() => onChange([...values, ''])}
      >
        {addLabel}
      </button>
    </div>
  );
}
