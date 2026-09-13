import { describe, it, expect } from 'vitest';
import { buildSummary } from '@/lib/dashboard/summary';
import type { Article, BrandProfile, CalendarSlot, Campaign, Idea } from '@/lib/schema';

const TODAY = '2026-09-16'; // a Wednesday; its week runs 14 to 20

const brand = { productName: 'Uzayalım' } as BrandProfile;

function idea(id: string, status: Idea['status']): Idea {
  return {
    id,
    createdAt: '2026-09-10T00:00:00.000Z',
    batchId: 'b',
    platform: 'short-video',
    format: 'talking-head',
    angle: 'story',
    hook: `hook-${id}`,
    premise: 'p',
    whyItWorks: 'w',
    audienceRef: 'A',
    score: 5,
    tags: [],
    status,
    promptVersion: 'v',
  };
}

function slot(id: string, date: string, ideaId: string, status: CalendarSlot['status'] = 'planned'): CalendarSlot {
  return { id, date, platform: 'short-video', ideaId, status, note: '' };
}

function campaign(id: string, startDate: string | null, periodDays = 7): Campaign {
  return {
    id,
    name: id,
    objective: 'traffic',
    audienceRef: 'A',
    networks: ['meta'],
    totalBudget: 1000,
    currency: 'TRY',
    periodDays,
    notes: '',
    startDate,
    createdAt: '2026-09-01T00:00:00.000Z',
    positioning: 'x',
    adSets: [],
    promptVersion: 'v',
  };
}

function article(id: string, status: Article['status']): Article {
  return {
    id,
    createdAt: '2026-09-10T00:00:00.000Z',
    batchId: 'b',
    title: id,
    primaryKeyword: 'k',
    secondaryKeywords: [],
    searchIntent: 'informational',
    funnelStage: 'awareness',
    angle: 'a',
    whyItWorks: 'w',
    outlinePoints: ['1', '2', '3'],
    status,
    promptVersion: 'v',
  };
}

const empty = { onboarded: true, brand, ideas: [], slots: [], campaigns: [], articles: [], today: TODAY };

describe('buildSummary: counts', () => {
  it('counts ideas by stage', () => {
    const summary = buildSummary({
      ...empty,
      ideas: [idea('1', 'new'), idea('2', 'new'), idea('3', 'kept'), idea('4', 'expanded'), idea('5', 'rejected')],
    });
    expect(summary.ideas).toEqual({ new: 2, kept: 1, expanded: 1, scheduled: 0, rejected: 1 });
  });

  it('reads scheduled from the calendar, since placing an idea does not change its status', () => {
    const summary = buildSummary({
      ...empty,
      ideas: [idea('1', 'expanded'), idea('2', 'expanded'), idea('3', 'kept')],
      slots: [slot('a', '2026-09-18', '1'), slot('b', '2026-09-19', '3')],
    });
    expect(summary.ideas.scheduled).toBe(2);
    expect(summary.ideas.expanded).toBe(1);
    expect(summary.ideas.kept).toBe(0);
  });

  it('counts only the current week on the calendar', () => {
    const summary = buildSummary({
      ...empty,
      slots: [
        slot('a', '2026-09-14', '1', 'posted'),
        slot('b', '2026-09-18', '2'),
        slot('c', '2026-09-21', '3'), // next week
        slot('d', '2026-09-13', '4'), // last week
      ],
    });
    expect(summary.week).toEqual({ from: '2026-09-14', to: '2026-09-20', scheduled: 2, posted: 1 });
  });

  it('lists what is due today, with the hook', () => {
    const summary = buildSummary({
      ...empty,
      ideas: [idea('1', 'scheduled')],
      slots: [slot('a', TODAY, '1'), slot('b', '2026-09-17', '1')],
    });
    expect(summary.today).toHaveLength(1);
    expect(summary.today[0].hook).toBe('hook-1');
  });

  it('finds campaigns running today', () => {
    const summary = buildSummary({
      ...empty,
      campaigns: [
        campaign('running', '2026-09-15', 5),
        campaign('ended', '2026-09-01', 3),
        campaign('undated', null),
      ],
    });
    expect(summary.campaigns.total).toBe(3);
    expect(summary.campaigns.running.map((c) => c.id)).toEqual(['running']);
  });

  it('counts article topics by stage', () => {
    const summary = buildSummary({
      ...empty,
      articles: [article('1', 'new'), article('2', 'kept'), article('3', 'drafted')],
    });
    expect(summary.articles).toEqual({ new: 1, kept: 1, drafted: 1 });
  });
});

describe('buildSummary: next step', () => {
  it('asks for engine setup before anything else', () => {
    expect(buildSummary({ ...empty, onboarded: false, brand: null }).nextStep).toBe('setup');
  });

  it('asks for a brand profile first', () => {
    expect(buildSummary({ ...empty, brand: null }).nextStep).toBe('brand');
  });

  it('puts unposted items due today ahead of everything else', () => {
    const summary = buildSummary({
      ...empty,
      ideas: [idea('1', 'scheduled'), idea('2', 'kept')],
      slots: [slot('a', TODAY, '1')],
    });
    expect(summary.nextStep).toBe('post-today');
  });

  it('does not nag about today once it is posted', () => {
    const summary = buildSummary({
      ...empty,
      ideas: [idea('1', 'scheduled')],
      slots: [slot('a', TODAY, '1', 'posted')],
    });
    expect(summary.nextStep).not.toBe('post-today');
  });

  it('asks to schedule ready content that is not on the calendar', () => {
    const summary = buildSummary({ ...empty, ideas: [idea('1', 'expanded')] });
    expect(summary.nextStep).toBe('schedule');
  });

  it('asks to expand kept ideas', () => {
    const summary = buildSummary({ ...empty, ideas: [idea('1', 'kept')] });
    expect(summary.nextStep).toBe('expand');
  });

  it('asks to triage new ideas', () => {
    const summary = buildSummary({ ...empty, ideas: [idea('1', 'new')] });
    expect(summary.nextStep).toBe('triage');
  });

  it('asks to generate when there is nothing in the pipeline', () => {
    expect(buildSummary(empty).nextStep).toBe('generate');
  });

  it('treats an expanded idea already on the calendar as scheduled, not waiting', () => {
    const summary = buildSummary({
      ...empty,
      ideas: [idea('1', 'expanded')],
      slots: [slot('a', '2026-09-19', '1')],
    });
    expect(summary.nextStep).toBe('generate');
  });
});
