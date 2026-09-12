import { NextResponse } from 'next/server';
import { z } from 'zod';
import { articleStatusSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

const patchSchema = z.object({ status: articleStatusSchema });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz güncelleme.' }, { status: 400 });
  }

  const articles = await getStore().updateArticle(id, parsed.data);
  const updated = articles.find((article) => article.id === id);
  if (!updated) return NextResponse.json({ error: 'Konu bulunamadı.' }, { status: 404 });
  return NextResponse.json(updated);
}
