import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, NEVER, Observable, of, throwError } from 'rxjs';

import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { ItemDetailsComponent } from './item-details.component';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let settings: Settings;
  let params$: BehaviorSubject<any>;
  let scrollSpy: jasmine.Spy;

  const story = {
    id: 7,
    title: 'An interesting story',
    points: 99,
    user: 'carol',
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/a',
    domain: 'example.com',
    content: '<p>body</p>',
    comments: [{ id: 70 }, { id: 71 }],
    comments_count: 2,
  } as any as Story;

  function setup(response: Observable<Story>, openLinkInNewTab = false) {
    params$ = new BehaviorSubject({ id: '7' });
    settings = { showSettings: false, openLinkInNewTab, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    api.fetchItemContent.and.returnValue(response);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    scrollSpy = spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: params$ } },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  it('should show the loader while loading and scroll to top', () => {
    setup(NEVER);

    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.item')).toBeNull();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('should fetch the item using the numeric :id route param', () => {
    setup(of(story));

    expect(api.fetchItemContent).toHaveBeenCalledWith(7);
    expect(component.item).toBe(story);
  });

  it('should refetch when the :id param changes', () => {
    setup(of(story));

    params$.next({ id: '8' });

    expect(api.fetchItemContent.calls.allArgs()).toEqual([[7], [8]]);
  });

  it('should render an external story with comments', () => {
    setup(of(story));

    expect(el.querySelector('app-loader')).toBeNull();
    const titles = Array.from(el.querySelectorAll('a.title')) as HTMLAnchorElement[];
    expect(titles.length).toBe(2);
    titles.forEach(a => {
      expect(a.getAttribute('href')).toBe('https://example.com/a');
      expect(a.hasAttribute('target')).toBe(false);
    });
    expect(el.querySelector('.domain').textContent).toBe('(example.com)');
    expect(el.querySelector('.subject').innerHTML).toBe('<p>body</p>');
    expect(el.querySelectorAll('.comment-list > li').length).toBe(2);
    expect(el.querySelector('.laptop').classList).toContain('item-header');
    expect(el.querySelector('.subtext').textContent).toContain('99 points by');
    expect(el.querySelector('.subtext').textContent).toContain('2 comments');
    expect(el.querySelector('.pollResults')).toBeNull();
  });

  it('should open links in a new tab when configured', () => {
    setup(of(story), true);

    el.querySelectorAll('a.title').forEach(a => {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener');
    });
  });

  it('should render internal title links for self posts (Ask HN)', () => {
    setup(of({ ...story, url: 'item?id=7', domain: undefined, comments_count: 0 } as Story));

    expect(component.hasUrl).toBe(false);
    el.querySelectorAll('a.title').forEach(a => expect(a.hasAttribute('href')).toBe(false));
    expect(el.querySelector('.domain')).toBeNull();
    expect(el.querySelector('.laptop').classList).not.toContain('item-header');
    expect(el.querySelector('.subtext').textContent).toContain('discuss');
  });

  it('should hide points and comments for jobs', () => {
    setup(of({ ...story, type: 'job', comments: [], comments_count: 0 } as Story));

    expect(el.querySelector('.subtext').textContent).not.toContain('points by');
    expect(el.querySelector('.laptop').classList).toContain('item-header');
  });

  it('should render poll results with bars proportional to votes', () => {
    setup(of({
      ...story,
      type: 'poll',
      poll: [{ content: 'Yes', points: 3 }, { content: 'No', points: 1 }],
      poll_votes_count: 4,
    } as Story));

    const bars = Array.from(el.querySelectorAll('.pollBar')) as HTMLElement[];
    expect(bars.map(b => b.style.width)).toEqual(['75%', '25%']);
    expect(el.querySelector('.pollContent .subtext').textContent).toBe('3 points');
  });

  it('should show an error message when the item fails to load', () => {
    setup(throwError(new Error('boom')));

    expect(component.errorMessage).toBe('Could not load item comments.');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')).not.toBeNull();
  });

  it('should go back in history when the back button is clicked', () => {
    setup(of(story));

    (el.querySelector('.back-button') as HTMLElement).click();

    expect(location.back).toHaveBeenCalled();
  });
});
