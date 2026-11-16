import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreModule } from './core.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsService } from '../shared/services/settings.service';
import { settingsStub } from './settings/settings-testing';

@Component({template: '<app-header></app-header><app-footer></app-footer>'})
class HostComponent {}

describe('CoreModule exports', () => {
  it('renders real exported components and the private settings declaration through the header', () => {
    const service = settingsStub();
    TestBed.configureTestingModule({
      imports: [CoreModule, RouterTestingModule], declarations: [HostComponent],
      providers: [{provide: SettingsService, useValue: service}]
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(HeaderComponent))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(FooterComponent))).not.toBeNull();
    const github: HTMLAnchorElement = fixture.nativeElement.querySelector('#footer a');
    expect(github.textContent).toBe('GitHub');
    expect(github.href).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(github.target).toBe('_blank');
    expect(github.rel).toBe('noopener');
    expect(fixture.nativeElement.querySelector('#footer').textContent).toContain('Show this project some ❤');
    fixture.nativeElement.querySelector('.settings').click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(SettingsComponent))).not.toBeNull();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Settings');
    fixture.nativeElement.querySelector('.close').click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(SettingsComponent))).toBeNull();
  });
});
