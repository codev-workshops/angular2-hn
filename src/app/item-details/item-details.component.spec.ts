import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockStory = {
        id: 1,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: 123456,
        time_ago: 1,
        type: 'story' as const,
        url: 'http://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };

    beforeEach(async(() => {
        mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHNService.fetchItemContent.and.returnValue(of(mockStory));
        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [SharedComponentsModule, PipesModule, RouterTestingModule],
            declarations: [ItemDetailsComponent, CommentComponent],
            providers: [
                SettingsService,
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1' }),
                    },
                },
            ],
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

    it('should have settings', () => {
        expect(component.settings).toBeDefined();
    });

    it('should fetch item content on init', () => {
        expect(mockHNService.fetchItemContent).toHaveBeenCalledWith(1);
    });

    it('should set item after fetch', () => {
        expect(component.item).toEqual(mockStory as any);
    });

    it('should call location.back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when url starts with http', () => {
        expect(component.hasUrl).toBe(true);
    });

    it('should call scrollTo on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
