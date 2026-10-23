import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { countVisit, visitSource } from './lib/analytics';
import { rememberSource } from './lib/googleAuth';

// Clean public URLs (/about, /terms, /feedback, /privacy) open that page of the app.
const m = location.pathname.match(/^\/(about|terms|feedback|privacy)\/?$/);
if (m && !location.hash.startsWith('#/app')) history.replaceState(null, '', `/${m[1]}${location.search}#/app/${m[1]}`);
const isAdmin = /^\/admin\/?$/.test(location.pathname);
if (!isAdmin) { countVisit(); rememberSource(visitSource()?.source || ''); }

// /admin is not linked anywhere and is a separate lazy chunk: the public site never downloads it.
const Root = isAdmin ? lazy(() => import('./admin/AdminApp')) : App;
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}><Root /></Suspense>
  </StrictMode>,
);
