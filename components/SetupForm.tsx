'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import type { Language, ProviderId, RedactedSettings } from '@/lib/schema';

type Props = { initial: RedactedSettings };

export function SetupForm({ initial }: Props) {
  const [providerId, setProviderId] = useState<ProviderId>(initial.providerId);
  const [language, setLanguage] = useState<Language>(initial.interfaceLanguage);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const dict = t(language);

  async function save() {
    setBusy(true);
    setStatus(null);

    const patch: Record<string, unknown> = { providerId, interfaceLanguage: language, onboarded: true };
    if (geminiApiKey) patch.geminiApiKey = geminiApiKey;

    const saved = await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(patch) });
    if (!saved.ok) {
      setStatus({ ok: false, text: dict.errorGeneric });
      setBusy(false);
      return;
    }

    const checked = await fetch('/api/provider/status');
    const report = (await checked.json()) as { available: boolean; detail: string };
    setStatus({
      ok: report.available,
      text: `${report.available ? dict.setupAvailable : dict.setupUnavailable}: ${report.detail}`,
    });
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{dict.setupTitle}</h1>
        <select
          aria-label={dict.brandOutputLanguage}
          className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
        >
          <option value="tr">Turkce</option>
          <option value="en">English</option>
        </select>
      </div>

      <fieldset className="mb-6 space-y-4">
        <legend className="mb-2 text-sm text-neutral-400">{dict.setupEngine}</legend>

        <label className="block rounded border border-neutral-800 p-4">
          <span className="flex items-center gap-2 font-medium">
            <input
              type="radio"
              name="engine"
              checked={providerId === 'claude-code'}
              onChange={() => setProviderId('claude-code')}
            />
            {dict.setupClaudeCode}
          </span>
          <span className="mt-1 block pl-6 text-sm text-neutral-400">
            {dict.setupClaudeCodeHint}
          </span>
        </label>

        <label className="block rounded border border-neutral-800 p-4">
          <span className="flex items-center gap-2 font-medium">
            <input
              type="radio"
              name="engine"
              checked={providerId === 'gemini'}
              onChange={() => setProviderId('gemini')}
            />
            {dict.setupGemini}
          </span>
          <span className="mt-1 block pl-6 text-sm text-neutral-400">{dict.setupGeminiHint}</span>

          {providerId === 'gemini' && (
            <input
              type="password"
              aria-label={dict.setupGemini}
              className="mt-3 w-full rounded border border-neutral-700 bg-neutral-900 p-2"
              placeholder={initial.hasGeminiKey ? '********' : 'AIza...'}
              value={geminiApiKey}
              onChange={(event) => setGeminiApiKey(event.target.value)}
            />
          )}
        </label>
      </fieldset>

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded bg-neutral-100 px-4 py-2 font-medium text-neutral-900 disabled:opacity-50"
      >
        {dict.setupSave}
      </button>

      {status && (
        <p className={`mt-4 text-sm ${status.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
          {status.text}
        </p>
      )}
    </main>
  );
}
