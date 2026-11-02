import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let feed$: Subject<Story[]>;

  beforeEach(async(() => {
    feed$ = new Subject<Story[]>();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: { fetchFeed: () => feed$ } },
        { provide: ActivatedRoute, useValue: { data: of({ feedType: 'news' }), params: of({ page: '1' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(window, 'scrollTo');
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
  });

  it('shows a skeleton placeholder while loading', () => {
    expect(fixture.nativeElement.querySelectorAll('.feed-skeleton .skeleton-card').length).toBe(10);
  });

  it('replaces the skeleton with stories once loaded', () => {
    feed$.next([{ id: 1, title: 'A' } as Story, { id: 2, title: 'B' } as Story]);
    feed$.complete();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.feed-skeleton')).toBeFalsy();
    expect(el.querySelectorAll('li.post').length).toBe(2);
  });
});
