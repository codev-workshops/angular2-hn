import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Data, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import {
  StubErrorMessageComponent, StubItemComponent, StubLoaderComponent
} from '../../shared/testing/stub-components';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let data: BehaviorSubject<Data>;
  let params: BehaviorSubject<Params>;
  let response: Subject<Story[]>;
  let api: jasmine.SpyObj<HackerNewsAPIService>;

  beforeEach(() => {
    data = new BehaviorSubject<Data>({ feedType: 'news' });
    params = new BehaviorSubject<Params>({});
    response = new Subject<Story[]>();
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    api.fetchFeed.and.returnValue(response);
    spyOn(window, 'scrollTo');
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent, StubLoaderComponent, StubErrorMessageComponent, StubItemComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data, params } }
      ]
    });
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.componentInstance.typeSub.unsubscribe();
    fixture.componentInstance.pageSub.unsubscribe();
    response.complete();
    fixture.destroy();
  });

  function finish(items: Story[]) {
    response.next(items);
    response.complete();
    fixture.detectChanges();
  }

  it('fetches page one by default and displays only the loader while pending', () => {
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(StubErrorMessageComponent))).toBeNull();
    expect(fixture.nativeElement.querySelector('ol')).toBeNull();
  });

  it('passes every story to an item and links a full first page to the next page', () => {
    const items = Array.from({ length: 30 }, (_, id) => ({ id, title: 'Story ' + id } as Story));
    finish(items);
    const children = fixture.debugElement.queryAll(By.directive(StubItemComponent));
    expect(children.length).toBe(30);
    children.forEach((child, index) => expect(child.componentInstance.item).toBe(items[index]));
    expect(fixture.nativeElement.querySelector('ol').getAttribute('start')).toBe('1');
    expect(fixture.nativeElement.querySelector('ol').classList.contains('list-margin')).toBe(true);
    expect(fixture.nativeElement.querySelector('.prev')).toBeNull();
    expect(fixture.nativeElement.querySelector('.more').getAttribute('href')).toBe('/news/2');
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('refetches numeric route pages and uses updated route data on the next navigation', () => {
    response.complete();
    response = new Subject<Story[]>();
    api.fetchFeed.and.returnValue(response);
    data.next({ feedType: 'ask' });
    params.next({ page: '3' });
    expect(api.fetchFeed.calls.allArgs()).toEqual([['news', 1], ['ask', 3]]);
    finish([{ id: 42 } as Story]);
    expect(fixture.nativeElement.querySelector('ol').getAttribute('start')).toBe('61');
    expect(fixture.nativeElement.querySelector('.prev').getAttribute('href')).toBe('/ask/2');
    expect(fixture.nativeElement.querySelector('.more')).toBeNull();
  });

  it('renders an empty successful feed without loading, errors or pagination', () => {
    finish([]);
    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(0);
    expect(fixture.nativeElement.querySelector('ol').getAttribute('start')).toBe('1');
    expect(fixture.nativeElement.querySelectorAll('.nav a').length).toBe(0);
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).toBeNull();
    expect(fixture.debugElement.query(By.directive(StubErrorMessageComponent))).toBeNull();
  });

  it('renders jobs guidance and removes list margin for the jobs feed', () => {
    data.next({ feedType: 'jobs' });
    finish([{ id: 1 } as Story]);
    expect(fixture.nativeElement.querySelector('.job-header').textContent).toContain('Y Combinator');
    expect(fixture.nativeElement.querySelector('.job-header a').getAttribute('href'))
      .toBe('https://triplebyte.com/?ref=yc_jobs');
    expect(fixture.nativeElement.querySelector('ol').classList.contains('list-margin')).toBe(false);
  });

  it('does not render the ordered list for the new feed', () => {
    data.next({ feedType: 'new' });
    finish([{ id: 1 } as Story]);
    expect(fixture.nativeElement.querySelector('ol')).toBeNull();
    expect(fixture.nativeElement.querySelector('.job-header')).toBeNull();
  });

  it('passes the feed-specific failure message to the error component', () => {
    response.error(new Error('offline'));
    fixture.detectChanges();
    const error = fixture.debugElement.query(By.directive(StubErrorMessageComponent));
    expect(error.componentInstance.message).toBe('Could not load news stories.');
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).toBeNull();
    expect(fixture.nativeElement.querySelector('ol')).toBeNull();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
