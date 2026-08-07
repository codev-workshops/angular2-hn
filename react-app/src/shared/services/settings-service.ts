import type { Settings } from '../models/settings';

/**
 * Port of Angular's root-provided `SettingsService`. It is a module level
 * singleton so that – exactly like the Angular version, which is constructed by
 * the root injector before the first render – the theme is resolved (and
 * possibly written to `localStorage`) before anything is painted.
 *
 * `settings` is replaced rather than mutated so React can subscribe to it with
 * `useSyncExternalStore`.
 */
class SettingsService {
    settings: Settings;

    darkColorSchemeMedia: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    private listeners = new Set<() => void>();

    constructor() {
        const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
        this.settings = {
            showSettings: false,
            openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
            theme: 'default',
            titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
            listSpacing: localStorage.getItem('listSpacing') ?? '0',
        };
        this.subscribeToSystemPreferredColorScheme();
        this.initTheme();
    }

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSettings = (): Settings => this.settings;

    private update(changes: Partial<Settings>): void {
        this.settings = { ...this.settings, ...changes };
        this.listeners.forEach((listener) => listener());
    }

    private handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent): void => {
        this.setTheme(event.matches ? 'night' : 'default');
    };

    private subscribeToSystemPreferredColorScheme(): void {
        this.darkColorSchemeMedia.addEventListener('change', this.handleSystemPreferredColorSchemeChange);
    }

    private initTheme(): void {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.settings = { ...this.settings, theme: savedTheme };
        } else {
            this.darkColorSchemeMedia.dispatchEvent(
                new MediaQueryListEvent('change', {
                    media: this.darkColorSchemeMedia.media,
                    matches: this.darkColorSchemeMedia.matches,
                })
            );
        }
    }

    toggleSettings(): void {
        this.update({ showSettings: !this.settings.showSettings });
    }

    toggleOpenLinksInNewTab(): void {
        const openLinkInNewTab = !this.settings.openLinkInNewTab;
        this.update({ openLinkInNewTab });
        localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
    }

    setTheme(theme: string): void {
        this.update({ theme });
        localStorage.setItem('theme', theme);
    }

    setFont(titleFontSize: string): void {
        this.update({ titleFontSize });
        localStorage.setItem('titleFontSize', titleFontSize);
    }

    setSpacing(listSpacing: string): void {
        this.update({ listSpacing });
        localStorage.setItem('listSpacing', listSpacing);
    }
}

export const settingsService = new SettingsService();
