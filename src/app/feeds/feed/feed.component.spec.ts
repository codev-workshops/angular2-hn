import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { FeedComponent } from './feed.component';
import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
  it('cleans up route and request subscriptions when destroyed', () => {
    const params = new BehaviorSubject({ page: '1' });
    const data = new BehaviorSubject({ feedType: 'news' });
    const route = { data, params } as unknown as ActivatedRoute;
    const api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    const cancelRequest = jasmine.createSpy('cancelRequest');
    api.fetchFeed.and.returnValue(new Observable<Story[]>(() => cancelRequest));
    spyOn(window, 'scrollTo');
    const component = new FeedComponent(api, route);

    component.ngOnInit();
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(cancelRequest).not.toHaveBeenCalled();

    component.ngOnDestroy();
    params.next({ page: '2' });
    data.next({ feedType: 'jobs' });
    expect(component.feedType).toBe('news');
    expect(api.fetchFeed).toHaveBeenCalledTimes(1);
    expect(cancelRequest).toHaveBeenCalledTimes(1);
  });
});
