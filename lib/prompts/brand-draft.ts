import { platformSchema, type Language } from '@/lib/schema';
import { loadTemplate } from './load';

/**
 * The model fills a skeleton rather than a prose list of field names. Enum
 * fields carry their allowed identifiers inline, because a plain field list
 * invites translated labels such as "Sosyal medya" that the schema rejects.
 */
function outputContract(language: Language): string {
  const platforms = platformSchema.options.map((option) => `"${option}"`).join(' | ');

  return `{
  "productName": "<ürün adı>",
  "oneLiner": "<tek cümlelik tanım>",
  "category": "<kategori>",
  "audiences": [
    {
      "label": "<kitle adı>",
      "pain": "<şu an yaşadığı sıkıntı>",
      "desire": "<ulaşmak istediği sonuç>",
      "whereTheyHangOut": "<vaktini nerede geçiriyor>"
    }
  ],
  "offers": [{ "label": "<teklif>", "cta": "<çağrı>", "url": "<adres>" }],
  "voice": { "do": ["<kural>"], "dont": ["<kural>"], "referenceExamples": [] },
  "proof": ["<metinde açıkça geçen kanıt>"],
  "competitors": [{ "name": "<ad>", "positioning": "<konum>", "whatWeDoDifferently": "<fark>" }],
  "bannedClaims": ["<kullanılmayacak ifade>"],
  "outputLanguage": "${language}",
  "platforms": [${platforms}],
  "updatedAt": "<ISO 8601 tarih, örnek 2026-01-31T00:00:00.000Z>"
}`;
}

export type BrandDraftInput = {
  text: string;
  language: Language;
};

export function composeBrandDraftPrompt(input: BrandDraftInput): string {
  const platforms = platformSchema.options.join(', ');

  return [
    loadTemplate('brand-draft', input.language),
    '',
    '## ÜRÜN AÇIKLAMASI',
    input.text,
    '',
    '## ÇIKTI',
    'Sadece aşağıdaki biçimde geçerli JSON döndür. Açıklama veya ön söz yazma.',
    '',
    'Kesin kurallar:',
    `- "platforms" alanına yalnızca şu tanımlayıcılardan uygun olanları yaz: ${platforms}.`,
    '- Bu tanımlayıcıları çevirme, birebir aynen kullan. "Sosyal medya" gibi bir etiket geçersizdir.',
    `- "outputLanguage" alanı tam olarak "${input.language}" olmalı.`,
    '- "audiences" ve "platforms" en az bir öğe içermeli.',
    '- Bilmediğin metin alanlarını boş bırak, bilmediğin listeleri boş dizi yap.',
    '',
    outputContract(input.language),
  ].join('\n');
}
