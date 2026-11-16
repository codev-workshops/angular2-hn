import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { ItemDetailsComponent } from './item-details.component';
import { Story } from '../shared/models/story';
import { PipesModule } from '../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { StubCommentComponent, StubErrorMessageComponent, StubLoaderComponent } from '../shared/testing/stub-components';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let params: Subject<{ id: string }>;
  let response: Subject<Story>;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let back: jasmine.Spy;
  const settings = { openLinkInNewTab: true };

  function render(item: Partial<Story> & { content?: string, text?: string } = {}) {
    response.next(Object.assign(new Story(), {
      id: 42, title: 'A story', url: 'https://example.com/story', domain: 'example.com',
      type: 'news', user: 'alice', points: 12, time_ago: 'an hour ago', comments_count: 1,
      comments: [], content: '<b>Story content</b>'
    }, item));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    params = new Subject();
    response = new Subject();
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    api.fetchItemContent.and.returnValue(response);
    back = jasmine.createSpy('back');
    settings.openLinkInNewTab = true;
    spyOn(window, 'scrollTo');
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemDetailsComponent, StubCommentComponent, StubErrorMessageComponent, StubLoaderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params } },
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: { settings } },
        { provide: Location, useValue: { back } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ItemDetailsComponent);
    fixture.detectChanges();
    params.next({ id: '42' });
  });

  afterEach(() => {
    fixture.componentInstance.sub.unsubscribe();
    response.complete();
    params.complete();
  });

  it('shows the loader while fetching the numeric route id and scrolls to the top', () => {
    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.item')).toBeNull();
    expect(fixture.debugElement.query(By.directive(StubErrorMessageComponent))).toBeNull();
  });

  it('renders story links, metadata, rich content and typed child comment inputs', () => {
    const comment = { id: 7, user: 'bob', time: 1, time_ago: 'now', level: 0,
      content: 'Hello', deleted: false, comments: [] };
    render({ comments: [comment] });
    const titles: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a.title');
    expect(titles.length).toBe(2);
    Array.from(titles).forEach(title => {
      expect(title.textContent.trim()).toBe('A story');
      expect(title.getAttribute('href')).toBe('https://example.com/story');
      expect(title.target).toBe('_blank');
      expect(title.rel).toBe('noopener');
    });
    expect(fixture.nativeElement.querySelector('.domain').textContent).toContain('example.com');
    expect(fixture.nativeElement.querySelector('.subtext').textContent).toContain('12 points by');
    expect(fixture.nativeElement.querySelector('a[href="/user/alice"]').textContent).toBe('alice');
    expect(fixture.nativeElement.querySelector('a[href="/item/42"]').textContent).toContain('1 comment');
    expect(fixture.nativeElement.querySelector('.subject b').textContent).toBe('Story content');
    expect(fixture.debugElement.query(By.directive(StubCommentComponent)).componentInstance.comment).toBe(comment);
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).toBeNull();
  });

  it('removes external link target and rel when opening in the same tab', () => {
    settings.openLinkInNewTab = false;
    render();
    Array.from(fixture.nativeElement.querySelectorAll('a.title') as NodeListOf<HTMLAnchorElement>).forEach(title => {
      expect(title.getAttribute('target')).toBeNull();
      expect(title.getAttribute('rel')).toBeNull();
    });
  });

  it('uses internal links for items without an external URL and renders an empty discussion', () => {
    render({ url: 'item?id=42', domain: '', comments_count: 0, content: '' });
    const titles: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a.title');
    Array.from(titles).forEach(title => expect(title.getAttribute('href')).toBe('/item/42'));
    expect(fixture.nativeElement.querySelector('.domain')).toBeNull();
    expect(fixture.nativeElement.querySelector('.subtext').textContent).toContain('discuss');
    expect(fixture.nativeElement.querySelectorAll('app-comment').length).toBe(0);
    expect(fixture.nativeElement.querySelector('.laptop').classList.contains('item-header')).toBe(false);
  });

  it('renders jobs without voting or discussion metadata and applies header classes', () => {
    render({ type: 'job', comments_count: 0, text: 'Job description' });
    const header: HTMLElement = fixture.nativeElement.querySelector('.laptop');
    expect(header.classList.contains('item-header')).toBe(true);
    expect(header.classList.contains('head-margin')).toBe(true);
    expect(header.querySelector('.subtext').textContent).not.toContain('points');
    expect(header.querySelector('.subtext a')).toBeNull();
    expect(header.querySelector('.subtext').textContent).toContain('an hour ago');
  });

  it('refetches and replaces the displayed item when the route id changes', () => {
    render();
    params.next({ id: '99' });
    expect(api.fetchItemContent.calls.allArgs()).toEqual([[42], [99]]);
    render({ id: 99, title: 'Next story' });
    expect(fixture.nativeElement.querySelector('a.title').textContent.trim()).toBe('Next story');
  });

  it('renders poll answers, scores and proportional bars', () => {
    render({ type: 'poll', poll_votes_count: 4,
      poll: [{ content: '<b>Yes</b>', points: 3 }, { content: 'No', points: 1 }] });
    const answers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.pollContent');
    expect(answers.length).toBe(2);
    expect(answers[0].querySelector('b').textContent).toBe('Yes');
    expect(answers[0].querySelector('.subtext').textContent).toBe('3 points');
    expect((answers[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
    expect((answers[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
  });

  it('renders an empty poll without answer bars', () => {
    render({ type: 'poll', poll: [], poll_votes_count: 0 });
    expect(fixture.nativeElement.querySelector('.pollResults')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.pollBar')).toBeNull();
  });

  it('replaces the loader with the error message when fetching fails', () => {
    response.error(new Error('offline'));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(StubErrorMessageComponent)).componentInstance.message)
      .toBe('Could not load item comments.');
    expect(fixture.debugElement.query(By.directive(StubLoaderComponent))).toBeNull();
    expect(fixture.nativeElement.querySelector('.item')).toBeNull();
  });

  it('navigates back when the back control is clicked', () => {
    render();
    fixture.nativeElement.querySelector('.back-button').click();
    expect(back).toHaveBeenCalledTimes(1);
  });
});
