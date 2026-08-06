import { NavLink } from 'react-router';
import { SettingsPanel } from './SettingsPanel';
import { useSettingsStore } from '../store/settings';

const scrollTop = () => window.scrollTo(0, 0);

export function Header() {
    const showSettings = useSettingsStore((state) => state.showSettings);
    const toggleSettings = useSettingsStore((state) => state.toggleSettings);

    return (
        <header>
            <div id="header">
                <NavLink
                    to="/news/1"
                    end
                    className={({ isActive }) => `home-link${isActive ? ' active' : ''}`}
                    onClick={scrollTop}
                >
                    <div className="logo-inner" />
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink
                                to="/newest/1"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={scrollTop}
                            >
                                new
                            </NavLink>{' '}
                            |{' '}
                            <NavLink
                                to="/show/1"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={scrollTop}
                            >
                                show
                            </NavLink>{' '}
                            |{' '}
                            <NavLink
                                to="/ask/1"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={scrollTop}
                            >
                                ask
                            </NavLink>{' '}
                            |{' '}
                            <NavLink
                                to="/jobs/1"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={scrollTop}
                            >
                                jobs
                            </NavLink>
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {showSettings && <SettingsPanel />}
        </header>
    );
}
