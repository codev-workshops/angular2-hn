import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';

import './app.component.scss';
import { FooterComponent } from './core/footer/FooterComponent';
import { HeaderComponent } from './core/header/HeaderComponent';
import { FeedComponent } from './feeds/feed/FeedComponent';
import { scope } from './shared/scope';
import { useSettings } from './shared/services/use-settings';

const ng = scope('app');

// Mirrors the two lazily loaded Angular modules (`item-details`, `user`).
const ItemDetailsComponent = lazy(() =>
    import('./item-details/ItemDetailsComponent').then((module) => ({ default: module.ItemDetailsComponent }))
);
const UserComponent = lazy(() => import('./user/UserComponent').then((module) => ({ default: module.UserComponent })));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

declare const ga: (...args: unknown[]) => void;

function AnalyticsPageView() {
    const location = useLocation();
    const url = `${location.pathname}${location.search}${location.hash}`;
    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', url);
            ga('send', 'pageview');
        }
    }, [url]);
    return null;
}

export function App() {
    const settings = useSettings();
    return (
        <div {...ng} className={settings.theme}>
            <div {...ng} className="body-cover"></div>
            <div {...ng} className="wrapper">
                <HeaderComponent />
                <router-outlet {...ng}></router-outlet>
                <AnalyticsPageView />
                <Suspense fallback={null}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {feedTypes.map((feedType) => (
                            <Route
                                key={feedType}
                                path={`/${feedType}/:page`}
                                element={<FeedComponent key={feedType} feedType={feedType} />}
                            />
                        ))}
                        <Route path="/item/:id" element={<ItemDetailsComponent />} />
                        <Route path="/user/:id" element={<UserComponent />} />
                    </Routes>
                </Suspense>
                <FooterComponent />
            </div>
        </div>
    );
}
