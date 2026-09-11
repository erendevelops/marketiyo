import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  const settings = await getStore().readSettings();
  const report = await getProvider(settings).isAvailable();
  return NextResponse.json({ providerId: settings.providerId, ...report });
}
