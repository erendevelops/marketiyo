'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Field, inputClass } from '@/components/fields';
import { t } from '@/lib/i18n';
import { campaignEndDate } from '@/lib/calendar/flights';
import type { Campaign, Language } from '@/lib/schema';

/** Setting a start date is what puts a campaign on the calendar. */
export function CampaignSchedule({
  campaign,
  language,
}: {
  campaign: Campaign;
  language: Language;
}) {
  const dict = t(language);
  const router = useRouter();

  const [startDate, setStartDate] = useState(campaign.startDate ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const preview = startDate
    ? campaignEndDate({ ...campaign, startDate })
    : null;

  async function save() {
    setBusy(true);
    setMessage(null);

    const response = await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ startDate: startDate || null }),
    });
    const body = await response.json();

    setMessage(
      response.ok
        ? { ok: true, text: dict.brandSaved }
        : { ok: false, text: body.error ?? dict.errorGeneric },
    );
    setBusy(false);
    if (response.ok) router.refresh();
  }

  return (
    <section className="mb-8 rounded border border-neutral-800 p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-52">
          <Field label={dict.adsStartDate} hint={dict.adsStartDateHint}>
            <input
              type="date"
              className={inputClass}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="mb-0.5 rounded border border-neutral-700 px-4 py-2 text-sm disabled:opacity-40"
        >
          {dict.adsSaveDate}
        </button>

        <p className="pb-2 text-sm text-neutral-500">
          {preview ? `${startDate} → ${preview}` : dict.adsNoStartDate}
        </p>
      </div>

      {message && (
        <p className={`mt-3 text-sm ${message.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
