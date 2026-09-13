import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStore } from '@/lib/server/store';
import { RESET_CONFIRMATION } from '@/lib/workspace/reset';

export const runtime = 'nodejs';

const bodySchema = z.object({ confirm: z.literal(RESET_CONFIRMATION) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Sıfırlama onayı eksik.' }, { status: 400 });
  }

  await getStore().resetWorkspace();
  return NextResponse.json({ ok: true });
}
