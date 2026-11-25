import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserComponent } from './user.component';
import { User } from '../shared/models/user';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

describe('UserComponent', () => {
  it('cleans up route and request subscriptions when destroyed', () => {
    const params = new BehaviorSubject({ id: 'alice' });
    const route = { params } as unknown as ActivatedRoute;
    const api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    const cancelRequest = jasmine.createSpy('cancelRequest');
    api.fetchUser.and.returnValue(new Observable<User>(() => cancelRequest));
    const location = jasmine.createSpyObj<Location>('Location', ['back']);
    const component = new UserComponent(api, route, location);

    component.ngOnInit();
    expect(api.fetchUser).toHaveBeenCalledWith('alice');
    expect(cancelRequest).not.toHaveBeenCalled();

    component.ngOnDestroy();
    params.next({ id: 'bob' });
    expect(api.fetchUser).toHaveBeenCalledTimes(1);
    expect(cancelRequest).toHaveBeenCalledTimes(1);
  });
});
