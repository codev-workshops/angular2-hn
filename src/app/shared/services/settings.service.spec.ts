import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

const STORAGE_KEYS = ['theme', 'openLinkInNewTab', 'titleFontSize', 'listSpacing'];

type FakeMediaQueryList = EventTarget & { media: string; matches: boolean };

function createMediaQueryList(matches: boolean): FakeMediaQueryList {
  return Object.assign(new EventTarget(), { media: '(prefers-color-scheme: dark)', matches });
}

function dispatchSchemeChange(mql: FakeMediaQueryList, matches: boolean) {
  mql.matches = matches;
  mql.dispatchEvent(new MediaQueryListEvent('change', { media: mql.media, matches }));
}

describe('SettingsService', () => {
  let savedStorage: { [key: string]: string | null };
  let mql: FakeMediaQueryList;
  let matchMediaSpy: jasmine.Spy;

  function createService(): SettingsService {
    return TestBed.inject(SettingsService);
  }

  beforeEach(() => {
    savedStorage = {};
    STORAGE_KEYS.forEach(key => {
      savedStorage[key] = localStorage.getItem(key);
      localStorage.removeItem(key);
    });
    mql = createMediaQueryList(false);
    matchMediaSpy = spyOn(window, 'matchMedia').and.callFake(() => mql as unknown as MediaQueryList);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    STORAGE_KEYS.forEach(key => {
      if (savedStorage[key] === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, savedStorage[key]);
      }
    });
  });

  it('is provided in root as a singleton', () => {
    expect(TestBed.inject(SettingsService)).toBe(TestBed.inject(SettingsService));
  });

  it('queries the prefers-color-scheme: dark media feature', () => {
    createService();
    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  describe('initial settings', () => {
    it('uses defaults when nothing is stored and the system prefers light', () => {
      const service = createService();

      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      });
      expect(localStorage.getItem('theme')).toBe('default');
    });

    it('uses the night theme (and persists it) when the system prefers dark and no theme is stored', () => {
      mql = createMediaQueryList(true);
      const service = createService();

      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });

    it('prefers a stored theme over the system preference', () => {
      localStorage.setItem('theme', 'amoledblack');
      mql = createMediaQueryList(true);
      const service = createService();

      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('restores stored link, font size and spacing preferences', () => {
      localStorage.setItem('openLinkInNewTab', 'true');
      localStorage.setItem('titleFontSize', '20');
      localStorage.setItem('listSpacing', '3');
      const service = createService();

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('3');
      expect(service.settings.showSettings).toBe(false);
    });

    it('parses a stored "false" for openLinkInNewTab as boolean false', () => {
      localStorage.setItem('openLinkInNewTab', 'false');
      expect(createService().settings.openLinkInNewTab).toBe(false);
    });
  });

  describe('system color scheme changes', () => {
    it('switches to night and back to default as the system preference changes, persisting each', () => {
      const service = createService();

      dispatchSchemeChange(mql, true);
      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');

      dispatchSchemeChange(mql, false);
      expect(service.settings.theme).toBe('default');
      expect(localStorage.getItem('theme')).toBe('default');
    });

    it('handleSystemPreferredColorSchemeChange maps matches to night/default', () => {
      const service = createService();

      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');

      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('default');
    });

    it('subscribes on construction and calls removeEventListener for "change" on destroy', () => {
      const addSpy = spyOn(mql, 'addEventListener').and.callThrough();
      const removeSpy = spyOn(mql, 'removeEventListener').and.callThrough();
      const service = createService();

      expect(addSpy).toHaveBeenCalledWith('change', jasmine.any(Function));

      service.ngOnDestroy();
      expect(removeSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('mutators', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = createService();
    });

    it('toggleSettings flips showSettings without touching storage', () => {
      const setItemSpy = spyOn(localStorage, 'setItem').and.callThrough();

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('toggleOpenLinksInNewTab flips the flag and persists it as JSON', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('setTheme updates and persists the theme', () => {
      service.setTheme('amoledblack');
      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('setFont updates and persists the title font size', () => {
      service.setFont('24');
      expect(service.settings.titleFontSize).toBe('24');
      expect(localStorage.getItem('titleFontSize')).toBe('24');
    });

    it('setSpacing updates and persists the list spacing', () => {
      service.setSpacing('5');
      expect(service.settings.listSpacing).toBe('5');
      expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('persisted values are picked up by a freshly constructed service', () => {
      service.setTheme('night');
      service.setFont('18');
      service.setSpacing('2');
      service.toggleOpenLinksInNewTab();

      const reloaded = new SettingsService();
      expect(reloaded.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: true,
        theme: 'night',
        titleFontSize: '18',
        listSpacing: '2'
      });
    });
  });
});
