import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AdNetwork, BrandProfile, CampaignInput, Language } from '@/lib/schema';
import { loadTemplate } from './load';
import { renderBrand } from './brand-context';

const root = path.join(process.cwd(), 'lib', 'prompts', 'channels', 'ads');

/** Turkish is the source of truth. English falls back to Turkish with a warning. */
export function loadAdNetworkCard(network: AdNetwork, language: Language): string {
  const read = (lang: Language) => {
    try {
      return readFileSync(path.join(root, lang, `${network}.md`), 'utf8');
    } catch {
      return null;
    }
  };

  const requested = read(language);
  if (requested !== null) return requested;

  if (language === 'en') {
    const fallback = read('tr');
    if (fallback !== null) {
      console.warn(`[marketiyo] Missing English ad card for ${network}, falling back to Turkish.`);
      return fallback;
    }
  }

  throw new Error(`Missing prompt file: channels/ads/${language}/${network}.md`);
}

const OBJECTIVE_LABEL: Record<CampaignInput['objective'], string> = {
  awareness: 'bilinirlik',
  traffic: 'trafik',
  leads: 'potansiyel müşteri',
  sales: 'satış',
  'app-installs': 'uygulama yüklemesi',
};

function outputContract(networks: AdNetwork[]): string {
  const creativeShapes: Record<AdNetwork, string> = {
    meta: `"meta": {
        "primaryTexts": ["<en fazla 125 karakter>"],
        "headlines": ["<en fazla 40 karakter>"],
        "descriptions": ["<en fazla 30 karakter>"],
        "visualDirection": "<tek paragraf>"
      }`,
    'google-search': `"google-search": {
        "headlines": ["<en fazla 30 karakter, 3 ile 15 arası>"],
        "descriptions": ["<en fazla 90 karakter, 2 ile 4 arası>"],
        "keywordGroups": [{ "theme": "<tema>", "keywords": ["<kelime>"] }]
      }`,
    tiktok: `"tiktok": {
        "adTexts": ["<en fazla 100 karakter>"],
        "hook": "<tek cümle>",
        "script": "<saniye aralıklarıyla kısa senaryo>"
      }`,
  };

  return `{
  "positioning": "<tek paragraf>",
  "adSets": [
    {
      "angle": "<test edilen açı>",
      "hypothesis": "<tek cümle>",
      "targeting": "<hedefleme notları>",
      "budgetShare": 0,
      "budgetRationale": "<tek cümle>",
      "creatives": {
        ${networks.map((network) => creativeShapes[network]).join(',\n        ')}
      }
    }
  ]
}`;
}

export type CampaignPromptInput = {
  brand: BrandProfile;
  campaign: CampaignInput;
  adSetCount: number;
};

export function composeCampaignPrompt(input: CampaignPromptInput): string {
  const language = input.brand.outputLanguage;

  const sections = [
    loadTemplate('campaign-plan', language),
    '',
    '## MARKA',
    renderBrand(input.brand),
    '',
    '## AĞ KURALLARI',
    ...input.campaign.networks.map((network) => loadAdNetworkCard(network, language)),
    '',
    '## KAMPANYA',
    `Kampanya adı: ${input.campaign.name}`,
    `Hedef: ${OBJECTIVE_LABEL[input.campaign.objective]}`,
    `Hedef kitle: ${input.campaign.audienceRef}`,
    `Toplam bütçe: ${input.campaign.totalBudget} ${input.campaign.currency}`,
    `Süre: ${input.campaign.periodDays} gün`,
    `Ağlar: ${input.campaign.networks.join(', ')}`,
  ];

  if (input.campaign.notes.trim()) {
    sections.push('', 'Ek notlar:', input.campaign.notes.trim());
  }

  sections.push(
    '',
    '## ÇIKTI',
    `Tam olarak ${input.adSetCount} reklam seti üret.`,
    'Yüzdelerin toplamı tam olarak 100 olmalı.',
    'Yalnızca yukarıda listelenen ağlar için metin üret, diğerlerini hiç yazma.',
    'Sadece aşağıdaki biçimde geçerli JSON döndür. Açıklama veya ön söz yazma.',
    outputContract(input.campaign.networks),
  );

  return sections.join('\n');
}
