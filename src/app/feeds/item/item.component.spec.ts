import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { Story } from '../../shared/models/story';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../shared/services/settings.service';
import { CommentPipe } from '../../shared/pipes/comment.pipe';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let item: Story;
  let settings: Settings;

  beforeEach(() => {
    settings = {
      showSettings: false, openLinkInNewTab: true, theme: 'default', titleFontSize: '20', listSpacing: '8'
    };
    item = {
      id: 42, title: 'A useful story', url: 'https://example.com/article', domain: 'example.com',
      points: 17, user: 'alice', time_ago: 2, type: 'story', comments_count: 3
    } as Story;
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings } }]
    });
    fixture = TestBed.createComponent(ItemComponent);
    fixture.componentInstance.item = item;
  });

  it('renders an external story with domain, safe new-tab attributes and configured spacing', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.title');
    expect(title.textContent.trim()).toBe('A useful story');
    expect(title.getAttribute('href')).toBe(item.url);
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
    expect(title.style.fontSize).toBe('20px');
    expect(fixture.nativeElement.querySelector('div').style.marginBottom).toBe('8px');
    expect(fixture.nativeElement.querySelector('.domain').textContent).toBe('(example.com)');
    expect(fixture.componentInstance.hasUrl).toBe(true);
  });

  it('renders user, points, time and comment links in both responsive layouts', () => {
    fixture.detectChanges();
    ['.subtext-palm', '.subtext-laptop'].forEach(selector => {
      const layout = fixture.nativeElement.querySelector(selector);
      expect(layout.textContent).toContain('17');
      expect(layout.textContent).toContain('2');
      expect(layout.querySelector('a[href="/user/alice"]').textContent).toBe('alice');
      expect(layout.querySelector('a[href="/item/42"]').textContent).toContain('3 comments');
    });
    expect(fixture.nativeElement.querySelector('.item-details')).not.toBeNull();
  });

  it('routes URL-less stories to their details and omits absent domains', () => {
    item.url = '';
    item.domain = '';
    item.comments_count = 0;
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.title');
    expect(title.getAttribute('href')).toBe('/item/42');
    expect(title.textContent.trim()).toBe(item.title);
    expect(title.hasAttribute('target')).toBe(false);
    expect(fixture.nativeElement.querySelector('.domain')).toBeNull();
    expect(fixture.nativeElement.querySelector('.comment-number').textContent).toContain('discuss');
    expect(fixture.componentInstance.hasUrl).toBe(false);
  });

  it('renders a job without user, points or comment links', () => {
    item.type = 'job';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.title').getAttribute('href')).toBe(item.url);
    expect(fixture.nativeElement.querySelector('.subtext-laptop').textContent.trim()).toBe('2');
    expect(fixture.nativeElement.querySelector('.subtext-palm').textContent.trim()).toBe('2');
    expect(fixture.nativeElement.querySelectorAll('a[href="/user/alice"], a[href="/item/42"]').length).toBe(0);
    expect(fixture.nativeElement.querySelector('.item-details')).toBeNull();
  });

  it('updates external-link attributes and styles when settings change', () => {
    fixture.detectChanges();
    settings.openLinkInNewTab = false;
    settings.titleFontSize = '16';
    settings.listSpacing = '0';
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.title');
    expect(title.hasAttribute('target')).toBe(false);
    expect(title.hasAttribute('rel')).toBe(false);
    expect(title.style.fontSize).toBe('16px');
    expect(fixture.nativeElement.querySelector('div').style.marginBottom).toBe('0px');
  });
});
