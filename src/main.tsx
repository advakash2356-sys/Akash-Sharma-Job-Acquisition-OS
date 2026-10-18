import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import ApiKeySettings from './components/ApiKeySettings';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <App />
      <ApiKeySettings />
    </>
  </StrictMode>,
);
