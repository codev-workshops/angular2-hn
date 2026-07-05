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
    autoTheme: localStorage.getItem('autoTheme') ? JSON.parse(localStorage.getItem('autoTheme')) : !localStorage.getItem('theme'),
    titleFontSize: localStorage.getItem('titleFontSize') ? localStorage.getItem('titleFontSize') : '16',
    listSpacing: localStorage.getItem('listSpacing') ? localStorage.getItem('listSpacing') : '0',
  };

  darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }

  ngOnDestroy() {
    this.unSubscribeToSystemPrefferedColorScheme();
  }

  // Arrow function so the reference is stable for add/removeEventListener and `this` stays bound.
  handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
    // Only follow the system when the user hasn't picked an explicit theme.
    if (!this.settings.autoTheme) {
      return;
    }
    this.applyTheme(event.matches ? 'night' : 'default');
  }

  subscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.addEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange
    );
  }

  initTheme() {
    if (this.settings.autoTheme) {
      localStorage.setItem('autoTheme', JSON.stringify(true));
      this.applyTheme(this.darkColorSchemeMedia.matches ? 'night' : 'default');
    } else {
      this.settings.theme = localStorage.getItem('theme') || 'default';
    }
  }

  unSubscribeToSystemPrefferedColorScheme() {
    this.darkColorSchemeMedia.removeEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange
    );
  }

  toggleSettings() {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab() {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    localStorage.setItem('openLinkInNewTab', JSON.stringify(this.settings.openLinkInNewTab));
  }

  enableAutoTheme() {
    this.settings.autoTheme = true;
    localStorage.setItem('autoTheme', JSON.stringify(this.settings.autoTheme));
    this.applyTheme(this.darkColorSchemeMedia.matches ? 'night' : 'default');
  }

  setTheme(theme) {
    // An explicit choice opts out of following the system.
    this.settings.autoTheme = false;
    localStorage.setItem('autoTheme', JSON.stringify(this.settings.autoTheme));
    this.applyTheme(theme);
  }

  private applyTheme(theme) {
    this.settings.theme = theme;
    localStorage.setItem('theme', this.settings.theme);
  }

  setFont(fontSize) {
    this.settings.titleFontSize = fontSize;
    localStorage.setItem('titleFontSize', this.settings.titleFontSize);
  }

  setSpacing(listSpace) {
    this.settings.listSpacing = listSpace;
    localStorage.setItem('listSpacing', this.settings.listSpacing);
  }
}
