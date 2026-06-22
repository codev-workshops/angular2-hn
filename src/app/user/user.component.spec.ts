import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHnService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockUser: User = {
        id: 'testuser',
        crated_time: 1234567890,
        created: '2020-01-01',
        karma: 1000,
        avg: 10,
        about: 'Test user about'
    };

    beforeEach(async(() => {
        mockHnService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockHnService.fetchUser.and.returnValue(of(mockUser));
        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, SharedComponentsModule],
            declarations: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHnService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'testuser' })
                    }
                }
            ]
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
        expect(mockHnService.fetchUser).toHaveBeenCalledWith('testuser');
        expect(component.user).toEqual(mockUser);
    });

    it('should go back when goBack is called', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should display user profile', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.name').textContent).toContain('testuser');
        expect(compiled.querySelector('.right').textContent).toContain('1000');
    });

    it('should display user about section', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.other-details')).toBeTruthy();
    });

    it('should handle error when fetching user', () => {
        mockHnService.fetchUser.and.returnValue(throwError('error'));
        component.ngOnInit();
        expect(component.errorMessage).toBe('Could not load user testuser.');
    });
});
