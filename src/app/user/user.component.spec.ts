import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;

    beforeEach(async(() => {
        mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockHNService.fetchUser.and.returnValue(
            of({
                id: 'testuser',
                crated_time: 123456,
                created: '2020-01-01',
                karma: 1000,
                avg: 10,
                about: 'Test user bio',
            })
        );

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, SharedComponentsModule],
            declarations: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
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

    it('should set user data after fetching', () => {
        expect(component.user).toBeTruthy();
        expect(component.user.id).toBe('testuser');
        expect(component.user.karma).toBe(1000);
    });
});
