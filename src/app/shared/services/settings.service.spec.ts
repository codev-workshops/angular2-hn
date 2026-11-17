import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let media: MediaQueryList;
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    media = Object.assign(new EventTarget(), { media: '(prefers-color-scheme: dark)', matches: false }) as MediaQueryList;
    spyOn(window, 'matchMedia').and.returnValue(media);
  });

  afterEach(() => {
    if (service) { service.ngOnDestroy(); }
    localStorage.clear();
  });

  it('starts with defaults and persists each preference', () => {
    service = new SettingsService();
    expect(service.settings).toEqual({ showSettings: false, openLinkInNewTab: false,
      theme: 'default', titleFontSize: '16', listSpacing: '0' });
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
    service.toggleOpenLinksInNewTab();
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    service.toggleOpenLinksInNewTab();
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    service.setTheme('night');
    service.setFont('20');
    service.setSpacing('8');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(localStorage.getItem('listSpacing')).toBe('8');
  });

  it('restores saved preferences', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '18');
    localStorage.setItem('listSpacing', '4');
    service = new SettingsService();
    expect(service.settings.theme).toBe('amoledblack');
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('18');
    expect(service.settings.listSpacing).toBe('4');
  });

  it('follows system theme changes', () => {
    service = new SettingsService();
    media.dispatchEvent(new MediaQueryListEvent('change', { matches: true }));
    expect(service.settings.theme).toBe('night');
    media.dispatchEvent(new MediaQueryListEvent('change', { matches: false }));
    expect(service.settings.theme).toBe('default');
  });
});
