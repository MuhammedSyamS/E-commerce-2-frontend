import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';

const rootElement = document.getElementById('root');

const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true);
  },
  onOfflineReady() { },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error("CRITICAL: VITE_GOOGLE_CLIENT_ID is missing from environment variables!");
}

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={googleClientId || ""}>
        <HelmetProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </HelmetProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
} 