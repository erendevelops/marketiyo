import 'server-only';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { canAccess, onboardingStatus, type AppArea, type OnboardingStatus } from '@/lib/onboarding/status';
import { getStore } from '@/lib/server/store';

export async function getOnboarding(): Promise<OnboardingStatus> {
  const store = getStore();
  const [settings, brand] = await Promise.all([store.readSettings(), store.readBrand()]);
  return onboardingStatus({ onboarded: settings.onboarded, hasBrand: brand !== null });
}

/**
 * Called at the top of a gated page. An area that is not yet open sends the
 * user home, where the checklist shows exactly which step is next.
 */
export async function requireAccess(area: AppArea): Promise<OnboardingStatus> {
  const status = await getOnboarding();
  if (!canAccess(status, area)) redirect('/');
  return status;
}

/**
 * The same gate for API routes, so skipping the interface does not skip the
 * order. Returns a response to send back, or null when the call may proceed.
 */
export async function blockUnlessAllowed(area: AppArea): Promise<NextResponse | null> {
  const status = await getOnboarding();
  if (canAccess(status, area)) return null;
  return NextResponse.json(
    { error: 'Önce kurulum adımlarını tamamla.', code: 'onboarding-incomplete', current: status.current },
    { status: 403 },
  );
}
