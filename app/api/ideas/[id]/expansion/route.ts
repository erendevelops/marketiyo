import { NextResponse } from 'next/server';
import { z } from 'zod';
import { expandIdea } from '@/lib/ideas/expand';
import { getProvider } from '@/lib/providers';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const maxDuration = 300;

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  return NextResponse.json({ markdown: await getStore().readExpansion(id) });
}

export async function POST(_request: Request, context: Context) {
  const { id } = await context.params;
  const store = getStore();
  const settings = await store.readSettings();

  try {
    const markdown = await expandIdea({ store, provider: getProvider(settings), ideaId: id });
    return NextResponse.json({ markdown });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}

const putSchema = z.object({ markdown: z.string().min(1) });

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  const parsed = putSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Geçersiz içerik.' }, { status: 400 });

  await getStore().writeExpansion(id, parsed.data.markdown);
  return NextResponse.json({ markdown: parsed.data.markdown });
}
