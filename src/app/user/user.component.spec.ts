import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';
import { StubErrorMessageComponent, StubLoaderComponent } from '../shared/testing/stub-components';

function makeUser(overrides: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 'pg',
    created: '12 years ago',
    karma: 155111,
    about: 'Bug fixer. <a href="http://paulgraham.com">paulgraham.com</a>'
  }, overrides);
}

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let params$: BehaviorSubject<Params>;
  let responses: { [id: string]: Subject<User> };
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  function respond(id: string, user: User) {
    responses[id].next(user);
    responses[id].complete();
    fixture.detectChanges();
  }

  function fail(id: string) {
    responses[id].error(new Error('offline'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    params$ = new BehaviorSubject<Params>({ id: 'pg' });
    responses = {};
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    api.fetchUser.and.callFake((id: string) => {
      responses[id] = new Subject<User>();
      return responses[id].asObservable();
    });
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    await TestBed.configureTestingModule({
      declarations: [UserComponent, StubLoaderComponent, StubErrorMessageComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } },
        { provide: Location, useValue: location }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fetches the user named by the :id route param', () => {
    expect(api.fetchUser).toHaveBeenCalledTimes(1);
    expect(api.fetchUser).toHaveBeenCalledWith('pg');
  });

  it('shows only the loader while the user is loading', () => {
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(StubErrorMessageComponent))).toBeNull();
    expect(el().querySelector('.profile')).toBeNull();
  });

  describe('when the user loads', () => {
    beforeEach(() => respond('pg', makeUser()));

    it('hides the loader and error message', () => {
      expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).toBeNull();
      expect(fixture.debugElement.query(By.directive(StubErrorMessageComponent))).toBeNull();
    });

    it('renders the mobile header, name, karma and creation date', () => {
      expect(component.user.id).toBe('pg');
      expect(el().querySelector('.profile .item-header .title-block').textContent.trim()).toBe('Profile: pg');
      expect(el().querySelector('.main-details .name').textContent.trim()).toBe('pg');
      expect(el().querySelector('.main-details .right').textContent.trim()).toBe('155111 ★');
      expect(el().querySelector('.main-details .age').textContent.trim()).toBe('Created 12 years ago');
    });

    it('renders the about section as HTML', () => {
      const about = el().querySelector('.other-details p');
      expect(about.textContent).toBe('Bug fixer. paulgraham.com');
      const link = about.querySelector('a');
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('http://paulgraham.com');
    });

    it('navigates back when the back button is clicked', () => {
      (el().querySelector('.back-button') as HTMLElement).click();
      expect(location.back).toHaveBeenCalledTimes(1);
    });
  });

  it('omits the about section when the user has no bio', () => {
    respond('pg', makeUser({ about: undefined }));
    expect(el().querySelector('.profile')).not.toBeNull();
    expect(el().querySelector('.other-details')).toBeNull();
  });

  it('sanitizes unsafe markup in the about section', () => {
    respond('pg', makeUser({ about: '<img src="data:," onerror="window.__pwned = true">hi' }));
    const img = el().querySelector('.other-details img');
    expect(img).not.toBeNull();
    expect(img.hasAttribute('onerror')).toBe(false);
  });

  describe('when the user fails to load', () => {
    beforeEach(() => fail('pg'));

    it('sets an error message naming the user', () => {
      expect(component.errorMessage).toBe('Could not load user pg.');
    });

    it('passes the message to the error component and hides the loader and profile', () => {
      const error = fixture.debugElement.query(By.directive(StubErrorMessageComponent));
      expect(error).not.toBeNull();
      expect((error.componentInstance as StubErrorMessageComponent).message).toBe('Could not load user pg.');
      expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).toBeNull();
      expect(el().querySelector('.profile')).toBeNull();
    });
  });

  describe('when the :id route param changes', () => {
    it('refetches and renders the new user', () => {
      respond('pg', makeUser());

      params$.next({ id: 'dang' });
      expect(api.fetchUser).toHaveBeenCalledTimes(2);
      expect(api.fetchUser.calls.mostRecent().args).toEqual(['dang']);

      respond('dang', makeUser({ id: 'dang', karma: 42 }));
      expect(el().querySelector('.main-details .name').textContent.trim()).toBe('dang');
      expect(el().querySelector('.main-details .right').textContent.trim()).toBe('42 ★');
    });

    it('recovers from a previous error once the new user loads', () => {
      fail('pg');
      params$.next({ id: 'dang' });
      respond('dang', makeUser({ id: 'dang' }));

      expect(fixture.debugElement.query(By.directive(StubErrorMessageComponent))).toBeNull();
      expect(el().querySelector('.title-block').textContent.trim()).toBe('Profile: dang');
    });

    it('names the new user in the error message if that fetch fails', () => {
      params$.next({ id: 'ghost' });
      fail('ghost');

      expect(component.errorMessage).toBe('Could not load user ghost.');
      const error = fixture.debugElement.query(By.directive(StubErrorMessageComponent));
      expect((error.componentInstance as StubErrorMessageComponent).message).toBe('Could not load user ghost.');
    });
  });
});
