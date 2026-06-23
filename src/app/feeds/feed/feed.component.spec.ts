import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { ItemComponent } from '../item/item.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;

    beforeEach(async(() => {
        mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHNService.fetchFeed.and.returnValue(of([]));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
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

    it('should call fetchFeed on init', () => {
        expect(mockHNService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should calculate listStart correctly', () => {
        expect(component.listStart).toBe(1);
    });
});
