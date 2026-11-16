import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, ROUTES, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { ItemDetailsModule } from './item-details.module';
import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { Story } from '../shared/models/story';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

@Component({ selector: 'app-details-host', template: '<app-item-details></app-item-details>' })
class DetailsHostComponent {}

describe('ItemDetailsModule', () => {
  let fixture: ComponentFixture<DetailsHostComponent>;
  let response: Subject<Story>;

  beforeEach(async () => {
    response = new Subject();
    spyOn(window, 'scrollTo');
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ItemDetailsModule],
      declarations: [DetailsHostComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '42' }) } },
        { provide: HackerNewsAPIService, useValue: { fetchItemContent: () => response } },
        { provide: SettingsService, useValue: { settings: { openLinkInNewTab: false } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DetailsHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.debugElement.query(By.directive(ItemDetailsComponent)).componentInstance.sub.unsubscribe();
    response.complete();
  });

  it('exports a usable details component with the real loader for pending content', () => {
    expect(fixture.nativeElement.querySelector('app-loader .loader').textContent).toContain('Loading...');
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeNull();
  });

  it('wires the parameterized feature route to the details component', () => {
    const groups: Routes[] = TestBed.inject(ROUTES);
    const routes = ([] as Routes).concat(...groups);
    expect(routes.find(route => route.path === ':id').component).toBe(ItemDetailsComponent);
  });

  it('renders real comments and the imported comment pipe through the exported component', () => {
    response.next(Object.assign(new Story(), {
      id: 42, title: 'Integrated story', url: '', type: 'story', comments_count: 2,
      comments: [{ id: 1, user: 'alice', content: '<em>Parent</em>', comments: [
        { id: 2, user: 'bob', content: 'Child', comments: [] }
      ] }]
    }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a.title').getAttribute('href')).toBe('/item/42');
    expect(fixture.nativeElement.querySelector('.subtext').textContent).toContain('2 comments');
    expect(fixture.debugElement.queryAll(By.directive(CommentComponent)).length).toBe(2);
    expect(fixture.nativeElement.querySelector('.comment-text em').textContent).toBe('Parent');
    expect(fixture.nativeElement.querySelector('a[href="/user/bob"]').textContent).toBe('bob');
    const toggle: HTMLElement = fixture.nativeElement.querySelector('app-comment .collapse');
    toggle.click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('.comment-tree > div') as HTMLElement).hidden).toBe(true);
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });

  it('renders the real error component when the service fails', () => {
    response.error(new Error('offline'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-error-message .strong').textContent)
      .toBe('Could not load item comments.');
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });
});
