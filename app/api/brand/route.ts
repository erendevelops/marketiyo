import { NextResponse } from 'next/server';
import { brandProfileSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getStore().readBrand());
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  const parsed = brandProfileSchema.safeParse({ ...body, updatedAt: new Date().toISOString() });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  }

  await getStore().writeBrand(parsed.data);
  return NextResponse.json(parsed.data);
}
