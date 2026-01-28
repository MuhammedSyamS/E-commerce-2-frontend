import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // Ensure Tailwind is loaded early

// We use a constant for the root to ensure it's stable
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Failed to find the root element. Ensure index.html has <div id='root'></div>");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}