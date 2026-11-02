import { SettingsService } from './settings.service';

class FakeMediaQueryList extends EventTarget {
  media = '(prefers-color-scheme: dark)';
  constructor(public matches: boolean) {
    super();
  }
}

describe('SettingsService', () => {
  let media: FakeMediaQueryList;

  function createService(prefersDark = false): SettingsService {
    media = new FakeMediaQueryList(prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(media as any);
    return new SettingsService();
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  describe('defaults', () => {
    it('should use defaults when nothing is persisted and the system is light', () => {
      const service = createService(false);

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      });
    });

    it('should pick the night theme when the system prefers dark and no theme is saved', () => {
      const service = createService(true);

      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });
  });

  describe('persisted values', () => {
    it('should restore settings from localStorage', () => {
      localStorage.setItem('openLinkInNewTab', 'true');
      localStorage.setItem('titleFontSize', '20');
      localStorage.setItem('listSpacing', '8');
      localStorage.setItem('theme', 'amoledblack');

      const service = createService(true);

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('8');
      expect(service.settings.theme).toBe('amoledblack');
    });

    it('should parse a persisted "false" for openLinkInNewTab', () => {
      localStorage.setItem('openLinkInNewTab', 'false');

      expect(createService().settings.openLinkInNewTab).toBe(false);
    });

    it('should fall back to defaults for empty persisted strings', () => {
      localStorage.setItem('titleFontSize', '');
      localStorage.setItem('listSpacing', '');
      localStorage.setItem('theme', '');

      const service = createService(false);

      expect(service.settings.titleFontSize).toBe('16');
      expect(service.settings.listSpacing).toBe('0');
      expect(service.settings.theme).toBe('default');
    });
  });

  describe('system color scheme changes', () => {
    it('should switch to night/default when the system preference changes', () => {
      const service = createService(false);

      media.dispatchEvent(new MediaQueryListEvent('change', { media: media.media, matches: true }));
      expect(service.settings.theme).toBe('night');

      media.dispatchEvent(new MediaQueryListEvent('change', { media: media.media, matches: false }));
      expect(service.settings.theme).toBe('default');
      expect(localStorage.getItem('theme')).toBe('default');
    });

    it('should remove its listener on destroy', () => {
      const service = createService(false);
      spyOn(media, 'removeEventListener').and.callThrough();

      service.ngOnDestroy();

      expect(media.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('setters', () => {
    let service: SettingsService;

    beforeEach(() => (service = createService(false)));

    it('toggleSettings should flip showSettings without persisting it', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('toggleOpenLinksInNewTab should flip and persist the flag', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('setTheme should update and persist the theme', () => {
      service.setTheme('amoledblack');
      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('setFont should update and persist the title font size', () => {
      service.setFont('22');
      expect(service.settings.titleFontSize).toBe('22');
      expect(localStorage.getItem('titleFontSize')).toBe('22');
    });

    it('setSpacing should update and persist the list spacing', () => {
      service.setSpacing('12');
      expect(service.settings.listSpacing).toBe('12');
      expect(localStorage.getItem('listSpacing')).toBe('12');
    });

    it('persisted setters should be picked up by a new instance', () => {
      service.setFont('18');
      service.setSpacing('4');
      service.toggleOpenLinksInNewTab();
      service.setTheme('night');

      const restored = new SettingsService();

      expect(restored.settings).toEqual(jasmine.objectContaining({
        openLinkInNewTab: true,
        theme: 'night',
        titleFontSize: '18',
        listSpacing: '4',
      }));
    });
  });
});
