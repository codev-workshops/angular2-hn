import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { CoreModule } from './core/core.module';

describe('AppComponent', () => {
    beforeEach(async(() => {
        // Mock the global ga function
        (window as any).ga = jasmine.createSpy('ga');

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, CoreModule],
            declarations: [AppComponent],
            providers: [SettingsService]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        const settingsService = TestBed.inject(SettingsService);
        expect(app.settings).toBe(settingsService.settings);
    });

    it('should render header and footer', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-header')).toBeTruthy();
        expect(compiled.querySelector('app-footer')).toBeTruthy();
    });

    it('should render router-outlet', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should apply theme class from settings', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const wrapper = compiled.querySelector('div');
        expect(wrapper.className).toContain('default');
    });
});
