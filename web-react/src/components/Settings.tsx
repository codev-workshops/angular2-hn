import { useSettingsStore } from '../stores/settings';
import './Settings.scss';

export function Settings() {
  const openLinkInNewTab = useSettingsStore((s) => s.openLinkInNewTab);
  const theme = useSettingsStore((s) => s.theme);
  const titleFontSize = useSettingsStore((s) => s.titleFontSize);
  const listSpacing = useSettingsStore((s) => s.listSpacing);
  const toggleSettings = useSettingsStore((s) => s.toggleSettings);
  const toggleOpenLinksInNewTab = useSettingsStore((s) => s.toggleOpenLinksInNewTab);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setFont = useSettingsStore((s) => s.setFont);
  const setSpacing = useSettingsStore((s) => s.setSpacing);

  return (
    <div id="popup1" className="overlay">
      <div className="popup">
        <h1>Settings</h1>
        <hr />
        <span className="close" onClick={toggleSettings}>
          &times;
        </span>
        <div className="content">
          <div className="control-section">
            <h2>Links</h2>
            <input
              type="checkbox"
              checked={openLinkInNewTab}
              onChange={toggleOpenLinksInNewTab}
            />
            Open links in a new tab
          </div>
          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="default"
                    checked={theme === 'default'}
                    onChange={() => setTheme('default')}
                    onClick={() => setTheme('default')}
                  />
                  Default
                </label>
              </div>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="night"
                    checked={theme === 'night'}
                    onChange={() => setTheme('night')}
                    onClick={() => setTheme('night')}
                  />
                  Night
                </label>
              </div>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="amoledblack"
                    checked={theme === 'amoledblack'}
                    onChange={() => setTheme('amoledblack')}
                    onClick={() => setTheme('amoledblack')}
                  />
                  Black (AMOLED)
                </label>
              </div>
            </div>
            <div className="control-section">
              <h2>Change Font</h2>
              <div>
                <label>
                  Font size:
                  <input
                    min="1"
                    value={titleFontSize}
                    name="theme"
                    type="number"
                    onChange={(e) => setFont(e.target.value)}
                    onKeyUp={(e) => setFont((e.target as HTMLInputElement).value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  List spacing:
                  <input
                    min="0"
                    value={listSpacing}
                    name="theme"
                    type="number"
                    onChange={(e) => setSpacing(e.target.value)}
                    onKeyUp={(e) => setSpacing((e.target as HTMLInputElement).value)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
