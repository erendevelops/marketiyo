import { NextResponse } from 'next/server';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const store = getStore();

  const campaign = (await store.readCampaigns()).find((item) => item.id === id);
  if (!campaign) return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 });

  return NextResponse.json({ campaign, markdown: await store.readCampaignDoc(id) });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  await getStore().deleteCampaign(id);
  return NextResponse.json({ ok: true });
}
