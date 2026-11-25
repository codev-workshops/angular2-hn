import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { Story } from '../shared/models/story';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

describe('ItemDetailsComponent', () => {
  it('cleans up route and request subscriptions when destroyed', () => {
    const params = new BehaviorSubject({ id: '123' });
    const route = { params } as unknown as ActivatedRoute;
    const api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    const cancelRequest = jasmine.createSpy('cancelRequest');
    api.fetchItemContent.and.returnValue(new Observable<Story>(() => cancelRequest));
    const location = jasmine.createSpyObj<Location>('Location', ['back']);
    const settingsService = { settings: { theme: 'default' } } as SettingsService;
    spyOn(window, 'scrollTo');
    const component = new ItemDetailsComponent(api, settingsService, route, location);

    component.ngOnInit();
    expect(api.fetchItemContent).toHaveBeenCalledWith(123);
    expect(cancelRequest).not.toHaveBeenCalled();

    component.ngOnDestroy();
    params.next({ id: '456' });
    expect(api.fetchItemContent).toHaveBeenCalledTimes(1);
    expect(cancelRequest).toHaveBeenCalledTimes(1);
  });
});
