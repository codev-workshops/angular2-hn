import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('toggles the settings panel', () => {
    const initial = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initial);
  });

  it('persists the selected theme', () => {
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('persists the title font size', () => {
    service.setFont('18');
    expect(service.settings.titleFontSize).toBe('18');
    expect(localStorage.getItem('titleFontSize')).toBe('18');
  });
});
