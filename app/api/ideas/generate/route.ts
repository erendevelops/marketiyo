import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateIdeas } from '@/lib/ideas/generate';
import { getProvider } from '@/lib/providers';
import { angleSchema, platformSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const maxDuration = 300;

const bodySchema = z.object({
  platform: platformSchema,
  count: z.number().int().min(1).max(50).default(10),
  angles: z.array(angleSchema).default([]),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz istek govdesi.' }, { status: 400 });
  }

  const store = getStore();
  const settings = await store.readSettings();

  try {
    const result = await generateIdeas({
      store,
      provider: getProvider(settings),
      platform: parsed.data.platform,
      count: parsed.data.count,
      angles: parsed.data.angles,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
