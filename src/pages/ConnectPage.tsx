import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonStyles';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Notice } from '../components/ui/Notice';
import { Spinner } from '../components/ui/Spinner';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { appConfig, type AppConfig } from '../integrations/config';
import { GmailAuth } from '../integrations/gmail/gmailAuth';
import { GmailProvider } from '../integrations/gmail/gmailProvider';
import { OutlookAuth } from '../integrations/outlook/outlookAuth';
import { OutlookProvider } from '../integrations/outlook/outlookProvider';
import { toProviderError, type MailProvider, type ProviderErrorCode } from '../integrations/types';
import { NotFoundPage } from './NotFoundPage';

type RealProviderId = 'gmail' | 'outlook';

/** A provider-specific connector: prepare in advance, then connect from a click. */
interface Connector {
  prepare: () => Promise<void>;
  /** Must be called synchronously from the click handler so the popup is allowed. */
  connect: () => Promise<MailProvider>;
}

function createConnector(id: RealProviderId, config: AppConfig): Connector | null {
  if (id === 'gmail') {
    if (!config.googleClientId) return null;
    const auth = new GmailAuth(config.googleClientId);
    return {
      prepare: () => auth.prepare(),
      connect: () => auth.requestAccess().then((token) => GmailProvider.create(token)),
    };
  }
  if (!config.microsoftClientId) return null;
  const auth = new OutlookAuth({
    clientId: config.microsoftClientId,
    authority: config.microsoftAuthority,
    mailScope: config.microsoftMailScope,
  });
  return {
    prepare: () => auth.prepare(),
    connect: () => auth.signIn().then((account) => new OutlookProvider(auth, account.username)),
  };
}

type Phase =
  | { name: 'preparing' }
  | { name: 'ready' }
  | { name: 'connecting' }
  | { name: 'error'; code: ProviderErrorCode; fatal: boolean };

export function ConnectPage({ config = appConfig }: { config?: AppConfig }) {
  const params = useParams();
  const id = params.provider === 'gmail' || params.provider === 'outlook' ? params.provider : null;
  if (!id) return <NotFoundPage />;
  // `key` resets all state when switching between /connect/gmail and /connect/outlook.
  return <ConnectView key={id} id={id} config={config} />;
}

function ConnectView({ id, config }: { id: RealProviderId; config: AppConfig }) {
  const { t } = useI18n();
  const { connect } = useSession();
  const navigate = useNavigate();
  const connector = useMemo(() => createConnector(id, config), [id, config]);
  const [phase, setPhase] = useState<Phase>({ name: 'preparing' });
  const providerName = id === 'gmail' ? 'Gmail' : 'Outlook';

  useEffect(() => {
    if (!connector) return;
    let cancelled = false;
    connector
      .prepare()
      .then(() => !cancelled && setPhase({ name: 'ready' }))
      .catch(
        (error: unknown) =>
          !cancelled && setPhase({ name: 'error', code: toProviderError(error).code, fatal: true }),
      );
    return () => {
      cancelled = true;
    };
  }, [connector]);

  function handleContinue() {
    if (!connector) return;
    setPhase({ name: 'connecting' });
    connector
      .connect()
      .then((provider) => {
        connect(provider);
        navigate('/app');
      })
      .catch((error: unknown) =>
        setPhase({ name: 'error', code: toProviderError(error).code, fatal: false }),
      );
  }

  if (!connector) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <Card className="p-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('connect.notConfiguredTitle', { provider: providerName })}
            </h1>
            <p className="mt-3 leading-relaxed text-slate-600">
              {t('connect.notConfiguredBody', { provider: providerName })}
            </p>
            <Link to="/demo" className={buttonClasses('primary', 'md', 'mt-6')}>
              {t('connect.tryDemoInstead')}
            </Link>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  const scope =
    id === 'gmail'
      ? { name: t('connect.gmailScopeName'), body: t('connect.gmailScopeBody') }
      : config.microsoftMailScope === 'Mail.ReadBasic'
        ? { name: t('connect.outlookScopeNameBasic'), body: t('connect.outlookScopeBodyBasic') }
        : { name: t('connect.outlookScopeNameRead'), body: t('connect.outlookScopeBodyRead') };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrowRight" className="size-4 rotate-180" /> {t('common.back')}
        </Link>
        <Card className="mt-4 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            {id === 'gmail' ? t('connect.titleGmail') : t('connect.titleOutlook')}
          </h1>
          <p className="mt-2 text-slate-600">{t('connect.intro')}</p>

          <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase">
              {t('connect.permissionTitle')}
            </h2>
            <p className="mt-2 flex items-start gap-2 font-medium text-slate-900">
              <Icon name="lock" className="mt-0.5 size-4 shrink-0 text-brand-600" />
              {scope.name}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{scope.body}</p>
            {id === 'outlook' && (
              <p className="mt-2 text-sm text-slate-600">{t('connect.outlookSignInNote')}</p>
            )}
          </section>

          <section className="mt-6">
            <h2 className="font-semibold text-slate-900">{t('connect.whatHappensTitle')}</h2>
            <ol className="mt-3 space-y-3 text-sm text-slate-700">
              {(['s1', 's2', 's3'] as const).map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">
                    {t(`connect.steps.${step}`, {
                      provider: id === 'gmail' ? 'Google' : 'Microsoft',
                    })}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {id === 'gmail' && (
            <Notice tone="info" className="mt-6">
              {t('connect.gmailVerificationNote')}
            </Notice>
          )}

          {phase.name === 'error' && (
            <Notice tone="error" role="alert" className="mt-6">
              {t(`errors.${phase.code}`)}
            </Notice>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={phase.name !== 'ready' && !(phase.name === 'error' && !phase.fatal)}
              icon={
                phase.name === 'connecting' || phase.name === 'preparing' ? <Spinner /> : undefined
              }
            >
              {id === 'gmail' ? t('connect.continueGmail') : t('connect.continueOutlook')}
            </Button>
            <p className="text-sm text-slate-500" role="status">
              {phase.name === 'preparing' && t('connect.preparing')}
              {phase.name === 'connecting' && t('connect.waiting')}
            </p>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
}
