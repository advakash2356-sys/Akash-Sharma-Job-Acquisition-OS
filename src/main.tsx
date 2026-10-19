import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { countVisit } from './lib/analytics';

// Clean public URLs (/about, /terms, /feedback, /privacy) open that page of the app.
const m = location.pathname.match(/^\/(about|terms|feedback|privacy)\/?$/);
if (m && !location.hash.startsWith('#/app')) history.replaceState(null, '', `/${m[1]}${location.search}#/app/${m[1]}`);
countVisit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
