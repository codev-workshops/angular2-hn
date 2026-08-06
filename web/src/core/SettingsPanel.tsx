import { useSettingsStore } from '../store/settings';

export function SettingsPanel() {
    const settings = useSettingsStore();

    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <h1>Settings</h1>
                <hr />
                <span className="close" onClick={settings.toggleSettings}>
                    &times;
                </span>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <input
                            type="checkbox"
                            checked={settings.openLinkInNewTab}
                            onChange={settings.toggleOpenLinksInNewTab}
                        />{' '}
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
                                        checked={settings.theme === 'default'}
                                        readOnly
                                        onClick={() => settings.setTheme('default')}
                                    />{' '}
                                    Default
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="night"
                                        checked={settings.theme === 'night'}
                                        readOnly
                                        onClick={() => settings.setTheme('night')}
                                    />{' '}
                                    Night
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="amoledblack"
                                        checked={settings.theme === 'amoledblack'}
                                        readOnly
                                        onClick={() => settings.setTheme('amoledblack')}
                                    />{' '}
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
                                        defaultValue={settings.titleFontSize}
                                        name="theme"
                                        type="number"
                                        onKeyUp={(event) => settings.setFont(event.currentTarget.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        defaultValue={settings.listSpacing}
                                        name="theme"
                                        type="number"
                                        onKeyUp={(event) => settings.setSpacing(event.currentTarget.value)}
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
