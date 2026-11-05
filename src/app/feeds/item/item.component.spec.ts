import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { ItemComponent } from './item.component';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let el: HTMLElement;
  let settings: Settings;

  const baseStory = {
    id: 42,
    title: 'Show HN: A thing',
    points: 120,
    user: 'alice',
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments_count: 3,
  } as any as Story;

  function render(item: Partial<Story>, overrides: Partial<Settings> = {}) {
    Object.assign(settings, overrides);
    component.item = { ...baseStory, ...item } as Story;
    fixture.detectChanges();
  }

  beforeEach(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '18', listSpacing: '6' };

    TestBed.configureTestingModule({
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('should create with the shared settings', () => {
    render({});
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('hasUrl should be true only for absolute http(s) urls', () => {
    component.item = { ...baseStory, url: 'https://x.y' } as Story;
    expect(component.hasUrl).toBe(true);
    component.item = { ...baseStory, url: 'http://x.y' } as Story;
    expect(component.hasUrl).toBe(true);
    component.item = { ...baseStory, url: 'item?id=42' } as Story;
    expect(component.hasUrl).toBe(false);
  });

  it('should render an external link with the domain, applying font size and spacing', () => {
    render({});

    const title = el.querySelector('a.title') as HTMLAnchorElement;
    expect(title.getAttribute('href')).toBe('https://example.com/post');
    expect(title.textContent.trim()).toBe('Show HN: A thing');
    expect(title.style.fontSize).toBe('18px');
    expect(title.hasAttribute('target')).toBe(false);
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('6px');
    expect(el.querySelector('.domain').textContent).toBe('(example.com)');
  });

  it('should open external links in a new tab when configured', () => {
    render({}, { openLinkInNewTab: true });

    const title = el.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('should omit the domain when it is missing', () => {
    render({ domain: '' });
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('should render an internal title link for self posts', () => {
    render({ url: 'item?id=42' });

    const title = el.querySelector('a.title') as HTMLAnchorElement;
    expect(title.hasAttribute('href')).toBe(false);
    expect(title.textContent.trim()).toBe('Show HN: A thing');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('should show points, author and pluralised comment count for stories', () => {
    render({});

    expect(el.querySelector('.subtext-palm .name').textContent).toContain('alice');
    expect(el.querySelector('.subtext-palm .right').textContent).toContain('120 ★');
    expect(el.querySelector('.comment-number').textContent).toContain('3 comments');
    expect(el.querySelector('.subtext-laptop').textContent).toContain('120 points by');
  });

  it('should hide points, author and comments for jobs', () => {
    render({ type: 'job', comments_count: 0 });

    expect(el.querySelector('.subtext-palm .name')).toBeNull();
    expect(el.querySelector('.comment-number')).toBeNull();
    expect(el.querySelector('.subtext-laptop').textContent).not.toContain('points by');
    expect(el.querySelector('.subtext-laptop').textContent).toContain('2 hours ago');
  });

  it('should show "discuss" when a story has no comments', () => {
    render({ comments_count: 0 });
    expect(el.querySelector('.comment-number').textContent).toContain('discuss');
  });
});
