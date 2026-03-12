import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // Ensure Tailwind is loaded early

// We use a constant for the root to ensure it's stable
const rootElement = document.getElementById('root');


import { HelmetProvider } from 'react-helmet-async';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';

// Auto-update Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Force the browser to bypass cache and reload if a new version is waiting
    updateSW(true);
  },
  onOfflineReady() {
  },
});

if (!rootElement) {
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <HelmetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}
