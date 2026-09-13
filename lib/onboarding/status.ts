/**
 * The steps a user must finish, in order, before the working areas open.
 * Order is strict: a step only unlocks once every step before it is done, so a
 * brand profile saved before the engine was connected does not count yet.
 */
export type OnboardingStepId = 'setup' | 'brand';

export type OnboardingStep = {
  id: OnboardingStepId;
  href: string;
  done: boolean;
  locked: boolean;
};

export type OnboardingStatus = {
  steps: OnboardingStep[];
  current: OnboardingStepId | null;
  complete: boolean;
};

export type AppArea = 'home' | 'setup' | 'guide' | 'brand' | 'ideas' | 'calendar' | 'ads' | 'seo';

const ORDER: { id: OnboardingStepId; href: string }[] = [
  { id: 'setup', href: '/setup' },
  { id: 'brand', href: '/brand' },
];

export function onboardingStatus(input: { onboarded: boolean; hasBrand: boolean }): OnboardingStatus {
  const raw: Record<OnboardingStepId, boolean> = {
    setup: input.onboarded,
    brand: input.hasBrand,
  };

  let blocked = false;
  const steps = ORDER.map(({ id, href }) => {
    const locked = blocked;
    const done = !locked && raw[id];
    if (!done) blocked = true;
    return { id, href, done, locked };
  });

  const current = steps.find((step) => !step.done)?.id ?? null;
  return { steps, current, complete: current === null };
}

/** Which step, if any, must be finished before an area opens. */
const REQUIRES: Record<AppArea, OnboardingStepId | 'all' | null> = {
  home: null,
  setup: null,
  guide: null,
  brand: 'setup',
  ideas: 'all',
  calendar: 'all',
  ads: 'all',
  seo: 'all',
};

export function canAccess(status: OnboardingStatus, area: AppArea): boolean {
  const requirement = REQUIRES[area];
  if (requirement === null) return true;
  if (requirement === 'all') return status.complete;
  return status.steps.find((step) => step.id === requirement)?.done ?? false;
}
