import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import './styles.scss';
import { App } from './App';

// No <StrictMode>: its development-only double rendering would fire every data
// fetch twice, which the Angular app does not do.
createRoot(document.querySelector('app-root') as HTMLElement).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
