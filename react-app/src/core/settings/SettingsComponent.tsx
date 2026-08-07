import { scope } from '../../shared/scope';
import { settingsService } from '../../shared/services/settings-service';
import { useSettings } from '../../shared/services/use-settings';
import './settings.component.scss';

const ng = scope('settings');

export function SettingsComponent() {
    const settings = useSettings();
    return (
        <app-settings {...ng}>
            <div {...ng} id="popup1" className="overlay">
                <div {...ng} className="popup">
                    <h1 {...ng}>Settings</h1>
                    <hr {...ng} />
                    <span {...ng} className="close" onClick={() => settingsService.toggleSettings()}>
                        &times;
                    </span>
                    <div {...ng} className="content">
                        <div {...ng} className="control-section">
                            <h2 {...ng}>Links</h2>
                            <input
                                {...ng}
                                type="checkbox"
                                checked={settings.openLinkInNewTab}
                                onChange={() => settingsService.toggleOpenLinksInNewTab()}
                            />
                            {' Open links in a new tab '}
                        </div>
                        <div {...ng} className="theme-controls">
                            <div {...ng} className="control-section">
                                <h2 {...ng}>Select a theme</h2>
                                <div {...ng}>
                                    <label {...ng}>
                                        <input
                                            {...ng}
                                            name="theme"
                                            type="radio"
                                            value="default"
                                            checked={settings.theme === 'default'}
                                            onChange={() => settingsService.setTheme('default')}
                                        />
                                        {' Default '}
                                    </label>
                                </div>
                                <div {...ng}>
                                    <label {...ng}>
                                        <input
                                            {...ng}
                                            name="theme"
                                            type="radio"
                                            value="night"
                                            checked={settings.theme === 'night'}
                                            onChange={() => settingsService.setTheme('night')}
                                        />
                                        {' Night '}
                                    </label>
                                </div>
                                <div {...ng}>
                                    <label {...ng}>
                                        <input
                                            {...ng}
                                            name="theme"
                                            type="radio"
                                            value="amoledblack"
                                            checked={settings.theme === 'amoledblack'}
                                            onChange={() => settingsService.setTheme('amoledblack')}
                                        />
                                        {' Black (AMOLED) '}
                                    </label>
                                </div>
                            </div>
                            <div {...ng} className="control-section">
                                <h2 {...ng}>Change Font</h2>
                                <div {...ng}>
                                    <label {...ng}>
                                        {' Font size: '}
                                        <input
                                            {...ng}
                                            min="1"
                                            defaultValue={settings.titleFontSize}
                                            name="theme"
                                            type="number"
                                            onKeyUp={(event) => settingsService.setFont(event.currentTarget.value)}
                                        />
                                    </label>
                                </div>
                                <div {...ng}>
                                    <label {...ng}>
                                        {' List spacing: '}
                                        <input
                                            {...ng}
                                            min="0"
                                            defaultValue={settings.listSpacing}
                                            name="theme"
                                            type="number"
                                            onKeyUp={(event) => settingsService.setSpacing(event.currentTarget.value)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </app-settings>
    );
}
