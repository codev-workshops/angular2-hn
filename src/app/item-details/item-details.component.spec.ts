import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHnService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockItem: Story = {
        id: 1,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: 1234567890,
        time_ago: 1,
        type: 'story',
        url: 'http://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    };

    beforeEach(async(() => {
        mockHnService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHnService.fetchItemContent.and.returnValue(of(mockItem));
        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
            declarations: [ItemDetailsComponent, CommentComponent],
            providers: [
                SettingsService,
                { provide: HackerNewsAPIService, useValue: mockHnService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1' })
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        spyOn(window, 'scrollTo');
        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch item content on init', () => {
        expect(mockHnService.fetchItemContent).toHaveBeenCalledWith(1);
        expect(component.item).toEqual(mockItem);
    });

    it('should call window.scrollTo on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should go back when goBack is called', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when url starts with http', () => {
        expect(component.hasUrl).toBe(true);
    });

    it('should handle error when fetching item content', () => {
        mockHnService.fetchItemContent.and.returnValue(throwError('error'));
        component.ngOnInit();
        expect(component.errorMessage).toBe('Could not load item comments.');
    });
});
