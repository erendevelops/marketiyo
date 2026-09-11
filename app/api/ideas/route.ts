import { NextResponse } from 'next/server';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getStore().readIdeas());
}
