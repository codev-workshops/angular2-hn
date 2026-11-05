import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let el: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  function createWith(settings: Partial<Settings> = {}) {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing',
    ]);
    settingsService.settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
      ...settings,
    };

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  function input(selector: string): HTMLInputElement {
    return el.querySelector(selector) as HTMLInputElement;
  }

  it('should create and reflect the current settings in the form', () => {
    createWith({ openLinkInNewTab: true, theme: 'night', titleFontSize: '20', listSpacing: '5' });

    expect(component).toBeTruthy();
    expect(input('input[type=checkbox]').checked).toBe(true);
    expect(input('input[value=night]').checked).toBe(true);
    expect(input('input[value=default]').checked).toBe(false);
    const numbers = el.querySelectorAll('input[type=number]');
    expect((numbers[0] as HTMLInputElement).value).toBe('20');
    expect((numbers[1] as HTMLInputElement).value).toBe('5');
  });

  it('should close the popup via the close button', () => {
    createWith();
    (el.querySelector('.close') as HTMLElement).click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should toggle "open links in new tab" when the checkbox changes', () => {
    createWith();
    input('input[type=checkbox]').dispatchEvent(new Event('change'));
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  ['default', 'night', 'amoledblack'].forEach(theme => {
    it(`should select the ${theme} theme`, () => {
      createWith();
      input(`input[value=${theme}]`).click();
      expect(settingsService.setTheme).toHaveBeenCalledWith(theme);
    });
  });

  it('should change the title font size and list spacing on keyup', () => {
    createWith();
    const [font, spacing] = Array.from(el.querySelectorAll('input[type=number]')) as HTMLInputElement[];

    font.value = '24';
    font.dispatchEvent(new Event('keyup'));
    spacing.value = '10';
    spacing.dispatchEvent(new Event('keyup'));

    expect(settingsService.setFont).toHaveBeenCalledWith('24');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });

  it('ngOnInit should not throw', () => {
    createWith();
    expect(() => component.ngOnInit()).not.toThrow();
  });
});
