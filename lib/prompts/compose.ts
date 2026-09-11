import type { Angle, BrandProfile, Idea, Platform } from '@/lib/schema';
import { loadPlatformCard, loadTemplate } from './load';

const MAX_HOOKS = 150;
const MAX_REJECTIONS = 40;

function renderBrand(brand: BrandProfile): string {
  const lines = [
    `Urun: ${brand.productName}`,
    `Tanim: ${brand.oneLiner}`,
    `Kategori: ${brand.category}`,
    '',
    'Hedef kitleler:',
    ...brand.audiences.map(
      (audience) =>
        `- ${audience.label}. Aci: ${audience.pain}. Istek: ${audience.desire}. Bulundugu yer: ${audience.whereTheyHangOut}`,
    ),
  ];

  if (brand.offers.length) {
    lines.push('', 'Teklifler:', ...brand.offers.map((o) => `- ${o.label}: ${o.cta} (${o.url})`));
  }
  if (brand.voice.do.length) {
    lines.push('', 'Ses, yap:', ...brand.voice.do.map((rule) => `- ${rule}`));
  }
  if (brand.voice.dont.length) {
    lines.push('', 'Ses, yapma:', ...brand.voice.dont.map((rule) => `- ${rule}`));
  }
  if (brand.voice.referenceExamples.length) {
    lines.push('', 'Ornek ton:', ...brand.voice.referenceExamples.map((e) => `- ${e}`));
  }
  if (brand.proof.length) {
    lines.push('', 'Kanit:', ...brand.proof.map((item) => `- ${item}`));
  }
  if (brand.competitors.length) {
    lines.push(
      '',
      'Rakipler:',
      ...brand.competitors.map(
        (c) => `- ${c.name}: ${c.positioning}. Farkimiz: ${c.whatWeDoDifferently}`,
      ),
    );
  }
  if (brand.bannedClaims.length) {
    lines.push('', 'ASLA kullanilmayacak iddialar:', ...brand.bannedClaims.map((c) => `- ${c}`));
  }

  return lines.join('\n');
}

const outputContract = `{
  "ideas": [
    {
      "platform": "<platform>",
      "format": "<platform kartindaki formatlardan biri>",
      "angle": "education | proof | contrarian | story | offer",
      "hook": "<tek cumle>",
      "premise": "<tek cumle>",
      "whyItWorks": "<tek cumle>",
      "audienceRef": "<hedef kitle etiketi>",
      "score": 0,
      "tags": ["<etiket>"]
    }
  ]
}`;

export type IdeaBatchInput = {
  brand: BrandProfile;
  platform: Platform;
  count: number;
  angles: Angle[];
  recentHooks: string[];
  recentRejections: Idea[];
};

export function composeIdeaBatchPrompt(input: IdeaBatchInput): string {
  const language = input.brand.outputLanguage;
  const sections = [
    loadTemplate('idea-batch', language),
    '',
    '## MARKA',
    renderBrand(input.brand),
    '',
    '## PLATFORM',
    loadPlatformCard(input.platform, language),
  ];

  if (input.angles.length) {
    sections.push('', '## ACILAR', `Sadece su acilari kullan: ${input.angles.join(', ')}`);
  }

  const hooks = input.recentHooks.slice(-MAX_HOOKS).reverse();
  if (hooks.length) {
    sections.push(
      '',
      '## TEKRARLAMA',
      'Bu kancalar zaten uretildi, tekrar etme:',
      ...hooks.map((hook) => `- ${hook}`),
    );
  }

  const rejections = input.recentRejections.slice(-MAX_REJECTIONS).reverse();
  if (rejections.length) {
    sections.push(
      '',
      '## REDDEDILENLER',
      'Kullanici bunlari reddetti, benzerlerini uretme:',
      ...rejections.map(
        (r) => `- ${r.hook}${r.rejectionReason ? ` (${r.rejectionReason})` : ''}`,
      ),
    );
  }

  sections.push(
    '',
    '## CIKTI',
    `Tam olarak ${input.count} fikir uret.`,
    'Sadece asagidaki sekilde gecerli JSON dondur. Aciklama veya on soz yazma.',
    outputContract,
  );

  return sections.join('\n');
}

export function composeExpansionPrompt(input: { brand: BrandProfile; idea: Idea }): string {
  const language = input.brand.outputLanguage;
  return [
    loadTemplate(`expansion-${input.idea.platform}`, language),
    '',
    '## MARKA',
    renderBrand(input.brand),
    '',
    '## PLATFORM',
    loadPlatformCard(input.idea.platform, language),
    '',
    '## FIKIR',
    `Kanca: ${input.idea.hook}`,
    `Ozet: ${input.idea.premise}`,
    `Aci: ${input.idea.angle}`,
    `Format: ${input.idea.format}`,
    `Hedef kitle: ${input.idea.audienceRef}`,
    '',
    '## CIKTI',
    'Sadece gecerli JSON dondur:',
    '{ "markdown": "<markdown icerik>" }',
  ].join('\n');
}
