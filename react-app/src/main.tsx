import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles must be loaded before any component styles so that component
// rules win specificity ties against the theme engine, as they do in Angular.
import './styles/styles.scss';
import './styles/app.scss';

import { App } from './App';

const container = document.querySelector('app-root');

createRoot(container as Element).render(
    <StrictMode>
        <App />
    </StrictMode>
);
