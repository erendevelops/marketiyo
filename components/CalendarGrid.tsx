'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Busy } from '@/components/Spinner';
import { secondaryButton, subtleButton, tinyButton } from '@/components/fields';
import { campaignEndDate, campaignsInRange } from '@/lib/calendar/flights';
import { t } from '@/lib/i18n';
import { platformLabel } from '@/lib/i18n/labels';
import type { CalendarSlot, Campaign, Idea, Language } from '@/lib/schema';

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

/**
 * The calendar places content that already exists. There are no empty slots to
 * create and then fill: you pick a ready piece and drop it on a day, so every
 * box on the grid stands for something real.
 */
export function CalendarGrid({ initialSlots, ideas, campaigns, language }: Props) {
  const dict = t(language);
  const locale = language === 'tr' ? 'tr-TR' : 'en-GB';

  const [today] = useState(() => isoDate(new Date()));
  const [slots, setSlots] = useState<CalendarSlot[]>(initialSlots);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + offset);
        return date;
      }),
    [weekStart],
  );

  const ideaById = useMemo(() => new Map(ideas.map((idea) => [idea.id, idea])), [ideas]);

  const scheduledIds = useMemo(
    () => new Set(slots.map((slot) => slot.ideaId).filter((id): id is string => id !== null)),
    [slots],
  );

  /** Only content that exists and is not already placed can be scheduled. */
  const placeable = useMemo(
    () =>
      ideas
        .filter((idea) => idea.status === 'expanded' || idea.status === 'kept')
        .filter((idea) => !scheduledIds.has(idea.id))
        .sort((a, b) => {
          const rank = (idea: Idea) => (idea.status === 'expanded' ? 0 : 1);
          return rank(a) === rank(b) ? b.score - a.score : rank(a) - rank(b);
        }),
    [ideas, scheduledIds],
  );

  const onCurrentWeek = isoDate(days[0]) <= today && today <= isoDate(days[6]);

  const weekRange = useMemo(() => {
    const first = days[0];
    const last = days[6];
    const sameMonth = first.getMonth() === last.getMonth();
    return `${first.toLocaleDateString(locale, {
      day: 'numeric',
      month: sameMonth ? undefined : 'long',
    })} – ${last.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`;
  }, [days, locale]);

  const runningCampaigns = useMemo(
    () => campaignsInRange(campaigns, isoDate(days[0]), isoDate(days[6])),
    [campaigns, days],
  );

  async function persist(next: CalendarSlot[]) {
    const previous = slots;
    setSlots(next);
    setBusy(true);
    setMessage(null);

    const response = await fetch('/api/calendar', { method: 'PUT', body: JSON.stringify(next) });
    if (!response.ok) {
      setSlots(previous);
      setMessage(dict.errorGeneric);
    }
    setBusy(false);
  }

  function place(date: string, idea: Idea) {
    setPickerDate(null);
    void persist([
      ...slots,
      {
        id: `${date}-${idea.id}`,
        date,
        platform: idea.platform,
        ideaId: idea.id,
        status: 'planned',
        note: '',
      },
    ]);
  }

  function remove(id: string) {
    void persist(slots.filter((slot) => slot.id !== id));
  }

  function togglePosted(id: string) {
    void persist(
      slots.map((slot) =>
        slot.id === id ? { ...slot, status: slot.status === 'posted' ? 'planned' : 'posted' } : slot,
      ),
    );
  }

  function move(id: string, direction: -1 | 1) {
    void persist(
      slots.map((slot) => {
        if (slot.id !== id) return slot;
        const date = new Date(`${slot.date}T00:00:00`);
        date.setDate(date.getDate() + direction);
        return { ...slot, date: isoDate(date) };
      }),
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">{dict.calendarTitle}</h1>
      <p className="mb-6 text-sm text-neutral-500">{dict.calendarIntro}</p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label={dict.calendarPrevWeek}
          className={secondaryButton}
          onClick={() => {
            const next = new Date(weekStart);
            next.setDate(next.getDate() - 7);
            setWeekStart(next);
          }}
        >
          &larr;
        </button>

        <span className="min-w-40 text-center text-sm text-neutral-200">{weekRange}</span>

        <button
          type="button"
          aria-label={dict.calendarNextWeek}
          className={secondaryButton}
          onClick={() => {
            const next = new Date(weekStart);
            next.setDate(next.getDate() + 7);
            setWeekStart(next);
          }}
        >
          &rarr;
        </button>

        {!onCurrentWeek && (
          <button
            type="button"
            className={subtleButton}
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            {dict.calendarThisWeek}
          </button>
        )}

        <span className="ml-auto text-sm text-neutral-500">
          {busy ? (
            <Busy label={dict.calendarWorking} />
          ) : (
            (message ?? `${placeable.length} ${dict.calendarReadyCount}`)
          )}
        </span>
      </div>

      {runningCampaigns.length > 0 && (
        <section className="mb-6 rounded border border-neutral-900 p-4">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
            {dict.calendarAds}
          </h2>
          <ul className="space-y-2">
            {runningCampaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded bg-neutral-900 px-3 py-2 text-sm"
              >
                <Link
                  href={`/ads/${campaign.id}`}
                  className="font-medium transition-colors hover:text-white"
                >
                  {campaign.name}
                </Link>
                <span className="text-xs text-neutral-500">
                  {campaign.startDate} &rarr; {campaignEndDate(campaign)} &middot;{' '}
                  {campaign.totalBudget} {campaign.currency}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-3 md:grid-cols-7">
        {days.map((date) => {
          const key = isoDate(date);
          const isToday = key === today;
          const daySlots = slots.filter((slot) => slot.date === key);

          return (
            <div
              key={key}
              className={`flex min-h-40 flex-col rounded border p-2 ${
                isToday ? 'border-neutral-600 bg-neutral-900/40' : 'border-neutral-900'
              }`}
            >
              <p
                className={`mb-2 text-xs ${
                  isToday ? 'font-medium text-neutral-200' : 'text-neutral-500'
                }`}
              >
                {date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}
                {isToday && ` · ${dict.calendarToday}`}
              </p>

              <div className="mb-2 space-y-2">
                {daySlots.map((slot) => {
                  const idea = slot.ideaId ? ideaById.get(slot.ideaId) : undefined;
                  const posted = slot.status === 'posted';

                  return (
                    <article
                      key={slot.id}
                      className={`rounded border p-2 text-xs ${
                        posted
                          ? 'border-emerald-900 bg-emerald-950/30 text-neutral-500'
                          : 'border-neutral-800'
                      }`}
                    >
                      <p className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
                        {platformLabel(dict, slot.platform)}
                      </p>

                      <p className={`mb-2 leading-snug ${posted ? 'line-through' : ''}`}>
                        {idea ? idea.hook : dict.calendarMissingIdea}
                      </p>

                      <label className="mb-2 flex cursor-pointer items-center gap-2 text-[11px] text-neutral-400 transition-colors hover:text-neutral-100">
                        <input
                          type="checkbox"
                          className="cursor-pointer accent-emerald-500"
                          checked={posted}
                          onChange={() => togglePosted(slot.id)}
                        />
                        {dict.calendarPosted}
                      </label>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label={dict.calendarMoveEarlier}
                          className={tinyButton}
                          onClick={() => move(slot.id, -1)}
                        >
                          &larr;
                        </button>
                        <button
                          type="button"
                          aria-label={dict.calendarMoveLater}
                          className={tinyButton}
                          onClick={() => move(slot.id, 1)}
                        >
                          &rarr;
                        </button>
                        {idea && (
                          <Link
                            href={`/ideas/${idea.id}`}
                            aria-label={dict.calendarOpenContent}
                            className={tinyButton}
                          >
                            &#8599;
                          </Link>
                        )}
                        <button
                          type="button"
                          aria-label={dict.calendarRemove}
                          className={`${tinyButton} ml-auto`}
                          onClick={() => remove(slot.id)}
                        >
                          &times;
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={placeable.length === 0}
                onClick={() => setPickerDate(pickerDate === key ? null : key)}
                className="mt-auto w-full cursor-pointer rounded border border-dashed border-neutral-800 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {placeable.length === 0 ? dict.calendarNothingReady : dict.calendarPlace}
              </button>
            </div>
          );
        })}
      </div>

      {pickerDate && (
        <section className="mt-6 rounded border border-neutral-800 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {dict.calendarPickFor} {pickerDate}
            </h2>
            <button type="button" className={subtleButton} onClick={() => setPickerDate(null)}>
              {dict.calendarCancel}
            </button>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {placeable.map((idea) => (
              <li key={idea.id}>
                <button
                  type="button"
                  onClick={() => place(pickerDate, idea)}
                  className="w-full cursor-pointer rounded border border-neutral-800 p-3 text-left transition-colors hover:border-neutral-600 hover:bg-neutral-900"
                >
                  <span className="mb-1 block text-[10px] uppercase tracking-wide text-neutral-500">
                    {platformLabel(dict, idea.platform)}
                    {idea.status === 'kept' && ` · ${dict.calendarNotExpanded}`}
                  </span>
                  <span className="block text-sm leading-snug">{idea.hook}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
