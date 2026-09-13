import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProvider } from '@/lib/providers';
import { generateArticles } from '@/lib/seo/generate';
import { getStore } from '@/lib/server/store';
import { blockUnlessAllowed } from '@/lib/server/onboarding';

export const runtime = 'nodejs';
export const maxDuration = 300;

const bodySchema = z.object({
  count: z.number().int().min(1).max(25).default(8),
});

export async function POST(request: Request) {
  const blocked = await blockUnlessAllowed('seo');
  if (blocked) return blocked;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi.' }, { status: 400 });
  }

  const store = getStore();
  const settings = await store.readSettings();

  try {
    const result = await generateArticles({
      store,
      provider: getProvider(settings),
      count: parsed.data.count,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
