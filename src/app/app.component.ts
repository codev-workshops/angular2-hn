import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare function ga(command: 'set', field: 'page', value: string): void;
declare function ga(command: 'send', hitType: 'pageview'): void;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  settings: Settings;

  constructor(
    private settingsService: SettingsService,
    public router: Router
  ) {
    this.settings = this.settingsService.settings;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }
}
