import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProvider, runWithRepair } from '@/lib/providers';
import { composeBrandDraftPrompt } from '@/lib/prompts/brand-draft';
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
      { error: 'En az 20 karakterlik bir ürün açıklaması gerekli.' },
      { status: 400 },
    );
  }

  const settings = await getStore().readSettings();
  const prompt = composeBrandDraftPrompt(parsed.data);

  const result = await runWithRepair(getProvider(settings), { prompt, schemaName: 'brandProfile' });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 502 },
    );
  }
  return NextResponse.json(result.data);
}
