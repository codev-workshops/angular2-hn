import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;

    beforeEach(async(() => {
        mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHNService.fetchItemContent.and.returnValue(
            of({
                id: 1,
                title: 'Test',
                points: 10,
                user: 'testuser',
                time: 123,
                time_ago: 123,
                type: 'story',
                url: 'https://example.com',
                domain: 'example.com',
                comments: [],
                comments_count: 0,
                poll: [],
                poll_votes_count: 0,
                deleted: false,
                dead: false,
            })
        );

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
            declarations: [ItemDetailsComponent, CommentComponent],
            providers: [
                SettingsService,
                { provide: HackerNewsAPIService, useValue: mockHNService },
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
        expect(component.settings).toBeTruthy();
    });

    it('should fetch item content on init', () => {
        expect(mockHNService.fetchItemContent).toHaveBeenCalledWith(1);
    });

    it('should set item after fetching', () => {
        expect(component.item).toBeTruthy();
        expect(component.item.title).toBe('Test');
    });

    it('should scroll to top on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should return true for hasUrl when url starts with http', () => {
        expect(component.hasUrl).toBe(true);
    });
});
