import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let store: { [key: string]: string };

    beforeEach(() => {
        store = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            store[key] = value;
        });
        service = new SettingsService();
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

    it('should toggle open links in new tab', () => {
        expect(service.settings.openLinkInNewTab).toBe(false);
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
    });

    it('should set theme', () => {
        service.setTheme('night');
        expect(service.settings.theme).toBe('night');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('should set font size', () => {
        service.setFont('20');
        expect(service.settings.titleFontSize).toBe('20');
        expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
    });

    it('should set list spacing', () => {
        service.setSpacing('5');
        expect(service.settings.listSpacing).toBe('5');
        expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '5');
    });
});
