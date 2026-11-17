import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
  it('loads the default page and responds to page changes', () => {
    const params = new Subject<{}>();
    const api = jasmine.createSpyObj('api', ['fetchFeed']);
    api.fetchFeed.and.returnValue(of([]));
    const scroll = spyOn(window, 'scrollTo');
    const component = new FeedComponent(api, { data: of({ feedType: 'news' }), params } as unknown as ActivatedRoute);
    component.ngOnInit();
    params.next({});
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.items).toEqual([]);
    expect(component.listStart).toBe(1);
    params.next({ page: '3' });
    expect(component.pageNum).toBe(3);
    expect(component.listStart).toBe(61);
    expect(scroll).toHaveBeenCalledWith(0, 0);
    api.fetchFeed.and.returnValue(throwError('offline'));
    params.next({ page: '4' });
    expect(component.errorMessage).toBe('Could not load news stories.');
    component.typeSub.unsubscribe();
    component.pageSub.unsubscribe();
  });
});
