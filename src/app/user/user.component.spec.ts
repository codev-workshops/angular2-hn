import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, NEVER, Observable, of, throwError } from 'rxjs';

import { User } from '../shared/models/user';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { UserComponent } from './user.component';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let params$: BehaviorSubject<any>;

  const user = { id: 'dang', karma: 12345, created: '12 years ago', about: '<i>moderator</i>' } as User;

  function setup(response: Observable<User>) {
    params$ = new BehaviorSubject({ id: 'dang' });
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    api.fetchUser.and.returnValue(response);
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: params$ } },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  it('should show the loader while loading', () => {
    setup(NEVER);

    expect(component).toBeTruthy();
    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.profile')).toBeNull();
  });

  it('should fetch the user from the :id route param and render the profile', () => {
    setup(of(user));

    expect(api.fetchUser).toHaveBeenCalledWith('dang');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.name').textContent).toBe('dang');
    expect(el.querySelector('.right').textContent).toContain('12345 ★');
    expect(el.querySelector('.age').textContent).toBe('Created 12 years ago');
    expect(el.querySelector('.other-details p').innerHTML).toBe('<i>moderator</i>');
  });

  it('should omit the about section when the user has none', () => {
    setup(of({ ...user, about: undefined } as User));
    expect(el.querySelector('.other-details')).toBeNull();
  });

  it('should refetch when the :id param changes', () => {
    setup(of(user));
    params$.next({ id: 'pg' });
    expect(api.fetchUser.calls.allArgs()).toEqual([['dang'], ['pg']]);
  });

  it('should show an error message when the user fails to load', () => {
    setup(throwError(new Error('404')));

    expect(component.errorMessage).toBe('Could not load user dang.');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')).not.toBeNull();
  });

  it('should go back in history when the back button is clicked', () => {
    setup(of(user));
    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });
});
