'use client';

import Link from 'next/link';
import { secondaryButton, subtleButton } from '@/components/fields';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CampaignForm } from '@/components/CampaignForm';
import { t } from '@/lib/i18n';
import { adNetworkLabel, campaignObjectiveLabel } from '@/lib/i18n/labels';
import type { BrandProfile, Campaign, Language } from '@/lib/schema';

type Props = {
  initial: Campaign[];
  brand: BrandProfile | null;
  language: Language;
};

export function CampaignList({ initial, brand, language }: Props) {
  const dict = t(language);
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>(initial);
  const [notice, setNotice] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm(dict.adsDeleteConfirm)) return;

    const previous = campaigns;
    setCampaigns((current) => current.filter((campaign) => campaign.id !== id));

    const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setCampaigns(previous);
      setNotice(dict.errorGeneric);
      return;
    }
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">{dict.adsTitle}</h1>
      <p className="mb-8 text-sm text-neutral-500">{dict.adsIntro}</p>

      <CampaignForm
        brand={brand}
        language={language}
        onCreated={(campaign, discarded) => {
          setCampaigns((current) => [campaign, ...current]);
          setNotice(discarded > 0 ? `${discarded} ${dict.adsDiscarded}` : null);
        }}
      />

      {notice && <p className="mb-6 text-sm text-amber-400">{notice}</p>}

      {campaigns.length === 0 ? (
        <p className="text-neutral-500">{dict.adsEmpty}</p>
      ) : (
        <ul className="space-y-3">
          {campaigns.map((campaign) => (
            <li
              key={campaign.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-neutral-800 p-4"
            >
              <div>
                <p className="font-medium">{campaign.name}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {campaignObjectiveLabel(dict, campaign.objective)} &middot;{' '}
                  {campaign.totalBudget} {campaign.currency} &middot; {campaign.periodDays}{' '}
                  {language === 'tr' ? 'gün' : 'days'}
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  {campaign.networks.map((network) => adNetworkLabel(dict, network)).join(', ')}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/ads/${campaign.id}`}
                  className={secondaryButton}
                >
                  {dict.adsOpen}
                </Link>
                <button
                  type="button"
                  onClick={() => remove(campaign.id)}
                  className={subtleButton}
                >
                  {dict.adsDelete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
