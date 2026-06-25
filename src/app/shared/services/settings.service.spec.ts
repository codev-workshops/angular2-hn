import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        localStorage.clear();
        service = new SettingsService();
    });

    afterEach(() => {
        localStorage.clear();
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

    describe('toggleSettings', () => {
        it('should toggle showSettings from false to true', () => {
            service.settings.showSettings = false;
            service.toggleSettings();
            expect(service.settings.showSettings).toBe(true);
        });

        it('should toggle showSettings from true to false', () => {
            service.settings.showSettings = true;
            service.toggleSettings();
            expect(service.settings.showSettings).toBe(false);
        });
    });

    describe('toggleOpenLinksInNewTab', () => {
        it('should toggle openLinkInNewTab from false to true', () => {
            service.settings.openLinkInNewTab = false;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(true);
        });

        it('should toggle openLinkInNewTab from true to false', () => {
            service.settings.openLinkInNewTab = true;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(false);
        });

        it('should persist the value in localStorage', () => {
            service.toggleOpenLinksInNewTab();
            expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        });
    });

    describe('setTheme', () => {
        it('should set the theme to night', () => {
            service.setTheme('night');
            expect(service.settings.theme).toBe('night');
        });

        it('should set the theme to black', () => {
            service.setTheme('black');
            expect(service.settings.theme).toBe('black');
        });

        it('should persist the theme in localStorage', () => {
            service.setTheme('night');
            expect(localStorage.getItem('theme')).toBe('night');
        });
    });

    describe('setFont', () => {
        it('should set the font size', () => {
            service.setFont('20');
            expect(service.settings.titleFontSize).toBe('20');
        });

        it('should persist the font size in localStorage', () => {
            service.setFont('18');
            expect(localStorage.getItem('titleFontSize')).toBe('18');
        });
    });

    describe('setSpacing', () => {
        it('should set the list spacing', () => {
            service.setSpacing('5');
            expect(service.settings.listSpacing).toBe('5');
        });

        it('should persist the spacing in localStorage', () => {
            service.setSpacing('10');
            expect(localStorage.getItem('listSpacing')).toBe('10');
        });
    });

    describe('initTheme', () => {
        it('should load theme from localStorage if saved', () => {
            localStorage.setItem('theme', 'black');
            const svc = new SettingsService();
            expect(svc.settings.theme).toBe('black');
        });
    });

    describe('handleSystemPreferredColorSchemeChange', () => {
        it('should set theme to night when dark scheme is preferred', () => {
            const event = new MediaQueryListEvent('change', { matches: true, media: '(prefers-color-scheme: dark)' });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('night');
        });

        it('should set theme to default when light scheme is preferred', () => {
            const event = new MediaQueryListEvent('change', { matches: false, media: '(prefers-color-scheme: dark)' });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('default');
        });
    });
});
