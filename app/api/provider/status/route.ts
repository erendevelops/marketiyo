import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST, not GET: testing the connection sends a real prompt and spends the
 * user's quota, so it must never run from a link, a prefetch or an image tag.
 */
export async function POST() {
  const settings = await getStore().readSettings();
  const report = await getProvider(settings).isAvailable();
  return NextResponse.json({ providerId: settings.providerId, ...report });
}
