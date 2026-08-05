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

function initialTheme(): string {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default';
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showSettings: false,
  openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
    ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
    : false,
  theme: initialTheme(),
  titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
  listSpacing: localStorage.getItem('listSpacing') ?? '0',
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  toggleOpenLinksInNewTab: () =>
    set((s) => {
      const openLinkInNewTab = !s.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { openLinkInNewTab };
    }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  setFont: (titleFontSize) => {
    localStorage.setItem('titleFontSize', titleFontSize);
    set({ titleFontSize });
  },
  setSpacing: (listSpacing) => {
    localStorage.setItem('listSpacing', listSpacing);
    set({ listSpacing });
  },
}));

let mediaSubscribed = false;
export function subscribeToSystemColorScheme() {
  if (mediaSubscribed) return;
  mediaSubscribed = true;
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      useSettingsStore.getState().setTheme(event.matches ? 'night' : 'default');
    });
}
