
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Suppress benign ResizeObserver loop errors that are non-critical browser layout warnings
window.addEventListener(
  'error',
  (e) => {
    if (
      e.message?.includes('ResizeObserver') ||
      e.message?.includes('loop completed with undelivered notifications') ||
      e.message?.includes('loop limit exceeded')
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
  },
  true
);

// Wrap ResizeObserver to run callbacks inside requestAnimationFrame,
// preventing browser ResizeObserver loop notification conflicts
if (typeof window !== 'undefined' && window.ResizeObserver) {
  const OriginalRO = window.ResizeObserver;
  window.ResizeObserver = class SafeResizeObserver extends OriginalRO {
    constructor(callback: ResizeObserverCallback) {
      super((entries, observer) => {
        window.requestAnimationFrame(() => {
          callback(entries, observer);
        });
      });
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
