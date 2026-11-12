import { useId } from 'react';
import {
  FILTERS,
  SORTS,
  type FilterId,
  type NewsletterQuery,
  type SortId,
} from '../../features/dashboard/query';
import { useI18n } from '../../hooks/useI18n';
import { Icon } from '../ui/Icon';

interface NewsletterToolbarProps {
  query: NewsletterQuery;
  onChange: (query: NewsletterQuery) => void;
}

const selectClasses =
  'h-10 w-full rounded-lg border border-slate-300 bg-white pr-8 pl-3 text-sm text-slate-800 shadow-sm hover:border-slate-400';

/** Search box plus filter and sort selects. Fully controlled by the parent. */
export function NewsletterToolbar({ query, onChange }: NewsletterToolbarProps) {
  const { t } = useI18n();
  const searchId = useId();
  const filterId = useId();
  const sortId = useId();

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]" role="search">
      <div>
        <label htmlFor={searchId} className="sr-only">
          {t('toolbar.searchLabel')}
        </label>
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            id={searchId}
            type="search"
            value={query.search}
            onChange={(event) => onChange({ ...query, search: event.target.value })}
            placeholder={t('toolbar.searchPlaceholder')}
            autoComplete="off"
            spellCheck={false}
            maxLength={100}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm shadow-sm placeholder:text-slate-400 hover:border-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={filterId} className="shrink-0 text-sm text-slate-600">
          {t('toolbar.filterLabel')}
        </label>
        <select
          id={filterId}
          value={query.filter}
          onChange={(event) => onChange({ ...query, filter: event.target.value as FilterId })}
          className={selectClasses}
        >
          {FILTERS.map((filter) => (
            <option key={filter} value={filter}>
              {t(`toolbar.filters.${filter}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={sortId} className="shrink-0 text-sm text-slate-600">
          {t('toolbar.sortLabel')}
        </label>
        <select
          id={sortId}
          value={query.sort}
          onChange={(event) => onChange({ ...query, sort: event.target.value as SortId })}
          className={selectClasses}
        >
          {SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {t(`toolbar.sorts.${sort}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
