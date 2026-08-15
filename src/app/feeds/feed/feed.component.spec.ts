import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

function story(id: number, user: string): Story {
  return { id, user, title: 'story ' + id } as Story;
}

describe('FeedComponent', () => {
  const stories = [story(1, 'alice'), story(2, 'bob'), story(3, 'Alice')];
  let params: BehaviorSubject<any>;
  let queryParams: BehaviorSubject<any>;
  let component: FeedComponent;
  let router: { navigate: jasmine.Spy };

  beforeEach(() => {
    params = new BehaviorSubject<any>({ page: '2' });
    queryParams = new BehaviorSubject<any>({});
    router = { navigate: jasmine.createSpy('navigate') };

    const route = { data: of({ feedType: 'news' }), params, queryParams } as unknown as ActivatedRoute;
    const api = {
      fetchFeed: (): Observable<Story[]> => of(stories)
    } as unknown as HackerNewsAPIService;

    component = new FeedComponent(api, route, router as unknown as Router);
    component.ngOnInit();
  });

  it('ranks stories by their position on the page', () => {
    expect(component.filteredItems.map(entry => entry.rank)).toEqual([31, 32, 33]);
  });

  it('filters by author case-insensitively while keeping the original ranks', () => {
    queryParams.next({ author: 'ALICE' });

    expect(component.filteredItems.map(entry => entry.story.id)).toEqual([1, 3]);
    expect(component.filteredItems.map(entry => entry.rank)).toEqual([31, 33]);
  });

  it('coerces a repeated author query param to a single value', () => {
    queryParams.next({ author: ['alice', 'bob'] });

    expect(component.authorFilter).toBe('bob');
    expect(component.filteredItems.map(entry => entry.story.id)).toEqual([2]);
  });

  it('mirrors the filter into the query params on change', () => {
    component.onAuthorFilterChange('bob');

    expect(component.filterQueryParams).toEqual({ author: 'bob' });
    expect(router.navigate).toHaveBeenCalled();

    component.onAuthorFilterChange('');

    expect(component.filterQueryParams).toEqual({});
    expect(component.filteredItems.length).toBe(3);
  });

  it('stops reacting to route changes once destroyed', () => {
    component.ngOnDestroy();
    queryParams.next({ author: 'bob' });

    expect(component.authorFilter).toBe('');
  });
});
