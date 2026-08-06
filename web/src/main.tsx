import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { initSettings } from './store/settings';
import { router } from './router';
import './styles.scss';

initSettings();

createRoot(document.querySelector('app-root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
