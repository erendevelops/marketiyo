import { campaignsInRange } from '@/lib/calendar/flights';
import type { Article, BrandProfile, CalendarSlot, Campaign, Idea, Platform } from '@/lib/schema';

/** What the dashboard suggests doing next, in priority order. */
export type NextStep = 'brand' | 'post-today' | 'schedule' | 'expand' | 'triage' | 'generate';

export type DueItem = {
  slotId: string;
  ideaId: string | null;
  hook: string | null;
  platform: Platform;
  posted: boolean;
};

export type DashboardSummary = {
  productName: string | null;
  nextStep: NextStep;
  ideas: { new: number; kept: number; expanded: number; scheduled: number; rejected: number };
  week: { from: string; to: string; scheduled: number; posted: number };
  today: DueItem[];
  campaigns: { total: number; running: Campaign[] };
  articles: { new: number; kept: number; drafted: number };
};

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Monday to Sunday around the given day. */
function weekAround(isoDate: string): { from: string; to: string } {
  const weekday = (new Date(`${isoDate}T00:00:00Z`).getUTCDay() + 6) % 7;
  const from = addDays(isoDate, -weekday);
  return { from, to: addDays(from, 6) };
}

export type SummaryInput = {
  brand: BrandProfile | null;
  ideas: Idea[];
  slots: CalendarSlot[];
  campaigns: Campaign[];
  articles: Article[];
  today: string;
};

/**
 * A pure reading of the workspace. It holds no numbers for their own sake:
 * everything here either answers what to do next or shows what is due.
 */
export function buildSummary(input: SummaryInput): DashboardSummary {
  const count = (status: Idea['status']) => input.ideas.filter((idea) => idea.status === status).length;

  const scheduledIds = new Set(
    input.slots.map((slot) => slot.ideaId).filter((id): id is string => id !== null),
  );

  const hookById = new Map(input.ideas.map((idea) => [idea.id, idea.hook]));

  const { from, to } = weekAround(input.today);
  const thisWeek = input.slots.filter((slot) => slot.date >= from && slot.date <= to);

  const today: DueItem[] = input.slots
    .filter((slot) => slot.date === input.today)
    .map((slot) => ({
      slotId: slot.id,
      ideaId: slot.ideaId,
      hook: slot.ideaId ? (hookById.get(slot.ideaId) ?? null) : null,
      platform: slot.platform,
      posted: slot.status === 'posted',
    }));

  const readyButUnscheduled = input.ideas.filter(
    (idea) => idea.status === 'expanded' && !scheduledIds.has(idea.id),
  ).length;

  const keptButUnscheduled = input.ideas.filter(
    (idea) => idea.status === 'kept' && !scheduledIds.has(idea.id),
  ).length;

  let nextStep: NextStep;
  if (!input.brand) nextStep = 'brand';
  else if (today.some((item) => !item.posted)) nextStep = 'post-today';
  else if (readyButUnscheduled > 0) nextStep = 'schedule';
  else if (keptButUnscheduled > 0) nextStep = 'expand';
  else if (count('new') > 0) nextStep = 'triage';
  else nextStep = 'generate';

  const articleCount = (status: Article['status']) =>
    input.articles.filter((article) => article.status === status).length;

  return {
    productName: input.brand?.productName ?? null,
    nextStep,
    ideas: {
      new: count('new'),
      kept: keptButUnscheduled,
      // The calendar places ideas without changing their status, so being on
      // the calendar is read from the slots, not from the idea record.
      expanded: readyButUnscheduled,
      scheduled: input.ideas.filter((idea) => scheduledIds.has(idea.id)).length,
      rejected: count('rejected'),
    },
    week: {
      from,
      to,
      scheduled: thisWeek.length,
      posted: thisWeek.filter((slot) => slot.status === 'posted').length,
    },
    today,
    campaigns: {
      total: input.campaigns.length,
      running: campaignsInRange(input.campaigns, input.today, input.today),
    },
    articles: {
      new: articleCount('new'),
      kept: articleCount('kept'),
      drafted: articleCount('drafted'),
    },
  };
}
