import { NextResponse } from 'next/server';
import { redactSettings, settingsSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(redactSettings(await getStore().readSettings()));
}

export async function PUT(request: Request) {
  const store = getStore();
  const current = await store.readSettings();

  let patch: unknown;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  if (typeof patch !== 'object' || patch === null) {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  const merged = settingsSchema.safeParse({ ...current, ...patch });
  if (!merged.success) {
    return NextResponse.json(
      { error: merged.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  }

  await store.writeSettings(merged.data);
  return NextResponse.json(redactSettings(merged.data));
}
