import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useI18n } from '../../hooks/useI18n';
import { buttonClasses } from '../ui/buttonStyles';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Header for public pages (landing, privacy, connect). Collapses into a menu on small screens. */
export function SiteHeader() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  const links = [
    { to: '/#features', label: t('nav.features') },
    { to: '/privacy', label: t('nav.privacy') },
    { to: '/#faq', label: t('nav.faq') },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="rounded-lg"
          aria-label={`${t('common.appName')} – ${t('nav.home')}`}
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link to="/demo" className={buttonClasses('primary', 'sm')}>
            {t('nav.demo')}
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} className="size-6" />
          <span className="sr-only">{menuOpen ? t('common.closeMenu') : t('common.openMenu')}</span>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="animate-fade-in border-t border-slate-200 bg-white px-4 pb-4 md:hidden"
        >
          <ul className="flex flex-col py-2">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <LanguageSwitcher />
            <Link to="/demo" className={buttonClasses('primary', 'md')}>
              {t('nav.demo')}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
