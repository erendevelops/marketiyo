import Link from 'next/link';
import { primaryButton } from '@/components/fields';
import { t } from '@/lib/i18n';
import type { OnboardingStatus, OnboardingStepId } from '@/lib/onboarding/status';
import type { Language } from '@/lib/schema';

/**
 * Stands in for the dashboard until setup is finished. Only the current step
 * offers an action; finished steps show as done and later ones stay locked, so
 * the order is visible as well as enforced.
 */
export function OnboardingChecklist({
  status,
  language,
}: {
  status: OnboardingStatus;
  language: Language;
}) {
  const dict = t(language);

  const copy: Record<OnboardingStepId, { title: string; body: string }> = {
    setup: { title: dict.onboardingSetupTitle, body: dict.onboardingSetupBody },
    brand: { title: dict.onboardingBrandTitle, body: dict.onboardingBrandBody },
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">{dict.onboardingTitle}</h1>
      <p className="mb-10 text-sm leading-relaxed text-neutral-500">{dict.onboardingIntro}</p>

      <ol className="space-y-4">
        {status.steps.map((step, index) => {
          const isCurrent = step.id === status.current;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex gap-4 rounded border p-5 ${
                isCurrent
                  ? 'border-neutral-600 bg-neutral-900/50'
                  : step.done
                    ? 'border-emerald-950 bg-emerald-950/20'
                    : 'border-neutral-900 opacity-60'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  step.done
                    ? 'bg-emerald-700 text-white'
                    : isCurrent
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {step.done ? '✓' : index + 1}
              </span>

              <div className="flex-1">
                <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
                  {dict.onboardingStep} {index + 1}
                  {step.done && ` · ${dict.onboardingDone}`}
                  {step.locked && ` · ${dict.onboardingLocked}`}
                </p>
                <h2 className="mb-1 font-semibold text-neutral-100">{copy[step.id].title}</h2>
                <p className="text-sm leading-relaxed text-neutral-400">{copy[step.id].body}</p>

                {isCurrent && (
                  <Link href={step.href} className={`${primaryButton} mt-4 inline-block`}>
                    {dict.onboardingStart}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
