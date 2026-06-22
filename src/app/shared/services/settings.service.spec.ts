import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let store: { [key: string]: string } = {};

    beforeEach(() => {
        store = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => store[key] = value);

        TestBed.configureTestingModule({
            providers: [SettingsService]
        });
        service = TestBed.inject(SettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default settings', () => {
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.openLinkInNewTab).toBe(false);
        expect(service.settings.titleFontSize).toBe('16');
        expect(service.settings.listSpacing).toBe('0');
    });

    it('should toggle settings visibility', () => {
        expect(service.settings.showSettings).toBe(false);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(true);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(false);
    });

    it('should toggle openLinkInNewTab and persist to localStorage', () => {
        expect(service.settings.openLinkInNewTab).toBe(false);
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(false);
        expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });

    it('should set theme and persist to localStorage', () => {
        service.setTheme('night');
        expect(service.settings.theme).toBe('night');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('should set font size and persist to localStorage', () => {
        service.setFont('20');
        expect(service.settings.titleFontSize).toBe('20');
        expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
    });

    it('should set spacing and persist to localStorage', () => {
        service.setSpacing('10');
        expect(service.settings.listSpacing).toBe('10');
        expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '10');
    });

    it('should handle system preferred color scheme change to dark', () => {
        const event = new MediaQueryListEvent('change', { matches: true, media: '(prefers-color-scheme: dark)' });
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('night');
    });

    it('should handle system preferred color scheme change to light', () => {
        const event = new MediaQueryListEvent('change', { matches: false, media: '(prefers-color-scheme: dark)' });
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('default');
    });

    it('should init theme from localStorage if saved', () => {
        store['theme'] = 'black';
        service.initTheme();
        expect(service.settings.theme).toBe('black');
    });

    it('should subscribe and unsubscribe to system preferred color scheme', () => {
        spyOn(service.darkColorSchemeMedia, 'addEventListener');
        spyOn(service.darkColorSchemeMedia, 'removeEventListener');
        service.subscribeToSystemPreferredColorScheme();
        expect(service.darkColorSchemeMedia.addEventListener).toHaveBeenCalled();
        service.unSubscribeToSystemPrefferedColorScheme();
        expect(service.darkColorSchemeMedia.removeEventListener).toHaveBeenCalled();
    });
});
