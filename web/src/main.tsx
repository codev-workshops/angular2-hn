import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { initSettings } from './store/settings';
import { router } from './router';
import './styles.scss';

initSettings();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

createRoot(document.querySelector('app-root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
