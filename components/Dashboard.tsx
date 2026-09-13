import Link from 'next/link';
import type { ReactNode } from 'react';
import { primaryButton, secondaryButton } from '@/components/fields';
import type { DashboardSummary, NextStep } from '@/lib/dashboard/summary';
import { t, type Dictionary } from '@/lib/i18n';
import { platformLabel } from '@/lib/i18n/labels';
import type { Language } from '@/lib/schema';

function nextStepCopy(dict: Dictionary, step: NextStep) {
  const map: Record<NextStep, { title: string; body: string; href: string }> = {
    setup: { title: dict.nextSetupTitle, body: dict.nextSetupBody, href: '/setup' },
    brand: { title: dict.nextBrandTitle, body: dict.nextBrandBody, href: '/brand' },
    'post-today': { title: dict.nextPostTodayTitle, body: dict.nextPostTodayBody, href: '/calendar' },
    schedule: { title: dict.nextScheduleTitle, body: dict.nextScheduleBody, href: '/calendar' },
    expand: { title: dict.nextExpandTitle, body: dict.nextExpandBody, href: '/ideas' },
    triage: { title: dict.nextTriageTitle, body: dict.nextTriageBody, href: '/ideas' },
    generate: { title: dict.nextGenerateTitle, body: dict.nextGenerateBody, href: '/ideas' },
  };
  return map[step];
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded border border-neutral-800 p-5">
      <h2 className="mb-4 text-xs uppercase tracking-wide text-neutral-500">{title}</h2>
      <div className="flex-1">{children}</div>
      {action && (
        <Link href={action.href} className={`${secondaryButton} mt-5 self-start`}>
          {action.label}
        </Link>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums text-neutral-100">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

export function Dashboard({ summary, language }: { summary: DashboardSummary; language: Language }) {
  const dict = t(language);
  const locale = language === 'tr' ? 'tr-TR' : 'en-GB';
  const next = nextStepCopy(dict, summary.nextStep);

  const range = (() => {
    const from = new Date(`${summary.week.from}T00:00:00`);
    const to = new Date(`${summary.week.to}T00:00:00`);
    const sameMonth = from.getMonth() === to.getMonth();
    return `${from.toLocaleDateString(locale, {
      day: 'numeric',
      month: sameMonth ? undefined : 'long',
    })} – ${to.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`;
  })();

  const pipeline = [
    { label: dict.dashPipelineNew, value: summary.ideas.new },
    { label: dict.dashPipelineKept, value: summary.ideas.kept },
    { label: dict.dashPipelineExpanded, value: summary.ideas.expanded },
    { label: dict.dashPipelineScheduled, value: summary.ideas.scheduled },
  ];

  return (
    <main className="mx-auto max-w-5xl p-8">
      <p className="mb-1 text-sm text-neutral-500">{dict.dashGreeting}</p>
      <h1 className="mb-8 text-2xl font-semibold">
        {summary.productName ?? dict.dashNoBrand}
      </h1>

      <section className="mb-8 rounded border border-neutral-700 bg-neutral-900/40 p-6">
        <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">{dict.dashNextStep}</p>
        <h2 className="mb-2 text-lg font-semibold text-neutral-50">{next.title}</h2>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-neutral-400">{next.body}</p>
        <Link href={next.href} className={primaryButton}>
          {dict.dashGo}
        </Link>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card title={dict.dashToday} action={{ href: '/calendar', label: dict.dashOpenCalendar }}>
          {summary.today.length === 0 ? (
            <p className="text-sm text-neutral-500">{dict.dashTodayEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {summary.today.map((item) => (
                <li
                  key={item.slotId}
                  className={`rounded border p-3 text-sm ${
                    item.posted
                      ? 'border-emerald-900 bg-emerald-950/30 text-neutral-500'
                      : 'border-neutral-800'
                  }`}
                >
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
                    {platformLabel(dict, item.platform)}
                    {item.posted && ` · ${dict.calendarPosted}`}
                  </p>
                  <p className={item.posted ? 'line-through' : ''}>
                    {item.hook ?? dict.calendarMissingIdea}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`${dict.dashThisWeek} · ${range}`} action={{ href: '/calendar', label: dict.dashOpenCalendar }}>
          <div className="flex gap-10">
            <Stat value={summary.week.scheduled} label={dict.dashScheduled} />
            <Stat value={summary.week.posted} label={dict.dashPosted} />
          </div>

          {summary.week.scheduled > 0 && (
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${(summary.week.posted / summary.week.scheduled) * 100}%` }}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="mb-8">
        <Card title={dict.dashPipeline} action={{ href: '/ideas', label: dict.dashOpenIdeas }}>
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {pipeline.map((stage, index) => (
              <li key={stage.label} className="relative">
                <p className="text-2xl font-semibold tabular-nums text-neutral-100">{stage.value}</p>
                <p className="text-xs text-neutral-500">{stage.label}</p>
                {index < pipeline.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute right-2 top-2 hidden text-neutral-700 sm:block"
                  >
                    &rarr;
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={dict.dashAds} action={{ href: '/ads', label: dict.dashOpenAds }}>
          <div className="mb-4 flex gap-10">
            <Stat value={summary.campaigns.running.length} label={dict.dashAdsRunning} />
            <Stat value={summary.campaigns.total} label={dict.dashAdsTotal} />
          </div>
          {summary.campaigns.running.length > 0 && (
            <ul className="space-y-1 text-sm">
              {summary.campaigns.running.map((campaign) => (
                <li key={campaign.id}>
                  <Link
                    href={`/ads/${campaign.id}`}
                    className="text-neutral-300 transition-colors hover:text-white"
                  >
                    {campaign.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={dict.dashBlog} action={{ href: '/seo', label: dict.dashOpenBlog }}>
          <div className="flex gap-10">
            <Stat value={summary.articles.kept} label={dict.dashBlogKept} />
            <Stat value={summary.articles.drafted} label={dict.dashBlogDrafted} />
          </div>
        </Card>
      </div>
    </main>
  );
}
