import { NextResponse } from 'next/server';
import { z } from 'zod';
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

const patchSchema = z.object({
  startDate: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'expected YYYY-MM-DD')
    .nullable(),
});

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz tarih.' }, { status: 400 });
  }

  const campaigns = await getStore().updateCampaign(id, parsed.data);
  const updated = campaigns.find((campaign) => campaign.id === id);
  if (!updated) return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 });
  return NextResponse.json(updated);
}
