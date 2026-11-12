import type { Newsletter } from '../../types/newsletter';
import { normalizeForSearch } from '../../utils/text';
import { isRecentlyActive } from '../discovery/frequency';

export const FILTERS = ['all', 'recent', 'unsubscribe-available', 'manual', 'selected'] as const;
export type FilterId = (typeof FILTERS)[number];

export const SORTS = ['recent', 'count', 'name'] as const;
export type SortId = (typeof SORTS)[number];

export interface NewsletterQuery {
  search: string;
  filter: FilterId;
  sort: SortId;
}

export interface QueryContext {
  selected: ReadonlySet<string>;
  now: number;
  /** Locale used for alphabetical sorting, e.g. "nb" sorts Æ/Ø/Å after Z. */
  locale: string;
}

export function matchesSearch(newsletter: Newsletter, search: string): boolean {
  const needle = normalizeForSearch(search);
  if (!needle) return true;
  return [newsletter.name, newsletter.email, newsletter.domain, newsletter.listId ?? '']
    .map(normalizeForSearch)
    .some((field) => field.includes(needle));
}

export function matchesFilter(
  newsletter: Newsletter,
  filter: FilterId,
  context: Pick<QueryContext, 'selected' | 'now'>,
): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'recent':
      return isRecentlyActive(newsletter.lastSeenAt, context.now);
    case 'unsubscribe-available':
      return newsletter.unsubscribe.primary !== null;
    case 'manual':
      // Anything Mailmap cannot request on the user's behalf.
      return newsletter.unsubscribe.primary?.kind !== 'one-click';
    case 'selected':
      return context.selected.has(newsletter.key);
  }
}

export function compareNewsletters(sort: SortId, locale: string) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const byName = (a: Newsletter, b: Newsletter) => collator.compare(a.name, b.name);
  return (a: Newsletter, b: Newsletter): number => {
    switch (sort) {
      case 'name':
        return byName(a, b) || a.key.localeCompare(b.key);
      case 'count':
        return b.messageCount - a.messageCount || byName(a, b);
      case 'recent':
        return b.lastSeenAt - a.lastSeenAt || byName(a, b);
    }
  };
}

/** Search → filter → sort. Returns a new array; the input is not modified. */
export function applyQuery(
  newsletters: readonly Newsletter[],
  query: NewsletterQuery,
  context: QueryContext,
): Newsletter[] {
  return newsletters
    .filter((n) => matchesSearch(n, query.search) && matchesFilter(n, query.filter, context))
    .sort(compareNewsletters(query.sort, context.locale));
}
