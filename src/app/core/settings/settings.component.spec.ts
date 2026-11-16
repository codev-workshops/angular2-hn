import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { settingsStub } from './settings-testing';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let service: ReturnType<typeof settingsStub>;
  beforeEach(() => {
    service = settingsStub();
    TestBed.configureTestingModule({
      declarations: [SettingsComponent], providers: [{provide: SettingsService, useValue: service}]
    });
    fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
  });

  it('reflects shared checkbox, theme and numeric settings', () => {
    expect(fixture.componentInstance.settings).toBe(service.settings);
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('h1').textContent).toBe('Settings');
    expect(root.querySelector<HTMLInputElement>('input[type=checkbox]').checked).toBe(false);
    service.settings.openLinkInNewTab = true;
    service.settings.theme = 'night';
    service.settings.titleFontSize = '21';
    service.settings.listSpacing = '3';
    fixture.detectChanges();
    expect(root.querySelector<HTMLInputElement>('input[type=checkbox]').checked).toBe(true);
    expect(root.querySelector<HTMLInputElement>('input[value=night]').checked).toBe(true);
    expect(root.querySelector<HTMLInputElement>('input[value=default]').checked).toBe(false);
    const numbers = root.querySelectorAll<HTMLInputElement>('input[type=number]');
    expect(Array.from(numbers).map(input => input.value)).toEqual(['21', '3']);
    expect(Array.from(numbers).map(input => input.min)).toEqual(['1', '0']);
  });

  it('delegates close, link preference and every theme choice from DOM events', () => {
    const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLElement>('.close').click();
    expect(service.toggleSettings).toHaveBeenCalledTimes(1);
    root.querySelector('input[type=checkbox]').dispatchEvent(new Event('change'));
    expect(service.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
    ['default', 'night', 'amoledblack'].forEach(theme => {
      root.querySelector<HTMLInputElement>('input[value=' + theme + ']').click();
      expect(service.setTheme).toHaveBeenCalledWith(theme);
    });
  });

  it('forwards numeric and cleared input values without coercion', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type=number]') as NodeListOf<HTMLInputElement>;
    inputs[0].value = '24';
    inputs[0].dispatchEvent(new Event('keyup'));
    expect(service.setFont).toHaveBeenCalledWith('24');
    inputs[1].value = '4';
    inputs[1].dispatchEvent(new Event('keyup'));
    expect(service.setSpacing).toHaveBeenCalledWith('4');
    inputs[0].value = '';
    inputs[1].value = '';
    inputs.forEach(input => input.dispatchEvent(new Event('keyup')));
    expect(service.setFont).toHaveBeenCalledWith('');
    expect(service.setSpacing).toHaveBeenCalledWith('');
  });
});
