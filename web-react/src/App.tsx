import { Routes, Route } from 'react-router-dom';
import { useSettingsStore } from './stores/settings';
import { ItemHarness } from './harness/ItemHarness';

export function App() {
  const theme = useSettingsStore((s) => s.theme);

  return (
    <div className={theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Routes>
          {/* TEMPORARY harness routes — removed in the final routing wave */}
          <Route path="/harness/item" element={<ItemHarness />} />
          <Route path="*" element={<p>web-react scaffold — real routes land in the final wave</p>} />
        </Routes>
      </div>
    </div>
  );
}
