import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ItemDetailsComponent } from './item-details.component';
import { SettingsService } from '../shared/services/settings.service';

describe('ItemDetailsComponent', () => {
  it('loads a story, classifies links and navigates back', () => {
    const api = jasmine.createSpyObj('api', ['fetchItemContent']);
    api.fetchItemContent.and.returnValue(of({ id: 42, url: 'https://example.com' }));
    const settings = { settings: {} } as SettingsService;
    const location = jasmine.createSpyObj('location', ['back']);
    spyOn(window, 'scrollTo');
    const component = new ItemDetailsComponent(api, settings,
      { params: of({ id: '42' }) } as unknown as ActivatedRoute, location);
    component.ngOnInit();
    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item.id).toBe(42);
    expect(component.hasUrl).toBe(true);
    component.item.url = 'item/42';
    expect(component.hasUrl).toBe(false);
    component.goBack();
    expect(location.back).toHaveBeenCalled();
    component.sub.unsubscribe();
  });

  it('reports failed stories', () => {
    const api = jasmine.createSpyObj('api', ['fetchItemContent']);
    api.fetchItemContent.and.returnValue(throwError('offline'));
    spyOn(window, 'scrollTo');
    const component = new ItemDetailsComponent(api, { settings: {} } as SettingsService,
      { params: of({ id: '42' }) } as unknown as ActivatedRoute, null);
    component.ngOnInit();
    expect(component.errorMessage).toBe('Could not load item comments.');
    component.sub.unsubscribe();
  });
});
