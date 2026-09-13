import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavLinks } from '@/components/NavLinks';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { t } from '@/lib/i18n';
import { canAccess, type AppArea, type OnboardingStatus } from '@/lib/onboarding/status';
import type { Language, Theme } from '@/lib/schema';

export function Nav({
  language,
  theme,
  onboarding,
}: {
  language: Language;
  theme: Theme;
  onboarding: OnboardingStatus;
}) {
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
    <nav className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex min-h-10 max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-6 py-1.5">
        <Link
          href="/"
          aria-label={dict.navDashboard}
          className="rounded px-1.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-100 transition-colors hover:bg-neutral-900"
        >
          {dict.appName}
        </Link>

        <span aria-hidden className="h-4 w-px bg-neutral-800" />

        <NavLinks items={items} lockedHint={dict.onboardingLockedHint} />

        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitcher
            current={theme}
            labels={{
              dark: dict.themeDark,
              light: dict.themeLight,
              toDark: dict.themeToDark,
              toLight: dict.themeToLight,
            }}
          />
          <LanguageSwitcher current={language} />
        </div>
      </div>
    </nav>
  );
}
