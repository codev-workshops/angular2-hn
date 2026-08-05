import { Navigate, Route, Routes } from 'react-router-dom';
import { useSettingsStore } from './stores/settings';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FeedPage } from './pages/FeedPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';
import './App.scss';

export function App() {
  const theme = useSettingsStore((s) => s.theme);

  return (
    <div className={theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<FeedPage feedType="news" />} />
          <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
          <Route path="/show/:page" element={<FeedPage feedType="show" />} />
          <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
          <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/user/:id" element={<UserPage />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
