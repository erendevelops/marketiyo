'use client';

import Link from 'next/link';
import { linkButton } from '@/components/fields';
import { useState } from 'react';
import { CampaignSchedule } from '@/components/CampaignSchedule';
import { t } from '@/lib/i18n';
import { adNetworkLabel, campaignObjectiveLabel } from '@/lib/i18n/labels';
import type { AdSet, Campaign, Language } from '@/lib/schema';

function CopyList({
  title,
  values,
  copyLabel,
  copiedLabel,
}: {
  title: string;
  values: string[];
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState<number | null>(null);

  async function copy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">{title}</p>
      <ul className="space-y-1">
        {values.map((value, index) => (
          <li
            key={index}
            className="group flex items-start justify-between gap-3 rounded bg-neutral-900 px-3 py-2 text-sm"
          >
            <span>{value}</span>
            <button
              type="button"
              onClick={() => copy(value, index)}
              className={`shrink-0 ${linkButton}`}
            >
              {copied === index ? copiedLabel : copyLabel}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdSetCard({
  set,
  campaign,
  language,
}: {
  set: AdSet;
  campaign: Campaign;
  language: Language;
}) {
  const dict = t(language);
  const meta = set.creatives.meta;
  const google = set.creatives['google-search'];
  const tiktok = set.creatives.tiktok;

  return (
    <section className="mb-6 rounded border border-neutral-800 p-5">
      <h3 className="mb-1 text-lg font-semibold">{set.angle}</h3>

      <p className="mb-4 text-sm text-neutral-400">
        {dict.adsSetBudget}: {set.budgetAmount} {campaign.currency} ({set.budgetShare}%).{' '}
        {set.budgetRationale}
      </p>

      <dl className="mb-6 space-y-2 text-sm">
        <div>
          <dt className="text-neutral-500">{dict.adsHypothesis}</dt>
          <dd className="text-neutral-300">{set.hypothesis}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">{dict.adsTargeting}</dt>
          <dd className="text-neutral-300">{set.targeting}</dd>
        </div>
      </dl>

      {meta && (
        <div className="mb-6 border-t border-neutral-900 pt-4">
          <h4 className="mb-3 text-sm font-medium">{dict.networkMeta}</h4>
          <CopyList
            title={dict.adsPrimaryText}
            values={meta.primaryTexts}
            copyLabel={dict.adsCopy}
            copiedLabel={dict.adsCopied}
          />
          <CopyList
            title={dict.adsHeadlines}
            values={meta.headlines}
            copyLabel={dict.adsCopy}
            copiedLabel={dict.adsCopied}
          />
          <CopyList
            title={dict.adsDescriptions}
            values={meta.descriptions}
            copyLabel={dict.adsCopy}
            copiedLabel={dict.adsCopied}
          />
          <p className="text-sm text-neutral-400">
            <span className="text-neutral-500">{dict.adsVisual}: </span>
            {meta.visualDirection}
          </p>
        </div>
      )}

      {google && (
        <div className="mb-6 border-t border-neutral-900 pt-4">
          <h4 className="mb-3 text-sm font-medium">{dict.networkGoogleSearch}</h4>
          <CopyList
            title={dict.adsHeadlines}
            values={google.headlines}
            copyLabel={dict.adsCopy}
            copiedLabel={dict.adsCopied}
          />
          <CopyList
            title={dict.adsDescriptions}
            values={google.descriptions}
            copyLabel={dict.adsCopy}
            copiedLabel={dict.adsCopied}
          />
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
            {dict.adsKeywords}
          </p>
          <ul className="space-y-1 text-sm text-neutral-300">
            {google.keywordGroups.map((group) => (
              <li key={group.theme}>
                <span className="text-neutral-500">{group.theme}: </span>
                {group.keywords.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tiktok && (
        <div className="border-t border-neutral-900 pt-4">
          <h4 className="mb-3 text-sm font-medium">{dict.networkTiktok}</h4>
          <CopyList
            title={dict.adsAdText}
            values={tiktok.adTexts}
            copyLabel={dict.adsCopy}
            copiedLabel={dict.adsCopied}
          />
          <p className="mb-2 text-sm text-neutral-300">
            <span className="text-neutral-500">{dict.adsHook}: </span>
            {tiktok.hook}
          </p>
          <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">{dict.adsScript}</p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-neutral-900 p-3 text-sm text-neutral-300">
            {tiktok.script}
          </pre>
        </div>
      )}
    </section>
  );
}

export function CampaignDetail({
  campaign,
  language,
}: {
  campaign: Campaign;
  language: Language;
}) {
  const dict = t(language);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/ads" className="mb-6 inline-block text-sm text-neutral-400 transition-colors hover:text-neutral-100">
        {dict.adsBackToList}
      </Link>

      <h1 className="mb-2 text-2xl font-semibold">{campaign.name}</h1>
      <p className="mb-1 text-sm text-neutral-500">
        {campaignObjectiveLabel(dict, campaign.objective)} &middot; {campaign.audienceRef} &middot;{' '}
        {campaign.networks.map((network) => adNetworkLabel(dict, network)).join(', ')}
      </p>
      <p className="mb-8 text-sm text-neutral-500">
        {campaign.totalBudget} {campaign.currency} / {campaign.periodDays}{' '}
        {language === 'tr' ? 'gün' : 'days'} &middot; {dict.adsTotalBudgetNote}
      </p>

      <CampaignSchedule campaign={campaign} language={language} />

      <section className="mb-8 rounded border border-neutral-800 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
          {dict.adsPositioning}
        </h2>
        <p className="text-neutral-200">{campaign.positioning}</p>
      </section>

      {campaign.adSets.map((set) => (
        <AdSetCard key={set.id} set={set} campaign={campaign} language={language} />
      ))}
    </main>
  );
}
