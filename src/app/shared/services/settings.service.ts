import { Injectable, OnDestroy } from '@angular/core';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnDestroy {
  settings: Settings = {
    showSettings : false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab') ? JSON.parse(localStorage.getItem('openLinkInNewTab')) : false,
    theme: 'default',
    themeMode: 'system',
    titleFontSize: localStorage.getItem('titleFontSize') ? localStorage.getItem('titleFontSize') : '16',
    listSpacing: localStorage.getItem('listSpacing') ? localStorage.getItem('listSpacing') : '0',
  };

  darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }

  ngOnDestroy() {
    this.unsubscribeFromSystemPreferredColorScheme();
  }

  handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
    if (this.settings.themeMode === 'system') {
      this.applyThemeForMode();
    }
  }

  subscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.addEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange
    );
  }

  initTheme() {
    const savedMode = localStorage.getItem('themeMode');
    const savedTheme = localStorage.getItem('theme');

    if (savedMode) {
      this.settings.themeMode = savedMode;
    } else if (savedTheme) {
      // Legacy migration: existing users who only have a saved theme
      if (savedTheme === 'amoledblack' || savedTheme === 'solarized') {
        this.settings.themeMode = 'custom';
      } else if (savedTheme === 'night') {
        this.settings.themeMode = 'dark';
      } else {
        this.settings.themeMode = 'light';
      }
      localStorage.setItem('themeMode', this.settings.themeMode);
    }

    this.applyThemeForMode();
  }

  applyThemeForMode() {
    switch (this.settings.themeMode) {
      case 'light':
        this.settings.theme = 'default';
        break;
      case 'dark':
        this.settings.theme = 'night';
        break;
      case 'system':
        this.settings.theme = this.darkColorSchemeMedia.matches ? 'night' : 'default';
        break;
      default:
        // custom mode: keep whatever theme is already set
        break;
    }
    localStorage.setItem('theme', this.settings.theme);
  }

  unsubscribeFromSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.removeEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange
    );
  }

  setThemeMode(mode: string) {
    this.settings.themeMode = mode;
    localStorage.setItem('themeMode', mode);
    this.applyThemeForMode();
  }

  toggleSettings() {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab() {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    localStorage.setItem('openLinkInNewTab', JSON.stringify(this.settings.openLinkInNewTab));
  }

  setTheme(theme: string) {
    this.settings.themeMode = 'custom';
    localStorage.setItem('themeMode', 'custom');
    this.settings.theme = theme;
    localStorage.setItem('theme', this.settings.theme);
  }

  setFont(fontSize: string) {
    this.settings.titleFontSize = fontSize;
    localStorage.setItem('titleFontSize', this.settings.titleFontSize);
  }

  setSpacing(listSpace: string) {
    this.settings.listSpacing = listSpace;
    localStorage.setItem('listSpacing', this.settings.listSpacing);
  }
}
