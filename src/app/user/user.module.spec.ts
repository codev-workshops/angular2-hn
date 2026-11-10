import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Route, ROUTES } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of } from 'rxjs';

import { UserModule } from './user.module';
import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-user-module-host',
  template: `
    <app-user></app-user>
    <a class="profile-link" routerLink="/user/pg">pg</a>
  `
})
class UserModuleHostComponent {}

function flatten(routes: any[]): Route[] {
  return routes.reduce((acc: Route[], r) => acc.concat(Array.isArray(r) ? flatten(r) : [r]), []);
}

describe('UserModule', () => {
  let api: jasmine.SpyObj<HackerNewsAPIService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, UserModule],
      declarations: [UserModuleHostComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } },
        { provide: Location, useValue: jasmine.createSpyObj<Location>('Location', ['back']) }
      ]
    }).compileComponents();
  });

  it('registers a single child route ":id" rendering UserComponent', () => {
    const routes = flatten(TestBed.inject(ROUTES) as any[]);
    const userRoutes = routes.filter(r => r.component === UserComponent);
    expect(userRoutes.length).toBe(1);
    expect(userRoutes[0].path).toBe(':id');
  });

  it('exports UserComponent wired to the real shared loader component', () => {
    api.fetchUser.and.returnValue(NEVER);
    const fixture = TestBed.createComponent(UserModuleHostComponent);
    fixture.detectChanges();

    const user = fixture.debugElement.query(By.directive(UserComponent));
    expect(user).not.toBeNull();
    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    const loader = user.query(By.directive(LoaderComponent));
    expect(loader).not.toBeNull();
    expect(loader.nativeElement.textContent.trim()).toBe('Loading...');
  });

  it('renders a loaded user through the exported component', () => {
    api.fetchUser.and.returnValue(of(Object.assign(new User(), { id: 'pg', karma: 7, created: 'today', about: '' })));
    const fixture = TestBed.createComponent(UserModuleHostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-user .title-block').textContent.trim()).toBe('Profile: pg');
    expect(el.querySelector('app-user .right').textContent.trim()).toBe('7 ★');
    expect(el.querySelector('app-user .other-details')).toBeNull();
  });

  it('re-exports RouterModule so importers can use routerLink', () => {
    api.fetchUser.and.returnValue(NEVER);
    const fixture = TestBed.createComponent(UserModuleHostComponent);
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.profile-link');
    expect(link.getAttribute('href')).toBe('/user/pg');
  });
});
