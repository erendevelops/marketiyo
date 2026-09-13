import { describe, it, expect } from 'vitest';
import { canAccess, onboardingStatus } from '@/lib/onboarding/status';

describe('onboardingStatus', () => {
  it('starts with setup as the current step and everything else locked', () => {
    const status = onboardingStatus({ onboarded: false, hasBrand: false });
    expect(status.complete).toBe(false);
    expect(status.current).toBe('setup');
    expect(status.steps.map((s) => [s.id, s.done, s.locked])).toEqual([
      ['setup', false, false],
      ['brand', false, true],
    ]);
  });

  it('unlocks the brand step once setup is done', () => {
    const status = onboardingStatus({ onboarded: true, hasBrand: false });
    expect(status.current).toBe('brand');
    expect(status.steps.find((s) => s.id === 'brand')).toMatchObject({ done: false, locked: false });
  });

  it('keeps the order strict: a brand without setup does not count as progress', () => {
    const status = onboardingStatus({ onboarded: false, hasBrand: true });
    expect(status.current).toBe('setup');
    expect(status.complete).toBe(false);
  });

  it('is complete when both steps are done', () => {
    const status = onboardingStatus({ onboarded: true, hasBrand: true });
    expect(status.complete).toBe(true);
    expect(status.current).toBeNull();
  });
});

describe('canAccess', () => {
  const fresh = onboardingStatus({ onboarded: false, hasBrand: false });
  const setupOnly = onboardingStatus({ onboarded: true, hasBrand: false });
  const ready = onboardingStatus({ onboarded: true, hasBrand: true });

  it('always allows the pages needed to get started', () => {
    for (const area of ['home', 'setup', 'guide'] as const) {
      expect(canAccess(fresh, area)).toBe(true);
    }
  });

  it('locks the brand page until setup is done', () => {
    expect(canAccess(fresh, 'brand')).toBe(false);
    expect(canAccess(setupOnly, 'brand')).toBe(true);
  });

  it('locks every working area until onboarding is complete', () => {
    for (const area of ['ideas', 'calendar', 'ads', 'seo'] as const) {
      expect(canAccess(fresh, area)).toBe(false);
      expect(canAccess(setupOnly, area)).toBe(false);
      expect(canAccess(ready, area)).toBe(true);
    }
  });
});
