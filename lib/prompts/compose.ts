import type { Angle, BrandProfile, Idea, Platform } from '@/lib/schema';
import { loadPlatformCard, loadTemplate } from './load';
import { renderBrand } from './brand-context';

const MAX_HOOKS = 150;
const MAX_REJECTIONS = 40;

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
