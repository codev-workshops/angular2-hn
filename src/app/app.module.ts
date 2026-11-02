import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { routing } from './app.routes';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemComponent } from './feeds/item/item.component';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { PipesModule } from './shared/pipes/pipes.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';
import { RatingService } from './shared/services/rating.service';

@NgModule({
    declarations: [AppComponent, FeedComponent, ItemComponent, StarRatingComponent],
    imports: [
        BrowserModule,
        routing,
        CoreModule,
        SharedComponentsModule,
        PipesModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
        }),
    ],
    providers: [HackerNewsAPIService, SettingsService, RatingService],
    bootstrap: [AppComponent],
})
export class AppModule {}
