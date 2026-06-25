import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ItemComponent } from '../item/item.component';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories = [
        { id: 1, title: 'Test Story', points: 100, user: 'testuser', time: 123456, time_ago: 1, type: 'story' as any, url: 'http://example.com', domain: 'example.com', comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false }
    ];

    beforeEach(async(() => {
        mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHNService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [SharedComponentsModule, PipesModule, RouterTestingModule],
            declarations: [FeedComponent, ItemComponent],
            providers: [
                SettingsService,
                { provide: HackerNewsAPIService, useValue: mockHNService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '1' }),
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        spyOn(window, 'scrollTo');
        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set feedType from route data', () => {
        expect(component.feedType).toBe('news');
    });

    it('should set pageNum from route params', () => {
        expect(component.pageNum).toBe(1);
    });

    it('should fetch feed stories', () => {
        expect(mockHNService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should set items after fetching feed', () => {
        expect(component.items).toEqual(mockStories as any);
    });

    it('should calculate listStart correctly', () => {
        expect(component.listStart).toBe(1);
    });

    it('should set errorMessage on fetch error', () => {
        mockHNService.fetchFeed.and.returnValue(of(null).pipe());
        const errorService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        errorService.fetchFeed.and.returnValue({
            subscribe: (success, error) => error('error')
        });

        const comp = new FeedComponent(errorService, { data: of({ feedType: 'news' }), params: of({ page: '1' }) } as any);
        comp.ngOnInit();
        expect(comp.errorMessage).toContain('Could not load');
    });
});
