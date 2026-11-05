import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { Settings } from './shared/models/settings';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let events$: Subject<any>;
  let settings: Settings;
  let ga: jasmine.Spy;

  beforeEach(() => {
    ga = jasmine.createSpy('ga');
    (window as any).ga = ga;
    events$ = new Subject();
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'night', titleFontSize: '16', listSpacing: '0' };

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useValue: { settings } },
        { provide: Router, useValue: { events: events$ } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => delete (window as any).ga);

  it('should create with the shared settings', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('should render the shell with the current theme class', () => {
    const root: HTMLElement = fixture.nativeElement.firstElementChild;
    expect(root.className).toBe('night');
    expect(root.querySelector('app-header')).not.toBeNull();
    expect(root.querySelector('router-outlet')).not.toBeNull();
    expect(root.querySelector('app-footer')).not.toBeNull();

    settings.theme = 'amoledblack';
    fixture.detectChanges();
    expect(root.className).toBe('amoledblack');
  });

  it('should send a Google Analytics pageview on NavigationEnd', () => {
    events$.next(new NavigationEnd(1, '/', '/news/1'));

    expect(ga.calls.allArgs()).toEqual([['set', 'page', '/news/1'], ['send', 'pageview']]);
  });

  it('should ignore other router events', () => {
    events$.next(new NavigationStart(1, '/'));
    expect(ga).not.toHaveBeenCalled();
  });
});
