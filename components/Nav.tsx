import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavLinks } from '@/components/NavLinks';
import { t } from '@/lib/i18n';
import { canAccess, type AppArea, type OnboardingStatus } from '@/lib/onboarding/status';
import type { Language } from '@/lib/schema';

export function Nav({ language, onboarding }: { language: Language; onboarding: OnboardingStatus }) {
  const dict = t(language);

  const entries: { href: string; label: string; area: AppArea }[] = [
    { href: '/brand', label: dict.navBrand, area: 'brand' },
    { href: '/ideas', label: dict.navIdeas, area: 'ideas' },
    { href: '/calendar', label: dict.navCalendar, area: 'calendar' },
    { href: '/ads', label: dict.navAds, area: 'ads' },
    { href: '/seo', label: dict.navSeo, area: 'seo' },
    { href: '/guide', label: dict.navGuide, area: 'guide' },
    { href: '/setup', label: dict.navSetup, area: 'setup' },
  ];

  const items = entries.map(({ href, label, area }) => ({
    href,
    label,
    locked: !canAccess(onboarding, area),
  }));

  return (
    <nav className="border-b border-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-sm">
        <Link
          href="/"
          aria-label={dict.navDashboard}
          className="rounded px-2 py-1 font-semibold transition-colors hover:bg-neutral-900"
        >
          {dict.appName}
        </Link>

        <NavLinks items={items} lockedHint={dict.onboardingLockedHint} />

        <div className="ml-auto pl-6">
          <LanguageSwitcher current={language} />
        </div>
      </div>
    </nav>
  );
}
