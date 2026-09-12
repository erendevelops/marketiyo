import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavLinks } from '@/components/NavLinks';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/schema';

export function Nav({ language }: { language: Language }) {
  const dict = t(language);

  const items = [
    { href: '/ideas', label: dict.navIdeas },
    { href: '/calendar', label: dict.navCalendar },
    { href: '/ads', label: dict.navAds },
    { href: '/seo', label: dict.navSeo },
    { href: '/brand', label: dict.navBrand },
    { href: '/guide', label: dict.navGuide },
    { href: '/setup', label: dict.navSetup },
  ];

  return (
    <nav className="border-b border-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-sm">
        <span className="font-semibold">{dict.appName}</span>

        <NavLinks items={items} />

        <div className="ml-auto pl-6">
          <LanguageSwitcher current={language} />
        </div>
      </div>
    </nav>
  );
}
