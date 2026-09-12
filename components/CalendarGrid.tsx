'use client';

import Link from 'next/link';
import { Busy } from '@/components/Spinner';

import { useMemo, useState } from 'react';
import { Field, inputClass, secondaryButton, selectClass, subtleButton, tinyButton } from '@/components/fields';
import { t } from '@/lib/i18n';
import { platformLabel, slotStatusLabel } from '@/lib/i18n/labels';
import { proposeFill } from '@/lib/calendar/plan';
import { campaignEndDate, campaignsInRange } from '@/lib/calendar/flights';
import type { CalendarSlot, Campaign, Idea, Language, Platform, SlotStatus } from '@/lib/schema';

const PLATFORMS: Platform[] = ['short-video', 'x', 'linkedin', 'instagram-static'];
const STATUS_CYCLE: SlotStatus[] = ['planned', 'ready', 'posted', 'skipped'];

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
  campaigns: Campaign[];
  language: Language;
};

export function CalendarGrid({ initialSlots, ideas, campaigns, language }: Props) {
  const dict = t(language);
  const locale = language === 'tr' ? 'tr-TR' : 'en-GB';

  const [today] = useState(() => isoDate(new Date()));
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
        return date;
      }),
    [weekStart],
  );

  const hookById = useMemo(() => new Map(ideas.map((idea) => [idea.id, idea.hook])), [ideas]);

  const weekRange = useMemo(() => {
    const first = days[0];
    const last = days[6];
    const sameMonth = first.getMonth() === last.getMonth();

    const firstLabel = first.toLocaleDateString(locale, {
      day: 'numeric',
      month: sameMonth ? undefined : 'long',
    });
    const lastLabel = last.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `${firstLabel} – ${lastLabel}`;
  }, [days, locale]);

  const onCurrentWeek = useMemo(
    () => isoDate(days[0]) <= today && today <= isoDate(days[6]),
    [days, today],
  );

  const runningCampaigns = useMemo(
    () => campaignsInRange(campaigns, isoDate(days[0]), isoDate(days[6])),
    [campaigns, days],
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
              status: STATUS_CYCLE[(STATUS_CYCLE.indexOf(slot.status) + 1) % STATUS_CYCLE.length],
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
      setMessage(dict.calendarNothingToFill);
      return;
    }

    void persist(filled);
    setMessage(`${added} ${dict.calendarFilled}`);
  }

  function shiftWeek(direction: -1 | 1) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + direction * 7);
    setWeekStart(next);
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">{dict.calendarTitle}</h1>
      <p className="mb-8 text-sm text-neutral-500">{dict.calendarIntro}</p>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 pb-2">
          <button
            type="button"
            aria-label={dict.calendarPrevWeek}
            className={secondaryButton}
            onClick={() => shiftWeek(-1)}
          >
            &larr;
          </button>
          <span className="min-w-44 text-center text-sm text-neutral-300">{weekRange}</span>
          <button
            type="button"
            aria-label={dict.calendarNextWeek}
            className={secondaryButton}
            onClick={() => shiftWeek(1)}
          >
            &rarr;
          </button>

          {!onCurrentWeek && (
            <button
              type="button"
              className={`${subtleButton} ml-2`}
              onClick={() => setWeekStart(startOfWeek(new Date()))}
            >
              {dict.calendarThisWeek}
            </button>
          )}
        </div>

        <div className="w-44">
          <Field label={dict.ideasPlatform}>
            <select
              className={selectClass}
              value={platform}
              onChange={(event) => setPlatform(event.target.value as Platform)}
            >
              {PLATFORMS.map((item) => (
                <option key={item} value={item}>
                  {platformLabel(dict, item)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <button
          type="button"
          onClick={propose}
          disabled={busy}
          className={`${secondaryButton} mb-0.5 py-2`}
        >
          {busy ? <Busy label={dict.calendarWorking} /> : dict.calendarPropose}
        </button>

        {message && <span className="pb-2 text-sm text-neutral-400">{message}</span>}
      </div>

      <section className="mb-6 rounded border border-neutral-900 p-4">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
          {dict.calendarAds}
        </h2>

        {runningCampaigns.length === 0 ? (
          <p className="text-sm text-neutral-600">{dict.calendarNoAds}</p>
        ) : (
          <ul className="space-y-2">
            {runningCampaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded bg-neutral-900 px-3 py-2 text-sm"
              >
                <Link href={`/ads/${campaign.id}`} className="font-medium hover:underline">
                  {campaign.name}
                </Link>
                <span className="text-xs text-neutral-500">
                  {campaign.startDate} &rarr; {campaignEndDate(campaign)} &middot;{' '}
                  {campaign.totalBudget} {campaign.currency}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3 md:grid-cols-7">
        {days.map((date) => {
          const key = isoDate(date);
          const isToday = key === today;

          return (
              <div
                key={key}
                className={`rounded border p-2 ${
                  isToday ? 'border-neutral-600 bg-neutral-900/40' : 'border-neutral-900'
                }`}
              >
                <p
                  className={`mb-2 text-xs ${isToday ? 'font-medium text-neutral-200' : 'text-neutral-500'}`}
                >
                  {date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}
                  {isToday && ` · ${dict.calendarToday}`}
                </p>

              <div className="space-y-2">
                {slots
                  .filter((slot) => slot.date === key)
                  .map((slot) => (
                    <div key={slot.id} className={`rounded border p-2 ${STATUS_STYLE[slot.status]}`}>
                      <p className="mb-1 text-xs text-neutral-500">
                        {platformLabel(dict, slot.platform)}
                      </p>
                      <p className="mb-2 text-sm leading-snug">
                        {slot.ideaId
                          ? (hookById.get(slot.ideaId) ?? slot.ideaId)
                          : dict.calendarEmptySlot}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          className={tinyButton}
                          onClick={() => cycleStatus(slot.id)}
                        >
                          {slotStatusLabel(dict, slot.status)}
                        </button>
                        {slot.ideaId && (
                          <button
                            type="button"
                            className={tinyButton}
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
                className="mt-2 w-full rounded border border-dashed border-neutral-800 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-200"
                onClick={() => addSlot(key)}
              >
                {dict.calendarAddSlot}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
