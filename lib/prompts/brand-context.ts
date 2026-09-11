import type { BrandProfile } from '@/lib/schema';

/** The brand profile as compact text. Shared by every prompt that needs it. */
export function renderBrand(brand: BrandProfile): string {
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
