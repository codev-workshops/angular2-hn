import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Feed } from './components/Feed/Feed';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { SettingsProvider, useSettings } from './context/SettingsContext';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails'));
const User = lazy(() => import('./components/User/User'));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

function AppShell() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={null}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {feedTypes.map((feedType) => (
                            <Route
                                key={feedType}
                                path={`/${feedType}/:page`}
                                element={<Feed key={feedType} feedType={feedType} />}
                            />
                        ))}
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </SettingsProvider>
    );
}
