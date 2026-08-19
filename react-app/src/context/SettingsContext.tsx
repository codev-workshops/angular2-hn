import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models/settings';

type SettingsAction =
    | { type: 'toggleSettings' }
    | { type: 'toggleOpenLinksInNewTab' }
    | { type: 'setTheme'; theme: string }
    | { type: 'setFont'; titleFontSize: string }
    | { type: 'setSpacing'; listSpacing: string };

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const initialSettings: Settings = {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
        ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
        : false,
    theme: 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ? (localStorage.getItem('titleFontSize') as string) : '16',
    listSpacing: localStorage.getItem('listSpacing') ? (localStorage.getItem('listSpacing') as string) : '0',
};

function settingsReducer(state: Settings, action: SettingsAction): Settings {
    switch (action.type) {
        case 'toggleSettings':
            return { ...state, showSettings: !state.showSettings };
        case 'toggleOpenLinksInNewTab': {
            const openLinkInNewTab = !state.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...state, openLinkInNewTab };
        }
        case 'setTheme':
            localStorage.setItem('theme', action.theme);
            return { ...state, theme: action.theme };
        case 'setFont':
            localStorage.setItem('titleFontSize', action.titleFontSize);
            return { ...state, titleFontSize: action.titleFontSize };
        case 'setSpacing':
            localStorage.setItem('listSpacing', action.listSpacing);
            return { ...state, listSpacing: action.listSpacing };
        default:
            return state;
    }
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings: () => dispatch({ type: 'toggleSettings' }),
            toggleOpenLinksInNewTab: () => dispatch({ type: 'toggleOpenLinksInNewTab' }),
            setTheme: (theme: string) => dispatch({ type: 'setTheme', theme }),
            setFont: (fontSize: string) => dispatch({ type: 'setFont', titleFontSize: fontSize }),
            setSpacing: (listSpace: string) => dispatch({ type: 'setSpacing', listSpacing: listSpace }),
        }),
        [settings]
    );

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            dispatch({ type: 'setTheme', theme: event.matches ? 'night' : 'default' });
        };

        darkColorSchemeMedia.addEventListener('change', handleChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            dispatch({ type: 'setTheme', theme: savedTheme });
        } else {
            dispatch({ type: 'setTheme', theme: darkColorSchemeMedia.matches ? 'night' : 'default' });
        }

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleChange);
        };
    }, []);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
