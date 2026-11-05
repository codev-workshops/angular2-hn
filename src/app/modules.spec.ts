import { APP_BASE_HREF } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER } from 'rxjs';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { CoreModule } from './core/core.module';
import { FooterComponent } from './core/footer/footer.component';
import { HeaderComponent } from './core/header/header.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { ItemDetailsModule } from './item-details/item-details.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { PipesModule } from './shared/pipes/pipes.module';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';
import { UserComponent } from './user/user.component';
import { UserModule } from './user/user.module';

describe('NgModules', () => {
  let api: jasmine.SpyObj<HackerNewsAPIService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed', 'fetchItemContent', 'fetchUser']);
    api.fetchItemContent.and.returnValue(NEVER);
    api.fetchUser.and.returnValue(NEVER);
  });

  it('AppModule should provide the API and settings services', () => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    });

    expect(TestBed.inject(HackerNewsAPIService)).toEqual(jasmine.any(HackerNewsAPIService));
    expect(TestBed.inject(SettingsService)).toEqual(jasmine.any(SettingsService));
  });

  it('AppModule should declare a renderable AppComponent', () => {
    (window as any).ga = jasmine.createSpy('ga');
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(HeaderComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(FooterComponent))).toBeTruthy();
  });

  it('CoreModule should export the header and footer components', () => {
    TestBed.configureTestingModule({ imports: [CoreModule, RouterTestingModule] });

    const header = TestBed.createComponent(HeaderComponent);
    const footer = TestBed.createComponent(FooterComponent);
    header.detectChanges();
    footer.detectChanges();

    expect(header.nativeElement.querySelector('#header')).toBeTruthy();
    expect(footer.nativeElement.querySelector('#footer')).toBeTruthy();
  });

  it('ItemDetailsModule should export a renderable ItemDetailsComponent', () => {
    spyOn(window, 'scrollTo');
    TestBed.configureTestingModule({
      imports: [ItemDetailsModule, RouterTestingModule],
      providers: [{ provide: HackerNewsAPIService, useValue: api }],
    });

    const fixture = TestBed.createComponent(ItemDetailsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
  });

  it('UserModule should export a renderable UserComponent', () => {
    TestBed.configureTestingModule({
      imports: [UserModule, RouterTestingModule],
      providers: [{ provide: HackerNewsAPIService, useValue: api }],
    });

    const fixture = TestBed.createComponent(UserComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
  });

  it('SharedComponentsModule and PipesModule should export their declarables', () => {
    @Component({ template: '<app-loader></app-loader><app-error-message message="Oops"></app-error-message>{{ 2 | comment }}' })
    class HostComponent {}

    TestBed.configureTestingModule({
      imports: [SharedComponentsModule, PipesModule],
      declarations: [HostComponent],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.loading-section')).toBeTruthy();
    expect(el.querySelector('.error-section').textContent).toContain('Oops');
    expect(el.textContent).toContain('2 comments');
  });
});
