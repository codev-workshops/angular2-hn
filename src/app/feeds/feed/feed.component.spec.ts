import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, NEVER, Observable, of, throwError } from 'rxjs';

import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let data$: BehaviorSubject<any>;
  let params$: BehaviorSubject<any>;
  let scrollSpy: jasmine.Spy;

  function stories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => ({ id: i + 1, title: `Story ${i + 1}` } as Story));
  }

  function setup(feedType: string, params: any, response: Observable<Story[]>) {
    data$ = new BehaviorSubject({ feedType });
    params$ = new BehaviorSubject(params);
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    api.fetchFeed.and.returnValue(response);
    scrollSpy = spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data: data$, params: params$ } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  function navText(): string[] {
    return Array.from(el.querySelectorAll('.nav a')).map(a => a.textContent.trim());
  }

  it('should show the loader while the feed is loading', () => {
    setup('news', { page: '1' }, NEVER);

    expect(component).toBeTruthy();
    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('app-error-message')).toBeNull();
    expect(el.querySelector('ol')).toBeNull();
  });

  it('should fetch the feed type from route data and page from params', () => {
    setup('show', { page: '3' }, of(stories(30)));

    expect(api.fetchFeed).toHaveBeenCalledWith('show', 3);
    expect(component.feedType).toBe('show');
    expect(component.pageNum).toBe(3);
    expect(component.listStart).toBe(61);
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('should default to page 1 when no page param is present', () => {
    setup('news', {}, of(stories(2)));

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('should render the items on the first page with only a "More" link for a full page', () => {
    setup('news', { page: '1' }, of(stories(30)));

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelectorAll('li.post').length).toBe(30);
    expect(el.querySelector('ol').getAttribute('start')).toBe('1');
    expect(el.querySelector('ol').classList).toContain('list-margin');
    expect(el.querySelector('.job-header')).toBeNull();
    expect(navText()).toEqual(['More ›']);
  });

  it('should render both "Prev" and "More" on a middle page', () => {
    setup('newest', { page: '2' }, of(stories(30)));

    expect(el.querySelector('ol').getAttribute('start')).toBe('31');
    expect(navText()).toEqual(['‹ Prev', 'More ›']);
  });

  it('should hide "More" on the last (partial) page', () => {
    setup('ask', { page: '4' }, of(stories(5)));

    expect(navText()).toEqual(['‹ Prev']);
  });

  it('should render an empty list without pagination when no items are returned', () => {
    setup('news', { page: '1' }, of([]));

    expect(el.querySelector('ol')).not.toBeNull();
    expect(el.querySelectorAll('li.post').length).toBe(0);
    expect(navText()).toEqual([]);
  });

  it('should show the YC jobs header and no list margin for the jobs feed', () => {
    setup('jobs', { page: '1' }, of(stories(3)));

    expect(el.querySelector('.job-header')).not.toBeNull();
    expect(el.querySelector('ol').classList).not.toContain('list-margin');
  });

  it('should show an error message when the feed fails to load', () => {
    setup('show', { page: '1' }, throwError(new Error('offline')));

    expect(component.errorMessage).toBe('Could not load show stories.');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')).not.toBeNull();
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('should refetch when the page param changes', () => {
    setup('news', { page: '1' }, of(stories(30)));

    params$.next({ page: '2' });
    fixture.detectChanges();

    expect(api.fetchFeed.calls.allArgs()).toEqual([['news', 1], ['news', 2]]);
    expect(component.listStart).toBe(31);
  });
});
