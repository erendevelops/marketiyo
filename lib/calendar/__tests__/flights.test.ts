import { describe, it, expect } from 'vitest';
import { campaignsInRange, campaignEndDate } from '@/lib/calendar/flights';
import type { Campaign } from '@/lib/schema';

function campaign(id: string, startDate: string | null, periodDays = 7): Campaign {
  return {
    id,
    name: `Kampanya ${id}`,
    objective: 'traffic',
    audienceRef: 'A',
    networks: ['meta'],
    totalBudget: 1000,
    currency: 'TRY',
    periodDays,
    notes: '',
    startDate,
    createdAt: '2026-09-11T00:00:00.000Z',
    positioning: 'Konumlandırma',
    adSets: [],
    promptVersion: 'campaign-plan@1',
  };
}

describe('campaignEndDate', () => {
  it('counts the start day as day one', () => {
    expect(campaignEndDate(campaign('a', '2026-09-14', 7))).toBe('2026-09-20');
  });

  it('handles a single day campaign', () => {
    expect(campaignEndDate(campaign('a', '2026-09-14', 1))).toBe('2026-09-14');
  });

  it('crosses a month boundary', () => {
    expect(campaignEndDate(campaign('a', '2026-09-28', 7))).toBe('2026-10-04');
  });

  it('returns null without a start date', () => {
    expect(campaignEndDate(campaign('a', null))).toBeNull();
  });
});

describe('campaignsInRange', () => {
  const week = { from: '2026-09-14', to: '2026-09-20' };

  it('includes a campaign running through the week', () => {
    const result = campaignsInRange([campaign('a', '2026-09-16', 3)], week.from, week.to);
    expect(result).toHaveLength(1);
  });

  it('includes a campaign that started before and still runs', () => {
    const result = campaignsInRange([campaign('a', '2026-09-10', 10)], week.from, week.to);
    expect(result).toHaveLength(1);
  });

  it('excludes a campaign that ended before the week', () => {
    const result = campaignsInRange([campaign('a', '2026-09-01', 5)], week.from, week.to);
    expect(result).toHaveLength(0);
  });

  it('excludes a campaign starting after the week', () => {
    const result = campaignsInRange([campaign('a', '2026-09-25', 5)], week.from, week.to);
    expect(result).toHaveLength(0);
  });

  it('excludes campaigns with no start date', () => {
    const result = campaignsInRange([campaign('a', null)], week.from, week.to);
    expect(result).toHaveLength(0);
  });

  it('includes a campaign ending exactly on the first day of the week', () => {
    const result = campaignsInRange([campaign('a', '2026-09-08', 7)], week.from, week.to);
    expect(result).toHaveLength(1);
  });
});
