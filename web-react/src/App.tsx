import { Routes, Route } from 'react-router-dom';
import { useSettingsStore } from './stores/settings';
import { ItemHarness } from './harness/ItemHarness';
import { ShellHarness } from './harness/ShellHarness';
import { FeedHarness } from './harness/FeedHarness';
import { ItemDetailsHarness } from './harness/ItemDetailsHarness';
import { UserHarness } from './harness/UserHarness';
import './App.scss';

export function App() {
  const theme = useSettingsStore((s) => s.theme);

  return (
    <div className={theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Routes>
          {/* TEMPORARY harness routes — removed in the final routing wave */}
          <Route path="/harness/item" element={<ItemHarness />} />
          <Route path="/harness/shell" element={<ShellHarness />} />
          <Route path="/harness/feed/:page" element={<FeedHarness />} />
          <Route path="/harness/item-details/:id" element={<ItemDetailsHarness />} />
          <Route path="/harness/user/:id" element={<UserHarness />} />
          <Route path="*" element={<p>web-react scaffold — real routes land in the final wave</p>} />
        </Routes>
      </div>
    </div>
  );
}
