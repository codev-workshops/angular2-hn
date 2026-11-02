import { Component, DoCheck } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';

import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare let ga: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements DoCheck {
  settings: Settings;
  theme: string;

  constructor(
    private _settingsService: SettingsService,
    private overlayContainer: OverlayContainer,
    public router: Router
  ) {
    this.settings = this._settingsService.settings;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }

  // Overlays (e.g. the settings dialog) render outside the themed wrapper,
  // so mirror the active theme class onto the overlay container.
  ngDoCheck() {
    if (this.theme === this.settings.theme) {
      return;
    }
    const classList = this.overlayContainer.getContainerElement().classList;
    if (this.theme) {
      classList.remove(this.theme);
    }
    classList.add(this.settings.theme);
    this.theme = this.settings.theme;
  }
}
