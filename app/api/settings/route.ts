import { NextResponse } from 'next/server';
import { redactSettings, settingsSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(redactSettings(await getStore().readSettings()));
}

export async function PUT(request: Request) {
  let patch: unknown;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  if (typeof patch !== 'object' || patch === null) {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  let issues = '';
  const saved = await getStore().updateSettings((current) => {
    const merged = settingsSchema.safeParse({ ...current, ...patch });
    if (merged.success) return merged.data;
    issues = merged.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return null;
  });

  if (!saved) return NextResponse.json({ error: issues }, { status: 400 });
  return NextResponse.json(redactSettings(saved));
}
