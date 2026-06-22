import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHnService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories: Story[] = [
        {
            id: 1, title: 'Test Story', points: 100, user: 'testuser',
            time: 1234567890, time_ago: 1, type: 'story', url: 'http://example.com',
            domain: 'example.com', comments: [], comments_count: 5,
            poll: [], poll_votes_count: 0, deleted: false, dead: false
        }
    ];

    beforeEach(async(() => {
        mockHnService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHnService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
            declarations: [FeedComponent, ItemComponent],
            providers: [
                SettingsService,
                { provide: HackerNewsAPIService, useValue: mockHnService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '1' })
                    }
                }
            ]
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

    it('should fetch feed items on init', () => {
        expect(mockHnService.fetchFeed).toHaveBeenCalledWith('news', 1);
        expect(component.items).toEqual(mockStories);
    });

    it('should calculate listStart correctly', () => {
        expect(component.listStart).toBe(1);
    });

    it('should call window.scrollTo on feed load', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
