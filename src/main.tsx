import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ConsentBanner from './components/ConsentBanner';
import SiteBanner from './components/SiteBanner';
import './index.css';
import { CONSENT_EVENT, countVisit, statsOptedOut, visitSource } from './lib/analytics';
import { rememberSource } from './lib/googleAuth';

// Clean public URLs (/about, /scam-shield, /h1b-sprint, ...) open that page of the app.
const m = location.pathname.match(/^\/(about|terms|feedback|privacy|security|accessibility|scam-shield|offer-shield|remote-kit|h1b-sprint)\/?$/);
if (m && !location.hash.startsWith('#/app')) history.replaceState(null, '', `/${m[1]}${location.search}#/app/${m[1]}`);
const isAdmin = /^\/admin\/?$/.test(location.pathname);
if (!isAdmin) {
  countVisit(); // no-op until the visitor consents
  rememberSource(visitSource()?.source || '', !statsOptedOut());
  window.addEventListener(CONSENT_EVENT, () => { if (!statsOptedOut()) { countVisit(); rememberSource('', true); } }, { once: true });
}

// /admin is not linked anywhere and is a separate lazy chunk: the public site never downloads it.
const Root = isAdmin ? lazy(() => import('./admin/AdminApp')) : App;
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {!isAdmin && <SiteBanner />}
    <Suspense fallback={null}><Root /></Suspense>
    {!isAdmin && <ConsentBanner />}
  </StrictMode>,
);
