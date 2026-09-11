import Link from 'next/link';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/schema';

export function Nav({ language }: { language: Language }) {
  const dict = t(language);

  const links = [
    { href: '/ideas', label: dict.navIdeas },
    { href: '/calendar', label: dict.navCalendar },
    { href: '/brand', label: dict.navBrand },
    { href: '/setup', label: dict.navSetup },
  ];

  return (
    <nav className="border-b border-neutral-900">
      <ul className="mx-auto flex max-w-6xl gap-6 p-4 text-sm">
        <li className="font-semibold">{dict.appName}</li>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-neutral-400 hover:text-neutral-100">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
