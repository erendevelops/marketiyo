import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProvider, runWithRepair } from '@/lib/providers';
import { loadTemplate } from '@/lib/prompts/load';
import { languageSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const maxDuration = 300;

const bodySchema = z.object({
  text: z.string().min(20),
  language: languageSchema.default('tr'),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'En az 20 karakterlik bir urun aciklamasi gerekli.' },
      { status: 400 },
    );
  }

  const settings = await getStore().readSettings();
  const prompt = [
    loadTemplate('brand-draft', parsed.data.language),
    '',
    '## URUN ACIKLAMASI',
    parsed.data.text,
    '',
    '## CIKTI',
    'Sadece gecerli JSON dondur. Su alanlari doldur:',
    'productName, oneLiner, category, audiences[{label,pain,desire,whereTheyHangOut}],',
    'offers[{label,cta,url}], voice{do[],dont[],referenceExamples[]}, proof[],',
    'competitors[{name,positioning,whatWeDoDifferently}], bannedClaims[],',
    `outputLanguage: "${parsed.data.language}", platforms[], updatedAt: ISO tarih.`,
    'Bilmedigin alanlari bos dizi veya bos metin birak.',
  ].join('\n');

  const result = await runWithRepair(getProvider(settings), { prompt, schemaName: 'brandProfile' });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 502 },
    );
  }
  return NextResponse.json(result.data);
}
