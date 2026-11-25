import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('stops responding to system color scheme changes after destruction', () => {
    const mediaQuery = Object.assign(new EventTarget(), {
      media: '(prefers-color-scheme: dark)',
      matches: false
    });
    spyOn(window, 'matchMedia').and.returnValue(mediaQuery as MediaQueryList);
    spyOn(Storage.prototype, 'getItem').and.returnValue(null);
    spyOn(Storage.prototype, 'setItem');

    const service = new SettingsService();
    mediaQuery.dispatchEvent(new MediaQueryListEvent('change', { matches: true }));
    expect(service.settings.theme).toBe('night');

    service.ngOnDestroy();
    mediaQuery.dispatchEvent(new MediaQueryListEvent('change', { matches: false }));
    expect(service.settings.theme).toBe('night');
  });
});
