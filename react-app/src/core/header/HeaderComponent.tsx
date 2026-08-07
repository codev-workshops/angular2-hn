import { scope } from '../../shared/scope';
import { RouterLink } from '../../shared/router/RouterLink';
import { settingsService } from '../../shared/services/settings-service';
import { useSettings } from '../../shared/services/use-settings';
import { SettingsComponent } from '../settings/SettingsComponent';
import './header.component.scss';

const ng = scope('header');

function scrollTop() {
    window.scrollTo(0, 0);
}

export function HeaderComponent() {
    const settings = useSettings();
    return (
        <app-header {...ng}>
            <header {...ng}>
                <div {...ng} id="header">
                    <RouterLink ng={ng} to="/news/1" className="home-link" onClick={scrollTop}>
                        <div {...ng} className="logo-inner"></div>
                        <img {...ng} className="logo" src="assets/images/logo.svg" alt="Logo" />
                    </RouterLink>
                    <div {...ng} className="header-text">
                        <div {...ng} className="left">
                            <span {...ng} className="header-nav">
                                <RouterLink ng={ng} to="/newest/1" onClick={scrollTop}>
                                    new
                                </RouterLink>
                                {' | '}
                                <RouterLink ng={ng} to="/show/1" onClick={scrollTop}>
                                    show
                                </RouterLink>
                                {' | '}
                                <RouterLink ng={ng} to="/ask/1" onClick={scrollTop}>
                                    ask
                                </RouterLink>
                                {' | '}
                                <RouterLink ng={ng} to="/jobs/1" onClick={scrollTop}>
                                    jobs
                                </RouterLink>
                            </span>
                        </div>
                    </div>
                    <div {...ng} className="info">
                        <img
                            {...ng}
                            className="settings"
                            src="assets/images/cog.svg"
                            alt="Settings"
                            onClick={() => settingsService.toggleSettings()}
                        />
                    </div>
                </div>
                {settings.showSettings ? <SettingsComponent /> : null}
            </header>
        </app-header>
    );
}
