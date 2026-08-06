import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initSettings, readPersistedSettings, useSettingsStore } from './settings';

function mockMediaQuery(matches: boolean) {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media = {
        media: '(prefers-color-scheme: dark)',
        matches,
        addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) =>
            listeners.add(listener)
        ),
        removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) =>
            listeners.delete(listener)
        ),
    } as unknown as MediaQueryList;
    vi.spyOn(window, 'matchMedia').mockReturnValue(media);
    return { media, listeners };
}

describe('settings store', () => {
    beforeEach(() => {
        window.localStorage.clear();
        useSettingsStore.setState({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
        vi.restoreAllMocks();
    });

    it('uses the legacy defaults and storage encodings', () => {
        expect(useSettingsStore.getState()).toMatchObject({
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });

        useSettingsStore.getState().toggleOpenLinksInNewTab();
        useSettingsStore.getState().setTheme('night');
        useSettingsStore.getState().setFont('19');
        useSettingsStore.getState().setSpacing('4');

        expect(window.localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(window.localStorage.getItem('theme')).toBe('night');
        expect(window.localStorage.getItem('titleFontSize')).toBe('19');
        expect(window.localStorage.getItem('listSpacing')).toBe('4');
    });

    it('reads defaults when nothing is stored', () => {
        expect(readPersistedSettings()).toEqual({
            openLinkInNewTab: false,
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('decodes the JSON boolean and reads raw strings from storage', () => {
        window.localStorage.setItem('openLinkInNewTab', 'true');
        window.localStorage.setItem('titleFontSize', '20');
        window.localStorage.setItem('listSpacing', '8');
        expect(readPersistedSettings()).toEqual({
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '8',
        });
    });

    it('decodes a stored JSON false value', () => {
        window.localStorage.setItem('openLinkInNewTab', 'false');
        expect(readPersistedSettings().openLinkInNewTab).toBe(false);
    });

    it('uses defaults for empty-string values like the legacy truthy checks', () => {
        window.localStorage.setItem('openLinkInNewTab', '');
        window.localStorage.setItem('titleFontSize', '');
        window.localStorage.setItem('listSpacing', '');
        expect(readPersistedSettings()).toEqual({
            openLinkInNewTab: false,
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('toggles the settings panel in memory only', () => {
        useSettingsStore.getState().toggleSettings();
        expect(useSettingsStore.getState().showSettings).toBe(true);
        expect(window.localStorage.getItem('showSettings')).toBeNull();
        useSettingsStore.getState().toggleSettings();
        expect(useSettingsStore.getState().showSettings).toBe(false);
    });

    it('initializes from a saved theme without persisting it again', () => {
        const media = mockMediaQuery(true);
        window.localStorage.setItem('theme', 'amoledblack');
        const cleanup = initSettings();
        expect(useSettingsStore.getState().theme).toBe('amoledblack');
        expect(window.localStorage.getItem('theme')).toBe('amoledblack');
        expect(media.media.addEventListener).toHaveBeenCalledTimes(1);
        cleanup();
        expect(media.media.removeEventListener).toHaveBeenCalledTimes(1);
    });

    it.each([
        [true, 'night'],
        [false, 'default'],
    ])('derives and persists the initial %s media theme', (matches, theme) => {
        mockMediaQuery(matches);
        const cleanup = initSettings();
        expect(useSettingsStore.getState().theme).toBe(theme);
        expect(window.localStorage.getItem('theme')).toBe(theme);
        cleanup();
    });

    it('persists live media-query changes', () => {
        const { listeners } = mockMediaQuery(false);
        const cleanup = initSettings();
        listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
        expect(useSettingsStore.getState().theme).toBe('night');
        expect(window.localStorage.getItem('theme')).toBe('night');
        cleanup();
    });

    it('persists every setter action', () => {
        const state = useSettingsStore.getState();
        state.toggleOpenLinksInNewTab();
        state.setTheme('amoledblack');
        state.setFont('22');
        state.setSpacing('6');
        expect(useSettingsStore.getState()).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '22',
            listSpacing: '6',
        });
    });
});
