import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Article, BrandProfile, Language } from '@/lib/schema';
import { renderBrand } from './brand-context';
import { loadTemplate } from './load';

const root = path.join(process.cwd(), 'lib', 'prompts', 'channels', 'seo');

/** Turkish is the source of truth. English falls back to Turkish with a warning. */
export function loadSeoCard(language: Language): string {
  const read = (lang: Language) => {
    try {
      return readFileSync(path.join(root, lang, 'blog.md'), 'utf8');
    } catch {
      return null;
    }
  };

  const requested = read(language);
  if (requested !== null) return requested;

  if (language === 'en') {
    const fallback = read('tr');
    if (fallback !== null) {
      console.warn('[marketiyo] Missing English SEO card, falling back to Turkish.');
      return fallback;
    }
  }

  throw new Error(`Missing prompt file: channels/seo/${language}/blog.md`);
}

const MAX_TITLES = 120;

const batchContract = `{
  "articles": [
    {
      "title": "<en fazla 120 karakter>",
      "primaryKeyword": "<tek arama ifadesi>",
      "secondaryKeywords": ["<yan ifade>"],
      "searchIntent": "informational | commercial | transactional | navigational",
      "funnelStage": "awareness | consideration | decision",
      "angle": "<bu yaziyi farkli kilan sey>",
      "whyItWorks": "<tek cumle>",
      "outlinePoints": ["<ana baslik>", "<ana baslik>", "<ana baslik>"]
    }
  ]
}`;

export type ArticleBatchInput = {
  brand: BrandProfile;
  count: number;
  existingTitles: string[];
};

export function composeArticleBatchPrompt(input: ArticleBatchInput): string {
  const language = input.brand.outputLanguage;

  const sections = [
    loadTemplate('article-batch', language),
    '',
    '## MARKA',
    renderBrand(input.brand),
    '',
    '## KANAL KURALLARI',
    loadSeoCard(language),
  ];

  const titles = input.existingTitles.slice(-MAX_TITLES).reverse();
  if (titles.length) {
    sections.push(
      '',
      '## TEKRARLAMA',
      'Bu başlıklar zaten önerildi, tekrar etme:',
      ...titles.map((title) => `- ${title}`),
    );
  }

  sections.push(
    '',
    '## ÇIKTI',
    `Tam olarak ${input.count} konu üret.`,
    'Sadece aşağıdaki biçimde geçerli JSON döndür. Açıklama veya ön söz yazma.',
    batchContract,
  );

  return sections.join('\n');
}

export function composeArticleDraftPrompt(input: {
  brand: BrandProfile;
  article: Article;
}): string {
  const language = input.brand.outputLanguage;

  return [
    loadTemplate('article-draft', language),
    '',
    '## MARKA',
    renderBrand(input.brand),
    '',
    '## KANAL KURALLARI',
    loadSeoCard(language),
    '',
    '## KONU',
    `Başlık: ${input.article.title}`,
    `Ana ifade: ${input.article.primaryKeyword}`,
    `Yan ifadeler: ${input.article.secondaryKeywords.join(', ') || 'yok'}`,
    `Arama niyeti: ${input.article.searchIntent}`,
    `Huni aşaması: ${input.article.funnelStage}`,
    `Açı: ${input.article.angle}`,
    '',
    'Ana hat:',
    ...input.article.outlinePoints.map((point) => `- ${point}`),
    '',
    '## ÇIKTI',
    'Sadece geçerli JSON döndür:',
    '{ "markdown": "<yazı gövdesi>", "metaTitle": "<en fazla 60 karakter>", "metaDescription": "<en fazla 160 karakter>" }',
  ].join('\n');
}
