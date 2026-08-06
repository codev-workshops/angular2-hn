import { create } from 'zustand';

export interface SettingsState {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const readStorage = (key: string, fallback: string): string => window.localStorage.getItem(key) || fallback;

export interface PersistedSettings {
    openLinkInNewTab: boolean;
    titleFontSize: string;
    listSpacing: string;
}

export function readPersistedSettings(): PersistedSettings {
    const openLinkInNewTab = window.localStorage.getItem('openLinkInNewTab');
    return {
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        titleFontSize: readStorage('titleFontSize', '16'),
        listSpacing: readStorage('listSpacing', '0'),
    };
}

export const useSettingsStore = create<SettingsState>((set) => ({
    showSettings: false,
    ...readPersistedSettings(),
    theme: 'default',
    toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
    toggleOpenLinksInNewTab: () =>
        set((state) => {
            const openLinkInNewTab = !state.openLinkInNewTab;
            window.localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { openLinkInNewTab };
        }),
    setTheme: (theme) =>
        set(() => {
            window.localStorage.setItem('theme', theme);
            return { theme };
        }),
    setFont: (titleFontSize) =>
        set(() => {
            window.localStorage.setItem('titleFontSize', titleFontSize);
            return { titleFontSize };
        }),
    setSpacing: (listSpacing) =>
        set(() => {
            window.localStorage.setItem('listSpacing', listSpacing);
            return { listSpacing };
        }),
}));

export function initSettings(): () => void {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemScheme = (matches: boolean) => {
        useSettingsStore.getState().setTheme(matches ? 'night' : 'default');
    };
    const handleChange = (event: MediaQueryListEvent) => applySystemScheme(event.matches);

    media.addEventListener('change', handleChange);
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme) {
        useSettingsStore.setState({ theme: savedTheme });
    } else {
        applySystemScheme(media.matches);
    }

    return () => media.removeEventListener('change', handleChange);
}
