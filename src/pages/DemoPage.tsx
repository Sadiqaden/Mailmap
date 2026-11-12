import { useEffect, useState } from 'react';
import { DemoProvider } from '../demo/demoProvider';
import { SessionProvider } from '../features/session/SessionProvider';
import { useSession } from '../hooks/useSession';
import { DashboardPage } from './DashboardPage';

/** Starts the demo scan automatically once the demo session is ready. */
function AutoStartDemoScan() {
  const { provider, state, startScan } = useSession();
  useEffect(() => {
    if (provider?.isSimulation && state.scan.status === 'idle') startScan(500);
  }, [provider, state.scan.status, startScan]);
  return null;
}

/**
 * Demo route. It gets its OWN SessionProvider, separate from the real-account session,
 * so synthetic data can never be mixed with real mailbox data.
 */
export function DemoPage() {
  // One DemoProvider per visit to the demo page.
  const [provider] = useState(() => new DemoProvider());
  return (
    <SessionProvider initialProvider={provider}>
      <AutoStartDemoScan />
      <DashboardPage />
    </SessionProvider>
  );
}
