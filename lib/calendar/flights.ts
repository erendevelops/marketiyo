import type { Campaign } from '@/lib/schema';

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The last day the campaign runs. The start day counts as day one. */
export function campaignEndDate(campaign: Campaign): string | null {
  if (!campaign.startDate) return null;
  return addDays(campaign.startDate, campaign.periodDays - 1);
}

/** Campaigns whose run overlaps the given range, inclusive at both ends. */
export function campaignsInRange(campaigns: Campaign[], from: string, to: string): Campaign[] {
  return campaigns.filter((campaign) => {
    const end = campaignEndDate(campaign);
    if (!campaign.startDate || !end) return false;
    return campaign.startDate <= to && end >= from;
  });
}
