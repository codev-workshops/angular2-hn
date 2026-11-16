import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { StubHeaderComponent, StubFooterComponent, StubSettingsComponent } from './shared/testing/stub-components';
import { settingsStub } from './core/settings/settings-testing';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let events: Subject<NavigationEnd | NavigationStart | NavigationError>;
  let service: ReturnType<typeof settingsStub>;
  let analytics: jasmine.Spy;
  let previousGA: PropertyDescriptor;

  beforeEach(() => {
    previousGA = Object.getOwnPropertyDescriptor(window, 'ga');
    analytics = jasmine.createSpy('ga');
    Object.defineProperty(window, 'ga', {configurable: true, writable: true, value: analytics});
    events = new Subject();
    service = settingsStub();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent, StubHeaderComponent, StubFooterComponent, StubSettingsComponent],
      providers: [
        {provide: Router, useValue: {events}},
        {provide: SettingsService, useValue: service}
      ]
    });
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    events.complete();
    if (previousGA) {
      Object.defineProperty(window, 'ga', previousGA);
    } else {
      Reflect.deleteProperty(window, 'ga');
    }
  });

  it('renders the shell with exactly one header, footer and outlet', () => {
    expect(fixture.debugElement.queryAll(By.directive(StubHeaderComponent)).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.directive(StubFooterComponent)).length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('router-outlet').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.body-cover')).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(StubSettingsComponent))).toBeNull();
  });

  it('tracks only completed navigation using the redirected URL in order', () => {
    expect(analytics).not.toHaveBeenCalled();
    events.next(new NavigationStart(1, '/'));
    events.next(new NavigationError(1, '/', new Error('failed')));
    expect(analytics).not.toHaveBeenCalled();
    events.next(new NavigationEnd(2, '/', '/news/1'));
    events.next(new NavigationEnd(3, '/ask/2', '/ask/2'));
    expect(analytics.calls.allArgs()).toEqual([
      ['set', 'page', '/news/1'], ['send', 'pageview'],
      ['set', 'page', '/ask/2'], ['send', 'pageview']
    ]);
  });

  it('reflects shared theme changes without retaining old or empty classes', () => {
    expect(fixture.componentInstance.settings).toBe(service.settings);
    const shell: HTMLElement = fixture.nativeElement.firstElementChild;
    expect(shell.className).toBe('default');
    ['night', 'amoledblack', '', 'default'].forEach(theme => {
      service.settings.theme = theme;
      fixture.detectChanges();
      expect(shell.className).toBe(theme);
    });
    service.settings.showSettings = true;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(StubSettingsComponent))).toBeNull();
    expect(fixture.debugElement.query(By.directive(StubHeaderComponent))).not.toBeNull();
  });
});
