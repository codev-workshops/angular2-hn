import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Footer } from './components/Footer';
import { Header } from './core/Header';
import { useSettingsStore } from './store/settings';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function App() {
    const theme = useSettingsStore((state) => state.theme);
    const location = useLocation();

    useEffect(() => {
        if (window.ga) {
            const url = `${location.pathname}${location.search}${location.hash}`;
            window.ga('set', 'page', url);
            window.ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}
