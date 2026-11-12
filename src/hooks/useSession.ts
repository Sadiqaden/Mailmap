import { use } from 'react';
import { SessionContext, type SessionContextValue } from '../features/session/sessionContext';

/** Access the current mailbox session. Must be used inside a `SessionProvider`. */
export function useSession(): SessionContextValue {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}
