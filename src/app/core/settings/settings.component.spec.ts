import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioButton } from '@angular/material/radio';

import { MaterialModule } from '../../shared/material.module';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: SettingsService;
  let dialogRef: jasmine.SpyObj<MatDialogRef<SettingsComponent>>;

  beforeEach(async(() => {
    localStorage.clear();
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [CommonModule, MaterialModule, NoopAnimationsModule],
      declarations: [SettingsComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    }).compileComponents();
  }));

  beforeEach(() => {
    settingsService = TestBed.inject(SettingsService);
    fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('renders Material controls for every setting', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('mat-slide-toggle')).toBeTruthy();
    expect(el.querySelector('mat-radio-group')).toBeTruthy();
    expect(el.querySelectorAll('mat-radio-button').length).toBe(3);
    expect(el.querySelectorAll('mat-form-field input[matInput]').length).toBe(2);
  });

  it('updates the theme through SettingsService', () => {
    const radios = fixture.debugElement.queryAll(By.directive(MatRadioButton));
    const night = radios.find(r => r.componentInstance.value === 'night');
    night.query(By.css('input')).nativeElement.click();
    fixture.detectChanges();
    expect(settingsService.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('toggles open-links-in-new-tab through SettingsService', () => {
    const initial = settingsService.settings.openLinkInNewTab;
    fixture.nativeElement.querySelector('mat-slide-toggle input').click();
    fixture.detectChanges();
    expect(settingsService.settings.openLinkInNewTab).toBe(!initial);
  });

  it('ignores invalid font sizes', () => {
    const component = fixture.componentInstance;
    component.changeTitleFont('20');
    component.changeTitleFont('');
    component.changeTitleFont('0');
    expect(settingsService.settings.titleFontSize).toBe('20');
  });
});
