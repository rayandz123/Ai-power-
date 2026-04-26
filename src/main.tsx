import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update capability
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Update found, reloading...');
    // autoUpdate in vite.config handles this, but we could trigger it manually if needed:
    // updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
});

// Periodically check for updates (every 2 hours)
setInterval(() => {
  updateSW(true);
}, 2 * 60 * 60 * 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
