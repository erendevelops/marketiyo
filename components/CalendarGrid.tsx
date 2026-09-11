'use client';

import { useMemo, useState } from 'react';
import { inputClass } from '@/components/fields';
import { t } from '@/lib/i18n';
import { proposeFill } from '@/lib/calendar/plan';
import type { CalendarSlot, Idea, Language, Platform, SlotStatus } from '@/lib/schema';

const PLATFORMS: Platform[] = ['short-video', 'x', 'linkedin', 'instagram-static'];
const STATUS_CYCLE: SlotStatus[] = ['planned', 'ready', 'posted', 'skipped'];

const PLATFORM_LABEL: Record<Platform, string> = {
  'short-video': 'Kisa video',
  x: 'X',
  linkedin: 'LinkedIn',
  'instagram-static': 'Instagram',
};

const STATUS_STYLE: Record<SlotStatus, string> = {
  planned: 'border-neutral-800',
  ready: 'border-emerald-800',
  posted: 'border-sky-800 opacity-70',
  skipped: 'border-neutral-900 opacity-40',
};

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

type Props = {
  initialSlots: CalendarSlot[];
  ideas: Idea[];
  language: Language;
};

export function CalendarGrid({ initialSlots, ideas, language }: Props) {
  const dict = t(language);
  const [slots, setSlots] = useState<CalendarSlot[]>(initialSlots);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [platform, setPlatform] = useState<Platform>('short-video');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + offset);
        return isoDate(date);
      }),
    [weekStart],
  );

  const hookById = useMemo(
    () => new Map(ideas.map((idea) => [idea.id, idea.hook])),
    [ideas],
  );

  async function persist(next: CalendarSlot[]) {
    const previous = slots;
    setSlots(next);
    setBusy(true);

    const response = await fetch('/api/calendar', { method: 'PUT', body: JSON.stringify(next) });
    if (!response.ok) {
      setSlots(previous);
      setMessage(dict.errorGeneric);
    }
    setBusy(false);
  }

  function addSlot(date: string) {
    void persist([
      ...slots,
      {
        id: `${date}-${platform}-${Date.now()}`,
        date,
        platform,
        ideaId: null,
        status: 'planned',
        note: '',
      },
    ]);
  }

  function cycleStatus(id: string) {
    void persist(
      slots.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              status:
                STATUS_CYCLE[(STATUS_CYCLE.indexOf(slot.status) + 1) % STATUS_CYCLE.length],
            }
          : slot,
      ),
    );
  }

  function clearSlot(id: string) {
    void persist(slots.map((slot) => (slot.id === id ? { ...slot, ideaId: null } : slot)));
  }

  function propose() {
    const filled = proposeFill({ slots, ideas });
    const added = filled.filter((slot, index) => slot.ideaId !== slots[index].ideaId).length;
    if (added === 0) {
      setMessage(dict.ideasEmpty);
      return;
    }
    void persist(filled);
    setMessage(String(added));
  }

  function shiftWeek(direction: -1 | 1) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + direction * 7);
    setWeekStart(next);
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">{dict.calendarTitle}</h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded border border-neutral-700 px-3 py-1 text-sm"
          onClick={() => shiftWeek(-1)}
        >
          &larr;
        </button>
        <span className="text-sm text-neutral-400">{days[0]}</span>
        <button
          type="button"
          className="rounded border border-neutral-700 px-3 py-1 text-sm"
          onClick={() => shiftWeek(1)}
        >
          &rarr;
        </button>

        <select
          aria-label={dict.brandPlatforms}
          className={`${inputClass} w-auto`}
          value={platform}
          onChange={(event) => setPlatform(event.target.value as Platform)}
        >
          {PLATFORMS.map((item) => (
            <option key={item} value={item}>
              {PLATFORM_LABEL[item]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={propose}
          disabled={busy}
          className="rounded border border-neutral-700 px-3 py-1 text-sm disabled:opacity-40"
        >
          {dict.calendarPropose}
        </button>

        {message && <span className="text-sm text-neutral-400">{message}</span>}
      </div>

      <div className="grid gap-3 md:grid-cols-7">
        {days.map((date) => (
          <div key={date} className="rounded border border-neutral-900 p-2">
            <p className="mb-2 text-xs text-neutral-500">{date.slice(5)}</p>

            <div className="space-y-2">
              {slots
                .filter((slot) => slot.date === date)
                .map((slot) => (
                  <div key={slot.id} className={`rounded border p-2 ${STATUS_STYLE[slot.status]}`}>
                    <p className="mb-1 text-xs text-neutral-500">
                      {PLATFORM_LABEL[slot.platform]}
                    </p>
                    <p className="mb-2 text-sm leading-snug">
                      {slot.ideaId
                        ? (hookById.get(slot.ideaId) ?? slot.ideaId)
                        : dict.calendarEmptySlot}
                    </p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="rounded border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
                        onClick={() => cycleStatus(slot.id)}
                      >
                        {slot.status}
                      </button>
                      {slot.ideaId && (
                        <button
                          type="button"
                          className="rounded border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
                          onClick={() => clearSlot(slot.id)}
                        >
                          {dict.calendarClear}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <button
              type="button"
              className="mt-2 w-full rounded border border-dashed border-neutral-800 py-1 text-xs text-neutral-500"
              onClick={() => addSlot(date)}
            >
              {dict.calendarAddSlot}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
