'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Busy } from '@/components/Spinner';
import { checkClass, inputClass, primaryButton, selectClass } from '@/components/fields';
import { t } from '@/lib/i18n';
import {
  defaultGeminiModel,
  geminiModels,
  type ProviderId,
  type RedactedSettings,
} from '@/lib/schema';

type Props = { initial: RedactedSettings; projectDir?: string };

const codeClass = 'rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-xs text-neutral-200';

function EngineOption({
  selected,
  onSelect,
  title,
  hint,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded border transition-colors ${
        selected ? 'border-neutral-500' : 'border-neutral-800 hover:border-neutral-600'
      }`}
    >
      <label className="flex cursor-pointer items-start gap-2 p-3">
        <input
          type="radio"
          className={`${checkClass} mt-1`}
          name="engine"
          checked={selected}
          onChange={onSelect}
        />
        <span>
          <span className="block font-medium text-neutral-100">{title}</span>
          <span className="block text-neutral-500">{hint}</span>
        </span>
      </label>
      {selected && children && (
        <div className="space-y-3 border-t border-neutral-800 px-3 py-3 pl-8">{children}</div>
      )}
    </div>
  );
}

export function SetupForm({ initial, projectDir: rawProjectDir }: Props) {
  // Quoted when it has spaces, so the command can be pasted as is.
  const projectDir =
    rawProjectDir && rawProjectDir.includes(' ') ? `"${rawProjectDir}"` : rawProjectDir;
  const [providerId, setProviderId] = useState<ProviderId>(initial.providerId);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState(initial.geminiModel);
  const [claudeBinary, setClaudeBinary] = useState(initial.claudeBinary);
  // Keep a model saved by hand selectable even if it is not in the list.
  const modelOptions: string[] = (geminiModels as readonly string[]).includes(initial.geminiModel)
    ? [...geminiModels]
    : [...geminiModels, initial.geminiModel];
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const dict = t(initial.interfaceLanguage);

  async function save() {
    setBusy(true);
    setStatus(null);
    setVerified(false);

    // Save the engine choice first, without marking setup complete.
    const patch: Record<string, unknown> = { providerId };
    if (providerId === 'gemini') {
      patch.geminiModel = geminiModel;
      if (geminiApiKey) patch.geminiApiKey = geminiApiKey;
    }
    if (providerId === 'claude-code') patch.claudeBinary = claudeBinary.trim() || 'claude';

    const saved = await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(patch) });
    if (!saved.ok) {
      setStatus({ ok: false, text: dict.errorGeneric });
      setBusy(false);
      return;
    }

    const checked = await fetch('/api/provider/status', { method: 'POST' });
    const report = (await checked.json()) as { available: boolean; detail: string };

    // The step only counts as done when the connection actually works. A
    // failing engine also clears an earlier completion, so a broken setup
    // cannot keep the working areas open.
    await fetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ onboarded: report.available }),
    });

    setStatus({
      ok: report.available,
      text: report.available
        ? `${dict.setupAvailable}: ${report.detail}`
        : `${dict.setupUnavailable}. ${report.detail}`,
    });
    setVerified(report.available);
    setBusy(false);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="max-w-2xl">
        <h1 className="mb-1 text-lg font-semibold">{dict.setupTitle}</h1>
        <p className="mb-6 border-b border-neutral-800 pb-4 text-neutral-500">{dict.setupEngine}</p>

        <fieldset className="mb-5 space-y-2">
          <legend className="sr-only">{dict.setupEngine}</legend>

          <EngineOption
            selected={providerId === 'claude-code'}
            onSelect={() => setProviderId('claude-code')}
            title={dict.setupClaudeCode}
            hint={dict.setupClaudeCodeHint}
          >
            <ol className="list-decimal space-y-2 pl-4 text-neutral-400">
              <li>
                {dict.setupClaudeStepInstall}
                <span className="mt-1 block space-y-1">
                  <span className="block">
                    Windows: <code className={codeClass}>irm https://claude.ai/install.ps1 | iex</code>
                  </span>
                  <span className="block">
                    macOS / Linux:{' '}
                    <code className={codeClass}>curl -fsSL https://claude.ai/install.sh | bash</code>
                  </span>
                </span>
              </li>
              <li>
                {dict.setupClaudeStepLogin} <code className={codeClass}>claude</code>
              </li>
              <li>
                {dict.setupClaudeStepRestart}
                <span className="mt-1 block text-xs text-neutral-500">{dict.setupClaudeRestartWhy}</span>
                <ol className="mt-2 list-[lower-alpha] space-y-1.5 pl-4">
                  <li>{dict.setupClaudeRestartStop}</li>
                  <li>{dict.setupClaudeRestartOpen}</li>
                  <li>
                    {dict.setupClaudeRestartCd}{' '}
                    <code className={codeClass}>cd {projectDir ?? 'marketiyo'}</code>
                  </li>
                  <li>
                    {dict.setupClaudeRestartRun} <code className={codeClass}>npm run dev</code>
                  </li>
                  <li>{dict.setupClaudeRestartReload}</li>
                </ol>
              </li>
            </ol>

            <label className="block">
              <span className="mb-1 block text-neutral-300">{dict.setupClaudeBinary}</span>
              <input
                className={`${inputClass} font-mono`}
                value={claudeBinary}
                spellCheck={false}
                onChange={(event) => setClaudeBinary(event.target.value)}
              />
              <span className="mt-1 block text-xs text-neutral-500">{dict.setupClaudeBinaryHint}</span>
            </label>

            <p className="text-xs text-neutral-500">{dict.setupClaudeCheckNote}</p>
          </EngineOption>

          <EngineOption
            selected={providerId === 'gemini'}
            onSelect={() => setProviderId('gemini')}
            title={dict.setupGemini}
            hint={dict.setupGeminiHint}
          >
            <label className="block">
              <span className="mb-1 block text-neutral-300">{dict.setupGeminiKey}</span>
              <input
                type="password"
                className={`${inputClass} font-mono`}
                placeholder={initial.hasGeminiKey ? '********' : 'AIza...'}
                value={geminiApiKey}
                onChange={(event) => setGeminiApiKey(event.target.value)}
              />
              <span className="mt-1 block text-xs text-neutral-500">{dict.setupGeminiKeyHint}</span>
            </label>

            <label className="block">
              <span className="mb-1 block text-neutral-300">{dict.setupGeminiModel}</span>
              <select
                className={`${selectClass} font-mono`}
                value={geminiModel}
                onChange={(event) => setGeminiModel(event.target.value)}
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model === defaultGeminiModel
                      ? `${model} (${dict.setupGeminiModelRecommended})`
                      : model}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-neutral-500">{dict.setupGeminiModelHint}</span>
            </label>
          </EngineOption>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={busy} className={primaryButton}>
            {busy ? <Busy label={dict.setupChecking} showElapsed /> : dict.setupSave}
          </button>
          {verified && (
            <Link href="/brand" className={primaryButton}>
              {dict.setupNextBrand}
            </Link>
          )}
        </div>

        {status && (
          <p
            role="status"
            className={`mt-3 rounded border px-3 py-2 ${
              status.ok
                ? 'border-emerald-900 text-emerald-400'
                : 'border-amber-900 text-amber-400'
            }`}
          >
            {status.text}
          </p>
        )}
      </div>
    </main>
  );
}
