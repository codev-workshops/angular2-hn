import { useSettings } from '../../context/SettingsContext';

import './Settings.scss';

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div className="c-settings">
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
                                checked={settings.openLinkInNewTab}
                                onChange={toggleOpenLinksInNewTab}
                            />
                            {' Open links in a new tab '}
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
                                            checked={settings.theme === 'default'}
                                            onChange={() => undefined}
                                            onClick={() => setTheme('default')}
                                        />
                                        {' Default '}
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value="night"
                                            checked={settings.theme === 'night'}
                                            onChange={() => undefined}
                                            onClick={() => setTheme('night')}
                                        />
                                        {' Night '}
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value="amoledblack"
                                            checked={settings.theme === 'amoledblack'}
                                            onChange={() => undefined}
                                            onClick={() => setTheme('amoledblack')}
                                        />
                                        {' Black (AMOLED) '}
                                    </label>
                                </div>
                            </div>
                            <div className="control-section">
                                <h2>Change Font</h2>
                                <div>
                                    <label>
                                        {' Font size: '}
                                        {/* The Angular original binds `[value]` one-way and updates on
                                            `(keyup)`, so the settings only change while typing. */}
                                        <input
                                            min="1"
                                            defaultValue={settings.titleFontSize}
                                            name="theme"
                                            type="number"
                                            onKeyUp={(event) => setFont(event.currentTarget.value)}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        {' List spacing: '}
                                        <input
                                            min="0"
                                            defaultValue={settings.listSpacing}
                                            name="theme"
                                            type="number"
                                            onKeyUp={(event) => setSpacing(event.currentTarget.value)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
