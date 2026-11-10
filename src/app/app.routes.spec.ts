import { Location } from '@angular/common';
import { Component, NgZone, ValueProvider } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, RouterOutlet, Routes } from '@angular/router';
import { ROUTES } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { routing } from './app.routes';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { UserComponent } from './user/user.component';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';
import { settingsStub } from './core/settings/settings-testing';

@Component({template: '<router-outlet></router-outlet>'})
class RouteHostComponent {}

function configuredRoutes(): Routes {
  const flatten = (entries: unknown[]): unknown[] => entries.reduce<unknown[]>((all, entry) =>
    all.concat(Array.isArray(entry) ? flatten(entry) : entry), []);
  const provider = (flatten(routing.providers) as ValueProvider[]).find(entry => entry.provide === ROUTES);
  return flatten(provider.useValue) as Routes;
}

describe('Application navigation', () => {
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  const navigate = (url: string) => TestBed.inject(NgZone).run(() => TestBed.inject(Router).navigateByUrl(url));
  beforeEach(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed', 'fetchItemContent', 'fetchUser']);
    api.fetchFeed.and.returnValue(of([]));
    api.fetchItemContent.and.returnValue(of(null));
    api.fetchUser.and.returnValue(of(null));
    spyOn(window, 'scrollTo');
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(configuredRoutes())],
      declarations: [RouteHostComponent, FeedComponent],
      providers: [
        {provide: HackerNewsAPIService, useValue: api},
        {provide: SettingsService, useValue: settingsStub()}
      ]
    });
    TestBed.overrideComponent(FeedComponent, {set: {template: '<p>Feed route</p>'}});
    TestBed.overrideComponent(ItemDetailsComponent, {set: {template: '<p>Item route</p>'}});
    TestBed.overrideComponent(UserComponent, {set: {template: '<p>User route</p>'}});
  });

  it('redirects the empty path to news page one and activates the feed', fakeAsync(() => {
    const fixture = TestBed.createComponent(RouteHostComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    navigate('/');
    tick();
    fixture.detectChanges();
    expect(router.url).toBe('/news/1');
    expect(TestBed.inject(Location).path()).toBe('/news/1');
    expect(fixture.nativeElement.textContent).toContain('Feed route');
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  }));

  ['news', 'newest', 'show', 'ask', 'jobs'].forEach(feed => {
    it('resolves /' + feed + '/2 with inherited feed data and page params', fakeAsync(() => {
      const fixture = TestBed.createComponent(RouteHostComponent);
      fixture.detectChanges();
      navigate('/' + feed + '/2');
      tick();
      fixture.detectChanges();
      const outlet = fixture.debugElement.query(By.directive(RouterOutlet)).injector.get(RouterOutlet);
      expect(outlet.component instanceof FeedComponent).toBe(true);
      expect(outlet.activatedRoute.snapshot.params.page).toBe('2');
      expect(outlet.activatedRoute.snapshot.data.feedType).toBe(feed);
      expect(api.fetchFeed).toHaveBeenCalledWith(feed, 2);
    }));
  });

  it('loads the actual item and user modules and resolves their child routes', fakeAsync(() => {
    const fixture = TestBed.createComponent(RouteHostComponent);
    fixture.detectChanges();
    navigate('/item/42');
    tick();
    fixture.detectChanges();
    let outlet = fixture.debugElement.query(By.directive(RouterOutlet)).injector.get(RouterOutlet);
    expect(outlet.component instanceof ItemDetailsComponent).toBe(true);
    expect(outlet.activatedRoute.snapshot.params.id).toBe('42');
    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(fixture.nativeElement.textContent).toContain('Item route');
    navigate('/user/alice');
    tick();
    fixture.detectChanges();
    outlet = fixture.debugElement.query(By.directive(RouterOutlet)).injector.get(RouterOutlet);
    expect(outlet.component instanceof UserComponent).toBe(true);
    expect(outlet.activatedRoute.snapshot.params.id).toBe('alice');
    expect(api.fetchUser).toHaveBeenCalledWith('alice');
    expect(fixture.nativeElement.textContent).toContain('User route');
  }));

  it('keeps the feed route active when the API fails', fakeAsync(() => {
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    const fixture = TestBed.createComponent(RouteHostComponent);
    fixture.detectChanges();
    navigate('/ask/1');
    tick();
    fixture.detectChanges();
    const outlet = fixture.debugElement.query(By.directive(RouterOutlet)).injector.get(RouterOutlet);
    expect((outlet.component as FeedComponent).errorMessage).toBe('Could not load ask stories.');
    expect(TestBed.inject(Router).url).toBe('/ask/1');
  }));

  it('rejects unknown routes without calling the API', fakeAsync(() => {
    const fixture = TestBed.createComponent(RouteHostComponent);
    fixture.detectChanges();
    let failure: Error;
    navigate('/missing').catch(error => failure = error);
    tick();
    expect(failure.message).toContain('Cannot match any routes');
    expect(api.fetchFeed).not.toHaveBeenCalled();
    expect(api.fetchItemContent).not.toHaveBeenCalled();
    expect(api.fetchUser).not.toHaveBeenCalled();
  }));
});
