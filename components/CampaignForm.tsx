'use client';

import { useRouter } from 'next/navigation';
import { Busy } from '@/components/Spinner';
import { useState } from 'react';
import { Field, Section, checkClass, checkLabelClass, inputClass, primaryButton, selectClass } from '@/components/fields';
import { t } from '@/lib/i18n';
import { adNetworkLabel, campaignObjectiveLabel } from '@/lib/i18n/labels';
import type {
  AdNetwork,
  BrandProfile,
  Campaign,
  CampaignObjective,
  Language,
} from '@/lib/schema';

const NETWORKS: AdNetwork[] = ['meta', 'google-search', 'tiktok'];
const OBJECTIVES: CampaignObjective[] = [
  'awareness',
  'traffic',
  'leads',
  'sales',
  'app-installs',
];

type Props = {
  brand: BrandProfile | null;
  language: Language;
  onCreated: (campaign: Campaign, discarded: number) => void;
};

export function CampaignForm({ brand, language, onCreated }: Props) {
  const dict = t(language);
  const router = useRouter();

  const [name, setName] = useState('');
  const [objective, setObjective] = useState<CampaignObjective>('traffic');
  const [audienceRef, setAudienceRef] = useState(brand?.audiences[0]?.label ?? '');
  const [networks, setNetworks] = useState<AdNetwork[]>(['meta']);
  const [totalBudget, setTotalBudget] = useState(1000);
  const [currency, setCurrency] = useState('TRY');
  const [periodDays, setPeriodDays] = useState(14);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = name.trim().length > 0 && audienceRef.trim().length > 0 && networks.length > 0;

  async function submit() {
    setBusy(true);
    setError(null);

    const response = await fetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name,
        objective,
        audienceRef,
        networks,
        totalBudget,
        currency,
        periodDays,
        notes,
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? dict.errorGeneric);
      setBusy(false);
      return;
    }

    const result = body as { campaign: Campaign; discarded: number };
    onCreated(result.campaign, result.discarded);
    router.refresh();
    setName('');
    setNotes('');
    setBusy(false);
  }

  return (
    <Section title={dict.adsNewCampaign}>
      <div className="space-y-4 rounded border border-neutral-800 p-4">
        <Field label={dict.adsName}>
          <input
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={dict.adsObjective}>
            <select
              className={selectClass}
              value={objective}
              onChange={(event) => setObjective(event.target.value as CampaignObjective)}
            >
              {OBJECTIVES.map((item) => (
                <option key={item} value={item}>
                  {campaignObjectiveLabel(dict, item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={dict.adsAudience}>
            {brand && brand.audiences.length > 0 ? (
              <select
                className={selectClass}
                value={audienceRef}
                onChange={(event) => setAudienceRef(event.target.value)}
              >
                {brand.audiences.map((audience) => (
                  <option key={audience.label} value={audience.label}>
                    {audience.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                value={audienceRef}
                onChange={(event) => setAudienceRef(event.target.value)}
              />
            )}
          </Field>
        </div>

        <Field label={dict.adsNetworks}>
          <div className="flex flex-wrap gap-4 pt-1">
            {NETWORKS.map((network) => (
              <label key={network} className={checkLabelClass}>
                <input
                  type="checkbox"
                className={checkClass}
                  checked={networks.includes(network)}
                  onChange={(event) =>
                    setNetworks((current) =>
                      event.target.checked
                        ? [...current, network]
                        : current.filter((item) => item !== network),
                    )
                  }
                />
                {adNetworkLabel(dict, network)}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={dict.adsBudget}>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={totalBudget}
              onChange={(event) => setTotalBudget(Number(event.target.value))}
            />
          </Field>
          <Field label={dict.adsCurrency}>
            <input
              className={inputClass}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            />
          </Field>
          <Field label={dict.adsPeriod}>
            <input
              type="number"
              min={1}
              max={365}
              className={inputClass}
              value={periodDays}
              onChange={(event) => setPeriodDays(Number(event.target.value))}
            />
          </Field>
        </div>

        <Field label={dict.adsNotes} hint={dict.adsNotesHint}>
          <textarea
            className={`${inputClass} min-h-20`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <button
          type="button"
          onClick={submit}
          disabled={busy || !ready}
          className={primaryButton}
        >
          {busy ? <Busy label={dict.adsGenerating} /> : dict.adsGenerate}
        </button>

        {error && <p className="text-sm text-amber-400">{error}</p>}
      </div>
    </Section>
  );
}
