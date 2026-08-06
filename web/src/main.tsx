import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Footer } from './components/Footer';
import { Placeholder } from './features/placeholder';
import './styles.scss';

function Header() {
    return (
        <header>
            <div id="header">
                <a className="home-link" href="/news/1">
                    <div className="logo-inner" />
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </a>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <a href="/newest/1">new</a> | <a href="/show/1">show</a> | <a href="/ask/1">ask</a> |{' '}
                            <a href="/jobs/1">jobs</a>
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" />
                </div>
            </div>
        </header>
    );
}

function Shell() {
    return (
        <div className="default">
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Placeholder />
                <Footer />
            </div>
        </div>
    );
}

const router = createBrowserRouter([
    {
        path: '*',
        lazy: async () => ({ Component: Shell }),
    },
]);

createRoot(document.querySelector('app-root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
