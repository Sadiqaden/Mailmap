import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { DashboardPreview } from '../components/landing/DashboardPreview';
import { PublicLayout } from '../components/layout/PublicLayout';
import { buttonClasses } from '../components/ui/buttonStyles';
import { Icon, type IconName } from '../components/ui/Icon';
import { useI18n } from '../hooks/useI18n';
import type { MessageKey } from '../i18n/translate';

const BENEFITS: { icon: IconName; title: MessageKey; body: MessageKey }[] = [
  {
    icon: 'search',
    title: 'landing.benefits.discoverTitle',
    body: 'landing.benefits.discoverBody',
  },
  {
    icon: 'filter',
    title: 'landing.benefits.organizeTitle',
    body: 'landing.benefits.organizeBody',
  },
  {
    icon: 'check',
    title: 'landing.benefits.unsubscribeTitle',
    body: 'landing.benefits.unsubscribeBody',
  },
  { icon: 'shield', title: 'landing.benefits.privacyTitle', body: 'landing.benefits.privacyBody' },
];

const PRIVACY_POINTS: MessageKey[] = [
  'landing.privacyPoints.p1',
  'landing.privacyPoints.p2',
  'landing.privacyPoints.p3',
  'landing.privacyPoints.p4',
];

const FAQ: [MessageKey, MessageKey][] = [
  ['landing.faq.q1', 'landing.faq.a1'],
  ['landing.faq.q2', 'landing.faq.a2'],
  ['landing.faq.q3', 'landing.faq.a3'],
  ['landing.faq.q4', 'landing.faq.a4'],
  ['landing.faq.q5', 'landing.faq.a5'],
];

/** Scroll to `#section` links, which React Router does not do by itself. */
function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);
}

export function LandingPage() {
  const { t } = useI18n();
  useScrollToHash();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise-in">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <Icon name="mail" className="size-4" />
              {t('landing.eyebrow')}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
              {t('landing.title')}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-slate-600">
              {t('landing.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/connect/gmail" className={buttonClasses('primary', 'lg')}>
                {t('landing.ctaGmail')}
              </Link>
              <Link to="/connect/outlook" className={buttonClasses('primary', 'lg')}>
                {t('landing.ctaOutlook')}
              </Link>
              <Link to="/demo" className={buttonClasses('secondary', 'lg')}>
                {t('landing.ctaDemo')}
                <Icon name="arrowRight" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">{t('landing.ctaNote')}</p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {t('landing.problemTitle')}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{t('landing.problemBody')}</p>
      </section>

      {/* Benefits */}
      <section id="features" className="scroll-mt-20 mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          {t('landing.benefitsTitle')}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={benefit.icon} className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{t(benefit.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(benefit.body)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Privacy */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Icon name="lock" className="size-5" />
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {t('landing.privacyTitle')}
            </h2>
          </div>
          <p className="mt-4 text-slate-600">{t('landing.privacyBody')}</p>
          <ul className="mt-6 space-y-3">
            {PRIVACY_POINTS.map((key) => (
              <li key={key} className="flex gap-3 text-slate-700">
                <Icon name="check" className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <span className="leading-relaxed">{t(key)}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/privacy"
            className="mt-6 inline-flex items-center gap-1 font-medium text-brand-700 hover:underline"
          >
            {t('landing.privacyLink')}
            <Icon name="arrowRight" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          {t('landing.faqTitle')}
        </h2>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQ.map(([question, answer]) => (
            <details key={question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                {t(question)}
                <Icon
                  name="chevronDown"
                  className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{t(answer)}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
