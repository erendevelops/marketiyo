import { NextResponse } from 'next/server';
import { generateCampaign } from '@/lib/ads/generate';
import { getProvider } from '@/lib/providers';
import { campaignInputSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';
import { blockUnlessAllowed } from '@/lib/server/onboarding';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET() {
  return NextResponse.json(await getStore().readCampaigns());
}

export async function POST(request: Request) {
  const blocked = await blockUnlessAllowed('ads');
  if (blocked) return blocked;

  const parsed = campaignInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  }

  const store = getStore();
  const settings = await store.readSettings();

  try {
    const result = await generateCampaign({
      store,
      provider: getProvider(settings),
      campaign: parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
