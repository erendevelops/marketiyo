import { describe, it, expect } from 'vitest';
import { proposeFill } from '@/lib/calendar/plan';
import type { CalendarSlot, Idea } from '@/lib/schema';

function idea(id: string, status: Idea['status'], platform: Idea['platform'] = 'x'): Idea {
  return {
    id,
    createdAt: '2026-09-11T00:00:00.000Z',
    batchId: 'b1',
    platform,
    format: 'thread',
    angle: 'education',
    hook: `hook-${id}`,
    premise: 'p',
    whyItWorks: 'w',
    audienceRef: 'A',
    score: 5,
    tags: [],
    status,
    promptVersion: 'idea-batch@1',
  };
}

function slot(
  id: string,
  ideaId: string | null,
  platform: CalendarSlot['platform'] = 'x',
): CalendarSlot {
  return { id, date: '2026-09-14', platform, ideaId, status: 'planned', note: '' };
}

describe('proposeFill', () => {
  it('fills empty slots with eligible ideas', () => {
    const filled = proposeFill({ slots: [slot('s1', null)], ideas: [idea('i1', 'kept')] });
    expect(filled[0].ideaId).toBe('i1');
  });

  it('never touches a slot that already has an idea', () => {
    const filled = proposeFill({ slots: [slot('s1', 'existing')], ideas: [idea('i1', 'kept')] });
    expect(filled[0].ideaId).toBe('existing');
  });

  it('skips ideas that are new or rejected', () => {
    const filled = proposeFill({
      slots: [slot('s1', null)],
      ideas: [idea('i1', 'new'), idea('i2', 'rejected')],
    });
    expect(filled[0].ideaId).toBeNull();
  });

  it('matches the slot platform', () => {
    const filled = proposeFill({
      slots: [slot('s1', null, 'linkedin')],
      ideas: [idea('i1', 'kept', 'x')],
    });
    expect(filled[0].ideaId).toBeNull();
  });

  it('never assigns the same idea twice', () => {
    const filled = proposeFill({
      slots: [slot('s1', null), slot('s2', null)],
      ideas: [idea('i1', 'expanded')],
    });
    expect(filled.filter((s) => s.ideaId === 'i1')).toHaveLength(1);
    expect(filled[1].ideaId).toBeNull();
  });

  it('does not reuse an idea already scheduled in another slot', () => {
    const filled = proposeFill({
      slots: [slot('s1', 'i1'), slot('s2', null)],
      ideas: [idea('i1', 'expanded')],
    });
    expect(filled[1].ideaId).toBeNull();
  });

  it('prefers expanded ideas over merely kept ones', () => {
    const filled = proposeFill({
      slots: [slot('s1', null)],
      ideas: [idea('i1', 'kept'), idea('i2', 'expanded')],
    });
    expect(filled[0].ideaId).toBe('i2');
  });

  it('returns the slots untouched when nothing is eligible', () => {
    const slots = [slot('s1', null)];
    expect(proposeFill({ slots, ideas: [] })).toEqual(slots);
  });
});
