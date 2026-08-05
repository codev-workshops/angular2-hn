import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '../stores/settings';
import { Settings } from './Settings';
import './Header.scss';

function scrollTop() {
  window.scrollTo(0, 0);
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'active' : undefined;
}

export function Header() {
  const showSettings = useSettingsStore((s) => s.showSettings);
  const toggleSettings = useSettingsStore((s) => s.toggleSettings);

  return (
    <header>
      <div id="header">
        <NavLink
          className={({ isActive }) => (isActive ? 'home-link active' : 'home-link')}
          to="/news/1"
          onClick={scrollTop}
        >
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <NavLink className={navClass} to="/newest/1" onClick={scrollTop}>
                new
              </NavLink>
              {' | '}
              <NavLink className={navClass} to="/show/1" onClick={scrollTop}>
                show
              </NavLink>
              {' | '}
              <NavLink className={navClass} to="/ask/1" onClick={scrollTop}>
                ask
              </NavLink>
              {' | '}
              <NavLink className={navClass} to="/jobs/1" onClick={scrollTop}>
                jobs
              </NavLink>
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="/assets/images/cog.svg"
            alt="Settings"
            onClick={toggleSettings}
          />
        </div>
      </div>
      {showSettings && <Settings />}
    </header>
  );
}
