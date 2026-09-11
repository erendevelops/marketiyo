import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ideaStatusSchema, rejectionReasonSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: ideaStatusSchema.optional(),
  rejectionReason: rejectionReasonSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz guncelleme.' }, { status: 400 });
  }

  const ideas = await getStore().updateIdea(id, parsed.data);
  const updated = ideas.find((idea) => idea.id === id);
  if (!updated) return NextResponse.json({ error: 'Fikir bulunamadi.' }, { status: 404 });
  return NextResponse.json(updated);
}
