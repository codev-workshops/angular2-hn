import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemComponent } from './feeds/item/item.component';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';

describe('AppModule', () => {
  it('bootstraps the root and declares the eager feed components', () => {
    const metadata = (AppModule as unknown as {__annotations__: NgModule[]}).__annotations__[0];
    expect(metadata.bootstrap).toEqual([AppComponent]);
    expect(metadata.declarations).toEqual([AppComponent, FeedComponent, ItemComponent]);
    expect(metadata.providers).toEqual([HackerNewsAPIService, SettingsService]);
  });

  it('provides a singleton API and settings service and configures the router', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    TestBed.configureTestingModule({imports: [AppModule]});
    const api = TestBed.inject(HackerNewsAPIService);
    const settings = TestBed.inject(SettingsService);
    expect(api instanceof HackerNewsAPIService).toBe(true);
    expect(TestBed.inject(HackerNewsAPIService)).toBe(api);
    expect(settings instanceof SettingsService).toBe(true);
    expect(TestBed.inject(SettingsService)).toBe(settings);
    expect(TestBed.inject(Router).config.map(route => route.path))
      .toEqual(['', 'news', 'newest', 'show', 'ask', 'jobs', 'item', 'user']);
  });
});
