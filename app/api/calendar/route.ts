import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calendarSlotSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getStore().readCalendar());
}

const putSchema = z.array(calendarSlotSchema);

export async function PUT(request: Request) {
  const parsed = putSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  }

  await getStore().writeCalendar(parsed.data);
  return NextResponse.json(parsed.data);
}
