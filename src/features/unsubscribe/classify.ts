import type { UnsubscribeMethod, UnsubscribeOptions } from '../../types/newsletter';
import { checkHttpUrl, checkMailtoUrl } from '../../utils/url';
import { hasDkimPass, isOneClickPost, parseListUnsubscribe } from '../discovery/headers';

export interface UnsubscribeHeaders {
  listUnsubscribe: string | null;
  listUnsubscribePost: string | null;
  authenticationResults: string | null;
}

/** Lower number = preferred. */
const PRIORITY: Record<string, number> = {
  'one-click': 0,
  'web-secure': 1,
  mailto: 2,
  'web-insecure': 3,
};

function priorityOf(method: UnsubscribeMethod): number {
  if (method.kind === 'web') return PRIORITY[method.insecure ? 'web-insecure' : 'web-secure'] ?? 9;
  return PRIORITY[method.kind] ?? 9;
}

/**
 * Turn raw unsubscribe headers into validated, ranked unsubscribe methods.
 *
 * A URL is offered as *one-click* only when all of these hold:
 *  1. it is HTTPS and passes `checkHttpUrl`,
 *  2. the message has `List-Unsubscribe-Post: List-Unsubscribe=One-Click`,
 *  3. the receiving provider reported `dkim=pass` (RFC 8058 §4 requires a DKIM signature).
 * Otherwise a valid http(s) URL is only offered as a web page the user opens themselves.
 */
export function classifyUnsubscribe(headers: UnsubscribeHeaders): UnsubscribeOptions {
  const uris = parseListUnsubscribe(headers.listUnsubscribe);
  const oneClickAllowed =
    isOneClickPost(headers.listUnsubscribePost) && hasDkimPass(headers.authenticationResults);

  const methods: UnsubscribeMethod[] = [];
  let rejectedCount = 0;

  for (const uri of uris) {
    const scheme = uri.slice(0, uri.indexOf(':') + 1).toLowerCase();

    if (scheme === 'mailto:') {
      const mail = checkMailtoUrl(uri);
      if (mail.ok) {
        methods.push({
          kind: 'mailto',
          address: mail.address,
          subject: mail.subject,
          body: mail.body,
          href: mail.href,
        });
      } else {
        rejectedCount++;
      }
      continue;
    }

    const web = checkHttpUrl(uri, { allowHttp: true });
    if (!web.ok) {
      rejectedCount++;
      continue;
    }
    const url = web.url.toString();
    const host = web.url.hostname;
    if (oneClickAllowed && !web.insecure) {
      methods.push({ kind: 'one-click', url, host });
    } else {
      methods.push({ kind: 'web', url, host, insecure: web.insecure });
    }
  }

  // Stable sort keeps the sender's own order within the same priority.
  const ranked = methods
    .map((method, index) => ({ method, index }))
    .sort((a, b) => priorityOf(a.method) - priorityOf(b.method) || a.index - b.index)
    .map(({ method }) => method);

  return {
    primary: ranked[0] ?? null,
    alternatives: ranked.slice(1),
    rejectedCount,
  };
}
