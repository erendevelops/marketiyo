import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/schema';

export function Nav({ language }: { language: Language }) {
  const dict = t(language);

  const links = [
    { href: '/ideas', label: dict.navIdeas },
    { href: '/calendar', label: dict.navCalendar },
    { href: '/ads', label: dict.navAds },
    { href: '/seo', label: dict.navSeo },
    { href: '/brand', label: dict.navBrand },
    { href: '/setup', label: dict.navSetup },
  ];

  return (
    <nav className="border-b border-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 p-4 text-sm">
        <span className="font-semibold">{dict.appName}</span>

        <ul className="flex flex-wrap gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-neutral-400 hover:text-neutral-100">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto">
          <LanguageSwitcher current={language} />
        </div>
      </div>
    </nav>
  );
}
