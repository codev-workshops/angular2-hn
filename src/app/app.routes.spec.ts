import { Location } from '@angular/common';
import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, ROUTES, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER } from 'rxjs';

import { routing } from './app.routes';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';
import { UserComponent } from './user/user.component';

// app.routes.ts only exports `routing` (RouterModule.forRoot); read the route config from its ROUTES provider.
function flatten(providers: any[]): any[] {
  return providers.reduce((acc, p) => acc.concat(Array.isArray(p) ? flatten(p) : [p]), []);
}
const routes: Routes = flatten(routing.providers).find(p => p && p.provide === ROUTES).useValue;

@Component({ template: '<router-outlet></router-outlet>' })
class RouterHostComponent {}

describe('app routes', () => {
  let router: Router;
  let location: Location;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let fixture: ComponentFixture<RouterHostComponent>;

  async function navigate(url: string): Promise<boolean> {
    const result = await TestBed.inject(NgZone).run(() => router.navigateByUrl(url));
    fixture.detectChanges();
    return result;
  }

  function activeRoute(): ActivatedRoute {
    let route = router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed', 'fetchItemContent', 'fetchUser']);
    api.fetchFeed.and.returnValue(NEVER);
    api.fetchItemContent.and.returnValue(NEVER);
    api.fetchUser.and.returnValue(NEVER);
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [RouterHostComponent, FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        {
          provide: SettingsService,
          useValue: { settings: { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(RouterHostComponent);
  });

  it('should redirect the empty path to /news/1', async () => {
    await navigate('');
    expect(location.path()).toBe('/news/1');
    expect(activeRoute().component).toBe(FeedComponent);
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  ['news', 'newest', 'show', 'ask', 'jobs'].forEach(feedType => {
    it(`should route /${feedType}/:page to FeedComponent with feedType "${feedType}"`, async () => {
      await navigate(`/${feedType}/2`);

      expect(location.path()).toBe(`/${feedType}/2`);
      expect(activeRoute().component).toBe(FeedComponent);
      expect(activeRoute().snapshot.data.feedType).toBe(feedType);
      expect(api.fetchFeed).toHaveBeenCalledWith(feedType, 2);
    });
  });

  it('should lazy load the item details module for /item/:id', async () => {
    await navigate('/item/123');

    expect(activeRoute().component).toBe(ItemDetailsComponent);
    expect(api.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('should lazy load the user module for /user/:id', async () => {
    await navigate('/user/pg');

    expect(activeRoute().component).toBe(UserComponent);
    expect(api.fetchUser).toHaveBeenCalledWith('pg');
  });

  it('should reject unknown routes', async () => {
    await expectAsync(navigate('/does-not-exist')).toBeRejected();
  });
});
