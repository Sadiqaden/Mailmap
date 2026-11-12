import { useI18n } from '../../hooks/useI18n';
import { Avatar } from '../ui/Avatar';
import { LogoMark } from '../ui/Logo';

/** Invented rows for the illustration only. Never shown as account data. */
const PREVIEW_ROWS = [
  { name: 'The Morning Byte', meta: '42', tone: 'bg-emerald-50 text-emerald-700', width: 'w-20' },
  { name: 'Nordlys Weekly', meta: '12', tone: 'bg-emerald-50 text-emerald-700', width: 'w-16' },
  { name: 'Pixel & Pine', meta: '9', tone: 'bg-brand-50 text-brand-700', width: 'w-24' },
  { name: 'Kaffeklubben', meta: '6', tone: 'bg-brand-50 text-brand-700', width: 'w-14' },
];

/**
 * A stylised, original illustration of the dashboard built from HTML, not a screenshot.
 * Hidden from assistive technology except for its label, because the content is decorative.
 */
export function DashboardPreview() {
  const { t } = useI18n();
  return (
    <figure className="relative">
      <div
        role="img"
        aria-label={t('landing.previewLabel')}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-dialog)]"
      >
        <div aria-hidden="true">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <LogoMark className="size-5" />
            <span className="h-2 w-16 rounded-full bg-slate-200" />
            <span className="ml-auto h-6 w-14 rounded-md bg-slate-100" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            {['24', '271', '19'].map((value, index) => (
              <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="block h-1.5 w-10 rounded-full bg-slate-200" />
                <span className="mt-2 block text-lg font-semibold text-slate-800 tabular-nums">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="grid gap-2 px-4 pb-4 xl:grid-cols-2">
            {PREVIEW_ROWS.map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <span className="size-3 rounded border border-slate-300" />
                <Avatar name={row.name} seed={row.name} className="size-8 rounded-lg text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{row.name}</p>
                  <span className={`mt-1 block h-1.5 ${row.width} rounded-full bg-slate-200`} />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.tone}`}>
                  {row.meta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-slate-500">
        {t('landing.previewCaption')}
      </figcaption>
    </figure>
  );
}
