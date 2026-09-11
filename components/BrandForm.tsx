'use client';

import { useState } from 'react';
import { Field, Section, StringList, inputClass } from '@/components/fields';
import { t } from '@/lib/i18n';
import type { BrandProfile, Language, Platform } from '@/lib/schema';

const PLATFORMS: Platform[] = ['short-video', 'x', 'linkedin', 'instagram-static'];

const PLATFORM_LABEL: Record<Platform, string> = {
  'short-video': 'Kisa video',
  x: 'X',
  linkedin: 'LinkedIn',
  'instagram-static': 'Instagram',
};

const AUDIENCE_KEYS = ['label', 'pain', 'desire', 'whereTheyHangOut'] as const;

function emptyProfile(language: Language): BrandProfile {
  return {
    productName: '',
    oneLiner: '',
    category: '',
    audiences: [{ label: '', pain: '', desire: '', whereTheyHangOut: '' }],
    offers: [],
    voice: { do: [], dont: [], referenceExamples: [] },
    proof: [],
    competitors: [],
    bannedClaims: [],
    outputLanguage: language,
    platforms: ['short-video'],
    updatedAt: new Date().toISOString(),
  };
}

type Props = { initial: BrandProfile | null; language: Language };

export function BrandForm({ initial, language }: Props) {
  const dict = t(language);
  const [profile, setProfile] = useState<BrandProfile>(initial ?? emptyProfile(language));
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function patch(next: Partial<BrandProfile>) {
    setProfile((current) => ({ ...current, ...next }));
  }

  async function draft() {
    setBusy(true);
    setMessage(null);
    const response = await fetch('/api/brand/draft', {
      method: 'POST',
      body: JSON.stringify({ text: description, language: profile.outputLanguage }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage({ ok: false, text: body.error ?? dict.errorGeneric });
    } else {
      setProfile({ ...(body as BrandProfile), updatedAt: new Date().toISOString() });
    }
    setBusy(false);
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    const response = await fetch('/api/brand', { method: 'PUT', body: JSON.stringify(profile) });
    const body = await response.json();
    setMessage(
      response.ok
        ? { ok: true, text: dict.brandSaved }
        : { ok: false, text: body.error ?? dict.errorGeneric },
    );
    setBusy(false);
  }

  const audienceLabels: Record<(typeof AUDIENCE_KEYS)[number], string> = {
    label: dict.brandAudienceLabel,
    pain: dict.brandAudiencePain,
    desire: dict.brandAudienceDesire,
    whereTheyHangOut: dict.brandAudienceWhere,
  };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">{dict.brandTitle}</h1>

      <Section title={dict.brandDraftLabel}>
        <p className="mb-2 text-sm text-neutral-400">{dict.brandDraftHint}</p>
        <textarea
          className={`${inputClass} min-h-28`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button
          type="button"
          disabled={busy || description.trim().length < 20}
          onClick={draft}
          className="mt-2 rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-200 disabled:opacity-40"
        >
          {dict.brandDraftAction}
        </button>
      </Section>

      <Section title={dict.brandTitle}>
        <div className="space-y-4">
          <Field label={dict.brandProductName}>
            <input
              className={inputClass}
              value={profile.productName}
              onChange={(event) => patch({ productName: event.target.value })}
            />
          </Field>
          <Field label={dict.brandOneLiner}>
            <input
              className={inputClass}
              value={profile.oneLiner}
              onChange={(event) => patch({ oneLiner: event.target.value })}
            />
          </Field>
          <Field label={dict.brandCategory}>
            <input
              className={inputClass}
              value={profile.category}
              onChange={(event) => patch({ category: event.target.value })}
            />
          </Field>
        </div>
      </Section>

      <Section title={dict.brandAudiences}>
        <div className="space-y-4">
          {profile.audiences.map((audience, index) => (
            <div
              key={index}
              className="grid gap-2 rounded border border-neutral-800 p-3 sm:grid-cols-2"
            >
              {AUDIENCE_KEYS.map((key) => (
                <Field key={key} label={audienceLabels[key]}>
                  <input
                    className={inputClass}
                    value={audience[key]}
                    onChange={(event) => {
                      const next = [...profile.audiences];
                      next[index] = { ...next[index], [key]: event.target.value };
                      patch({ audiences: next });
                    }}
                  />
                </Field>
              ))}
              {profile.audiences.length > 1 && (
                <button
                  type="button"
                  className="justify-self-start rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-400"
                  onClick={() =>
                    patch({ audiences: profile.audiences.filter((_, i) => i !== index) })
                  }
                >
                  {dict.removeRow}
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300"
            onClick={() =>
              patch({
                audiences: [
                  ...profile.audiences,
                  { label: '', pain: '', desire: '', whereTheyHangOut: '' },
                ],
              })
            }
          >
            {dict.addRow}
          </button>
        </div>
      </Section>

      <Section title={dict.brandVoiceDo}>
        <StringList
          values={profile.voice.do}
          onChange={(next) => patch({ voice: { ...profile.voice, do: next } })}
          addLabel={dict.addRow}
          removeLabel={dict.removeRow}
        />
      </Section>

      <Section title={dict.brandVoiceDont}>
        <StringList
          values={profile.voice.dont}
          onChange={(next) => patch({ voice: { ...profile.voice, dont: next } })}
          addLabel={dict.addRow}
          removeLabel={dict.removeRow}
        />
      </Section>

      <Section title={dict.brandProof}>
        <StringList
          values={profile.proof}
          onChange={(next) => patch({ proof: next })}
          addLabel={dict.addRow}
          removeLabel={dict.removeRow}
        />
      </Section>

      <Section title={dict.brandBannedClaims}>
        <StringList
          values={profile.bannedClaims}
          onChange={(next) => patch({ bannedClaims: next })}
          addLabel={dict.addRow}
          removeLabel={dict.removeRow}
        />
      </Section>

      <Section title={dict.brandPlatforms}>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map((platform) => (
            <label key={platform} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={profile.platforms.includes(platform)}
                onChange={(event) =>
                  patch({
                    platforms: event.target.checked
                      ? [...profile.platforms, platform]
                      : profile.platforms.filter((p) => p !== platform),
                  })
                }
              />
              {PLATFORM_LABEL[platform]}
            </label>
          ))}
        </div>
      </Section>

      <Section title={dict.brandOutputLanguage}>
        <select
          className={inputClass}
          value={profile.outputLanguage}
          onChange={(event) => patch({ outputLanguage: event.target.value as Language })}
        >
          <option value="tr">Turkce</option>
          <option value="en">English</option>
        </select>
      </Section>

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded bg-neutral-100 px-4 py-2 font-medium text-neutral-900 disabled:opacity-50"
      >
        {dict.brandSave}
      </button>

      {message && (
        <p className={`mt-4 text-sm ${message.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
          {message.text}
        </p>
      )}
    </main>
  );
}
