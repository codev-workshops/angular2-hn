import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../shared/services/settings.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settings: Settings;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['toggleSettings']);
    settingsService.settings = settings;
    settingsService.toggleSettings.and.callFake(() => (settings.showSettings = !settings.showSettings));

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with the shared settings object', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('should render the feed navigation links', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('.header-nav a')).map((a: HTMLElement) => a.textContent);
    expect(links).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('should hide the settings popup by default and show it after clicking the cog', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();

    fixture.nativeElement.querySelector('img.settings').click();
    fixture.detectChanges();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('app-settings')).not.toBeNull();
  });

  it('should scroll to the top when a nav link is clicked', () => {
    const scrollSpy = spyOn(window, 'scrollTo');

    fixture.nativeElement.querySelector('.header-nav a').click();

    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('ngOnInit should not throw', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });
});
