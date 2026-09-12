import { randomUUID } from 'node:crypto';
import { runWithRepair, type Provider } from '@/lib/providers';
import { composeCampaignPrompt } from '@/lib/prompts/ads';
import { CAMPAIGN_PROMPT_VERSION } from '@/lib/prompts/version';
import {
  campaignSchema,
  generatedAdSetSchema,
  type AdSet,
  type Campaign,
  type CampaignInput,
  type CampaignPlanResponse,
} from '@/lib/schema';
import type { Store } from '@/lib/workspace/store';

export const MIN_AD_SETS = 3;
export const MAX_AD_SETS = 5;

export type GenerateCampaignInput = {
  store: Store;
  provider: Provider;
  campaign: CampaignInput;
  adSetCount?: number;
};

export type GenerateCampaignResult = {
  campaign: Campaign;
  discarded: number;
  /** Why each discarded ad set failed, so a short plan is never a mystery. */
  discardReasons: string[];
};

/**
 * Percentages come back from the model and rarely add up to exactly 100, so they
 * are normalised here before any amount is derived from them. The user's total
 * budget is never changed.
 */
export function distributeBudget(
  shares: number[],
  totalBudget: number,
): { share: number; amount: number }[] {
  const sum = shares.reduce((total, share) => total + share, 0);
  if (sum <= 0) {
    const even = 100 / shares.length;
    return shares.map(() => ({
      share: round(even),
      amount: round((totalBudget * even) / 100),
    }));
  }

  return shares.map((share) => {
    const normalised = (share / sum) * 100;
    return {
      share: round(normalised),
      amount: round((totalBudget * normalised) / 100),
    };
  });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function generateCampaign(
  input: GenerateCampaignInput,
): Promise<GenerateCampaignResult> {
  const brand = await input.store.readBrand();
  if (!brand) throw new Error('Önce marka profili oluşturulmalı.');

  const adSetCount = Math.min(Math.max(input.adSetCount ?? MIN_AD_SETS, MIN_AD_SETS), MAX_AD_SETS);

  const prompt = composeCampaignPrompt({ brand, campaign: input.campaign, adSetCount });

  const result = await runWithRepair<CampaignPlanResponse>(input.provider, {
    prompt,
    schemaName: 'campaignPlanResponse',
    maxOutputTokens: 16_000,
    timeoutMs: 300_000,
  });
  if (!result.ok) throw new Error(result.error.message);

  let discarded = 0;
  const discardReasons: string[] = [];
  const accepted: (typeof generatedAdSetSchema)['_output'][] = [];

  for (const candidate of result.data.adSets) {
    const parsed = generatedAdSetSchema.safeParse(candidate);
    if (!parsed.success) {
      discarded += 1;
      discardReasons.push(
        parsed.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; '),
      );
      continue;
    }
    accepted.push(parsed.data);
  }

  if (discardReasons.length) {
    console.warn('[marketiyo] discarded ad sets:', discardReasons.join(' | '));
  }

  if (accepted.length === 0) {
    throw new Error(
      `Geçerli hiçbir reklam seti üretilemedi. Sebep: ${discardReasons[0] ?? 'bilinmiyor'}`,
    );
  }

  const budgets = distributeBudget(
    accepted.map((set) => set.budgetShare),
    input.campaign.totalBudget,
  );

  const adSets: AdSet[] = accepted.map((set, index) => ({
    ...set,
    id: randomUUID(),
    budgetShare: budgets[index].share,
    budgetAmount: budgets[index].amount,
  }));

  const campaign = campaignSchema.parse({
    ...input.campaign,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    positioning: result.data.positioning,
    adSets,
    promptVersion: CAMPAIGN_PROMPT_VERSION,
  });

  await input.store.appendCampaign(campaign);
  await input.store.writeCampaignDoc(campaign.id, renderCampaignDoc(campaign));

  return { campaign, discarded, discardReasons };
}

/** A readable copy of the plan, so it can be edited or exported outside the app. */
export function renderCampaignDoc(campaign: Campaign): string {
  const lines = [
    '---',
    `campaignId: ${campaign.id}`,
    `createdAt: ${campaign.createdAt}`,
    `promptVersion: ${campaign.promptVersion}`,
    '---',
    '',
    `# ${campaign.name}`,
    '',
    `Toplam bütçe: ${campaign.totalBudget} ${campaign.currency}, ${campaign.periodDays} gün`,
    '',
    '## Konumlandırma',
    campaign.positioning,
  ];

  for (const set of campaign.adSets) {
    lines.push(
      '',
      `## ${set.angle}`,
      '',
      `Bütçe: ${set.budgetAmount} ${campaign.currency} (%${set.budgetShare}). ${set.budgetRationale}`,
      '',
      `Hipotez: ${set.hypothesis}`,
      '',
      `Hedefleme: ${set.targeting}`,
    );

    const meta = set.creatives.meta;
    if (meta) {
      lines.push(
        '',
        '### Meta',
        '',
        'Birincil metin:',
        ...meta.primaryTexts.map((text) => `- ${text}`),
        '',
        'Başlıklar:',
        ...meta.headlines.map((text) => `- ${text}`),
        '',
        'Açıklamalar:',
        ...meta.descriptions.map((text) => `- ${text}`),
        '',
        `Görsel yönü: ${meta.visualDirection}`,
      );
    }

    const google = set.creatives['google-search'];
    if (google) {
      lines.push(
        '',
        '### Google Arama',
        '',
        'Başlıklar:',
        ...google.headlines.map((text) => `- ${text}`),
        '',
        'Açıklamalar:',
        ...google.descriptions.map((text) => `- ${text}`),
        '',
        'Anahtar kelimeler:',
        ...google.keywordGroups.map((group) => `- ${group.theme}: ${group.keywords.join(', ')}`),
      );
    }

    const tiktok = set.creatives.tiktok;
    if (tiktok) {
      lines.push(
        '',
        '### TikTok',
        '',
        'Reklam metni:',
        ...tiktok.adTexts.map((text) => `- ${text}`),
        '',
        `Kanca: ${tiktok.hook}`,
        '',
        'Senaryo:',
        tiktok.script,
      );
    }
  }

  return lines.join('\n');
}
