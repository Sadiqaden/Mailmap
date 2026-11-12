import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { SiteHeader } from './SiteHeader';
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id={MAIN_CONTENT_ID} className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
