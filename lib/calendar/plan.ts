import type { CalendarSlot, Idea } from '@/lib/schema';

const ELIGIBLE: Idea['status'][] = ['kept', 'expanded'];

/** Fills empty slots with unscheduled ideas. Expanded ideas win over merely kept ones. */
export function proposeFill(input: { slots: CalendarSlot[]; ideas: Idea[] }): CalendarSlot[] {
  const taken = new Set(
    input.slots.map((slot) => slot.ideaId).filter((id): id is string => id !== null),
  );

  const rank = (idea: Idea) => (idea.status === 'expanded' ? 0 : 1);

  const eligible = input.ideas
    .filter((idea) => ELIGIBLE.includes(idea.status))
    .filter((idea) => !taken.has(idea.id))
    .sort((a, b) => (rank(a) === rank(b) ? b.score - a.score : rank(a) - rank(b)));

  return input.slots.map((slot) => {
    if (slot.ideaId) return slot;

    const index = eligible.findIndex((idea) => idea.platform === slot.platform);
    if (index === -1) return slot;

    const [chosen] = eligible.splice(index, 1);
    taken.add(chosen.id);
    return { ...slot, ideaId: chosen.id };
  });
}
