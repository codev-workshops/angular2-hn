import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserComponent } from './user.component';

describe('UserComponent', () => {
  it('loads a profile and navigates back', () => {
    const api = jasmine.createSpyObj('api', ['fetchUser']);
    api.fetchUser.and.returnValue(of({ id: 'alice' }));
    const location = jasmine.createSpyObj('location', ['back']);
    const component = new UserComponent(api, { params: of({ id: 'alice' }) } as unknown as ActivatedRoute, location);
    component.ngOnInit();
    expect(api.fetchUser).toHaveBeenCalledWith('alice');
    expect(component.user.id).toBe('alice');
    component.goBack();
    expect(location.back).toHaveBeenCalled();
    component.sub.unsubscribe();
  });

  it('reports profile failures', () => {
    const api = jasmine.createSpyObj('api', ['fetchUser']);
    api.fetchUser.and.returnValue(throwError('offline'));
    const component = new UserComponent(api, { params: of({ id: 'missing' }) } as unknown as ActivatedRoute, null);
    component.ngOnInit();
    expect(component.errorMessage).toBe('Could not load user missing.');
    component.sub.unsubscribe();
  });
});
