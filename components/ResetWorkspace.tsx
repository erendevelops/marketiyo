'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Busy } from '@/components/Spinner';
import { subtleButton } from '@/components/fields';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/schema';
import { RESET_CONFIRMATION } from '@/lib/workspace/reset';

const dangerButton =
  'cursor-pointer rounded border border-red-900 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:border-red-700 hover:bg-red-900/60 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Permanent and unrecoverable, so it takes two deliberate steps: open the
 * panel, read what goes, then confirm. Nothing is deleted on the first click.
 */
export function ResetWorkspace({ language }: { language: Language }) {
  const dict = t(language);
  const router = useRouter();

  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reset() {
    setBusy(true);
    setError(null);

    const response = await fetch('/api/workspace/reset', {
      method: 'POST',
      body: JSON.stringify({ confirm: RESET_CONFIRMATION }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? dict.errorGeneric);
      setBusy(false);
      return;
    }

    router.replace('/setup');
    router.refresh();
  }

  return (
    <section className="mt-16 rounded border border-red-950 p-5">
      <h2 className="mb-1 text-sm font-semibold text-red-300">{dict.resetTitle}</h2>
      <p className="mb-4 text-sm text-neutral-500">{dict.resetIntro}</p>

      {!armed ? (
        <button type="button" className={dangerButton} onClick={() => setArmed(true)}>
          {dict.resetOpen}
        </button>
      ) : (
        <div>
          <p className="mb-2 text-sm text-neutral-300">{dict.resetWillDelete}</p>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-neutral-400">
            <li>{dict.resetItemBrand}</li>
            <li>{dict.resetItemContent}</li>
            <li>{dict.resetItemPlans}</li>
            <li>{dict.resetItemSettings}</li>
          </ul>
          <p className="mb-4 text-sm font-medium text-red-300">{dict.resetIrreversible}</p>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={dangerButton} disabled={busy} onClick={reset}>
              {busy ? <Busy label={dict.resetRunning} /> : dict.resetConfirm}
            </button>
            <button
              type="button"
              className={subtleButton}
              disabled={busy}
              onClick={() => setArmed(false)}
            >
              {dict.calendarCancel}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-amber-400">{error}</p>}
    </section>
  );
}
