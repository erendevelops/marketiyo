import type { Angle, BrandProfile, Idea, Platform } from '@/lib/schema';
import { loadPlatformCard, loadTemplate } from './load';

const MAX_HOOKS = 150;
const MAX_REJECTIONS = 40;

function renderBrand(brand: BrandProfile): string {
  const lines = [
    `Ürün: ${brand.productName}`,
    `Tanım: ${brand.oneLiner}`,
    `Kategori: ${brand.category}`,
    '',
    'Hedef kitleler:',
    ...brand.audiences.map(
      (audience) =>
        `- ${audience.label}. Sıkıntısı: ${audience.pain}. İstediği sonuç: ${audience.desire}. Bulunduğu yer: ${audience.whereTheyHangOut}`,
    ),
  ];

  if (brand.offers.length) {
    lines.push('', 'Teklifler:', ...brand.offers.map((o) => `- ${o.label}: ${o.cta} (${o.url})`));
  }
  if (brand.voice.do.length) {
    lines.push('', 'Üslupta olması gerekenler:', ...brand.voice.do.map((rule) => `- ${rule}`));
  }
  if (brand.voice.dont.length) {
    lines.push('', 'Üslupta kaçınılacaklar:', ...brand.voice.dont.map((rule) => `- ${rule}`));
  }
  if (brand.voice.referenceExamples.length) {
    lines.push('', 'Örnek ton:', ...brand.voice.referenceExamples.map((e) => `- ${e}`));
  }
  if (brand.proof.length) {
    lines.push('', 'Somut kanıtlar:', ...brand.proof.map((item) => `- ${item}`));
  }
  if (brand.competitors.length) {
    lines.push(
      '',
      'Rakipler:',
      ...brand.competitors.map(
        (c) => `- ${c.name}: ${c.positioning}. Farkımız: ${c.whatWeDoDifferently}`,
      ),
    );
  }
  if (brand.bannedClaims.length) {
    lines.push('', 'ASLA kullanılmayacak ifadeler:', ...brand.bannedClaims.map((c) => `- ${c}`));
  }

  return lines.join('\n');
}

const outputContract = `{
  "ideas": [
    {
      "platform": "<platform>",
      "format": "<platform kartındaki formatlardan biri>",
      "angle": "education | proof | contrarian | story | offer",
      "hook": "<tek cümle>",
      "premise": "<tek cümle>",
      "whyItWorks": "<tek cümle>",
      "audienceRef": "<hedef kitle adı>",
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
    sections.push('', '## ACILAR', `Sadece şu açıları kullan: ${input.angles.join(', ')}`);
  }

  const hooks = input.recentHooks.slice(-MAX_HOOKS).reverse();
  if (hooks.length) {
    sections.push(
      '',
      '## TEKRARLAMA',
      'Bu kancalar zaten üretildi, tekrar etme:',
      ...hooks.map((hook) => `- ${hook}`),
    );
  }

  const rejections = input.recentRejections.slice(-MAX_REJECTIONS).reverse();
  if (rejections.length) {
    sections.push(
      '',
      '## REDDEDILENLER',
      'Kullanıcı bunları eledi, benzerlerini üretme:',
      ...rejections.map(
        (r) => `- ${r.hook}${r.rejectionReason ? ` (${r.rejectionReason})` : ''}`,
      ),
    );
  }

  sections.push(
    '',
    '## CIKTI',
    `Tam olarak ${input.count} fikir üret.`,
    'Sadece aşağıdaki biçimde geçerli JSON döndür. Açıklama veya ön söz yazma.',
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
    `Özet: ${input.idea.premise}`,
    `Açı: ${input.idea.angle}`,
    `Format: ${input.idea.format}`,
    `Hedef kitle: ${input.idea.audienceRef}`,
    '',
    '## CIKTI',
    'Sadece geçerli JSON döndür:',
    '{ "markdown": "<markdown içerik>" }',
  ].join('\n');
}
