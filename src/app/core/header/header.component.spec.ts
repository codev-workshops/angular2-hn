import { Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { StubSettingsComponent } from '../../shared/testing/stub-components';
import { settingsStub } from '../settings/settings-testing';

@Component({template: ''})
class PageComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let service: ReturnType<typeof settingsStub>;

  beforeEach(() => {
    service = settingsStub();
    TestBed.configureTestingModule({
      declarations: [HeaderComponent, StubSettingsComponent, PageComponent],
      imports: [RouterTestingModule.withRoutes([{path: ':feed/:page', component: PageComponent}])],
      providers: [{provide: SettingsService, useValue: service}]
    });
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('renders all feed destinations, labels and the accessible logo', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.map(link => link.nativeElement.getAttribute('href')))
      .toEqual(['/news/1', '/newest/1', '/show/1', '/ask/1', '/jobs/1']);
    expect(links.slice(1).map(link => link.nativeElement.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(fixture.nativeElement.querySelector('.logo').getAttribute('alt')).toBe('Logo');
  });

  it('navigates, scrolls to the top and moves the active class between links', fakeAsync(() => {
    const scroll = spyOn(window, 'scrollTo');
    const router = TestBed.inject(Router);
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/news/1'));
    tick();
    fixture.detectChanges();
    tick();
    expect(fixture.nativeElement.querySelector('.home-link').classList.contains('active')).toBe(true);
    const ask: HTMLAnchorElement = fixture.nativeElement.querySelectorAll('a')[3];
    TestBed.inject(NgZone).run(() => ask.click());
    tick();
    fixture.detectChanges();
    tick();
    expect(router.url).toBe('/ask/1');
    expect(scroll).toHaveBeenCalledWith(0, 0);
    expect(ask.classList.contains('active')).toBe(true);
    expect(fixture.nativeElement.querySelector('.home-link').classList.contains('active')).toBe(false);
  }));

  it('creates and removes settings when the cog is clicked', () => {
    expect(fixture.debugElement.query(By.directive(StubSettingsComponent))).toBeNull();
    const cog: HTMLImageElement = fixture.nativeElement.querySelector('.settings');
    expect(cog.alt).toBe('Settings');
    cog.click();
    fixture.detectChanges();
    expect(service.toggleSettings).toHaveBeenCalledTimes(1);
    expect(fixture.debugElement.query(By.directive(StubSettingsComponent))).not.toBeNull();
    cog.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(StubSettingsComponent))).toBeNull();
  });
});
