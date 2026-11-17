import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  it('shares settings and tracks only completed navigations', () => {
    const events = new Subject<unknown>();
    const analytics = jasmine.createSpy('ga');
    const host = window as unknown as { ga: (...args: unknown[]) => void };
    const previous = host.ga;
    host.ga = analytics;
    try {
      const settings = { settings: { theme: 'night' } } as SettingsService;
      const component = new AppComponent(settings, { events } as unknown as Router);
      expect(component.settings).toBe(settings.settings);
      events.next(new NavigationStart(1, '/news'));
      expect(analytics).not.toHaveBeenCalled();
      events.next(new NavigationEnd(1, '/news', '/news/1'));
      expect(analytics).toHaveBeenCalledWith('set', 'page', '/news/1');
      expect(analytics).toHaveBeenCalledWith('send', 'pageview');
    } finally {
      host.ga = previous;
      events.complete();
    }
  });
});
