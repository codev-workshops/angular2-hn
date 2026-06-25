import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockUser = {
        id: 'testuser',
        crated_time: 123456,
        created: '2 years ago',
        karma: 1000,
        avg: 10,
        about: 'Test user about',
    };

    beforeEach(async(() => {
        mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockHNService.fetchUser.and.returnValue(of(mockUser));
        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [SharedComponentsModule, RouterTestingModule],
            declarations: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'testuser' }),
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch user on init', () => {
        expect(mockHNService.fetchUser).toHaveBeenCalledWith('testuser');
    });

    it('should set user data after fetch', () => {
        expect(component.user).toEqual(mockUser as any);
    });

    it('should call location.back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should set errorMessage on fetch error', () => {
        const errorService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        errorService.fetchUser.and.returnValue({
            subscribe: (success, error) => error('error')
        });

        const comp = new UserComponent(errorService, { params: of({ id: 'baduser' }) } as any, mockLocation);
        comp.ngOnInit();
        expect(comp.errorMessage).toContain('Could not load user');
    });
});
