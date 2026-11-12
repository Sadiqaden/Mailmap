import { PublicLayout } from '../components/layout/PublicLayout';
import { Icon } from '../components/ui/Icon';
import { useI18n } from '../hooks/useI18n';
import type { MessageKey } from '../i18n/translate';

const SECTIONS: { title: MessageKey; body: MessageKey[] }[] = [
  {
    title: 'privacy.permissionsTitle',
    body: ['privacy.permissionsGmail', 'privacy.permissionsOutlook'],
  },
  { title: 'privacy.retrievedTitle', body: ['privacy.retrievedBody'] },
  { title: 'privacy.bodiesTitle', body: ['privacy.bodiesBody'] },
  { title: 'privacy.processingTitle', body: ['privacy.processingBody'] },
  { title: 'privacy.storageTitle', body: ['privacy.storageBody'] },
  { title: 'privacy.refreshTitle', body: ['privacy.refreshBody'] },
  { title: 'privacy.thirdPartiesTitle', body: ['privacy.thirdPartiesBody'] },
];

function ExternalLink({ href, children }: { href: string; children: string }) {
  const { t } = useI18n();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline"
    >
      {children}
      <Icon name="external" className="size-3.5" />
      <span className="sr-only">{t('common.newTab')}</span>
    </a>
  );
}

export function PrivacyPage() {
  const { t } = useI18n();
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t('privacy.title')}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{t('privacy.intro')}</p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-slate-900">{t(section.title)}</h2>
              {section.body.map((key) => (
                <p key={key} className="mt-2 leading-relaxed break-words text-slate-700">
                  {t(key)}
                </p>
              ))}
            </section>
          ))}

          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t('privacy.disconnectTitle')}</h2>
            <p className="mt-2 leading-relaxed text-slate-700">{t('privacy.disconnectBody')}</p>
            <ul className="mt-3 space-y-2">
              <li>
                <ExternalLink href="https://myaccount.google.com/connections">
                  {t('privacy.revokeGoogle')}
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href="https://account.live.com/consent/Manage">
                  {t('privacy.revokeMicrosoft')}
                </ExternalLink>
              </li>
              <li className="text-slate-700">{t('privacy.revokeWork')}</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-900">{t('privacy.limitsTitle')}</h2>
            <p className="mt-2 leading-relaxed text-amber-900">{t('privacy.limitsBody')}</p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
