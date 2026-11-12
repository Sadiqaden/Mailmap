import { lazy, Suspense } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import { SessionProvider } from '../features/session/SessionProvider';
import { I18nProvider } from '../i18n/I18nProvider';
import { DashboardPage } from '../pages/DashboardPage';
import { DemoPage } from '../pages/DemoPage';
import { LandingPage } from '../pages/LandingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PrivacyPage } from '../pages/PrivacyPage';

/**
 * The connect page pulls in the Google/Microsoft sign-in code (MSAL alone is large),
 * so it is loaded on demand. Visitors to the landing page and demo never download it.
 */
const ConnectPage = lazy(() =>
  import('../pages/ConnectPage').then((m) => ({ default: m.ConnectPage })),
);

/** One shared session for real accounts. The demo route creates its own (see DemoPage). */
function RealSessionLayout() {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RealSessionLayout />}>
        <Route index element={<LandingPage />} />
        <Route
          path="connect/:provider"
          element={
            <Suspense fallback={null}>
              <ConnectPage />
            </Suspense>
          }
        />
        <Route path="app" element={<DashboardPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="demo" element={<DemoPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </I18nProvider>
  );
}
