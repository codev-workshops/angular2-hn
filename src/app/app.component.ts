import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare let ga: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnDestroy {
  settings: Settings;
  theme: string;
  private routerSub: Subscription;

  constructor(
    private _settingsService: SettingsService,
    public router: Router
  ) {
    this.settings = this._settingsService.settings;
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
