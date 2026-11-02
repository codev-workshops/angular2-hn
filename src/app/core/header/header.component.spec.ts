import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';

import { MaterialModule } from '../../shared/material.module';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from '../settings/settings.component';
import { HeaderComponent } from './header.component';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [SettingsComponent],
  entryComponents: [SettingsComponent],
})
class SettingsTestModule {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let settingsService: SettingsService;
  let overlay: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule, MaterialModule, SettingsTestModule],
      declarations: [HeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    settingsService = TestBed.inject(SettingsService);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  it('renders a toolbar with a Material settings icon', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('mat-toolbar#header')).toBeTruthy();
    expect(el.querySelector('button.settings mat-icon').textContent.trim()).toBe('settings');
  });

  it('opens the settings dialog and syncs showSettings', fakeAsync(() => {
    fixture.nativeElement.querySelector('button.settings').click();
    fixture.detectChanges();
    flush();
    expect(overlay.querySelector('app-settings')).toBeTruthy();
    expect(settingsService.settings.showSettings).toBe(true);

    TestBed.inject(MatDialog).closeAll();
    fixture.detectChanges();
    flush();
    expect(overlay.querySelector('app-settings')).toBeFalsy();
    expect(settingsService.settings.showSettings).toBe(false);
  }));

  it('does not open a second dialog while one is open', fakeAsync(() => {
    const button = fixture.nativeElement.querySelector('button.settings');
    button.click();
    button.click();
    fixture.detectChanges();
    flush();
    expect(overlay.querySelectorAll('app-settings').length).toBe(1);
  }));
});
