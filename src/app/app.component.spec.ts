import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { CoreModule } from './core/core.module';

describe('AppComponent', () => {
    beforeEach(async(() => {
        (window as any).ga = jasmine.createSpy('ga');

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, CoreModule],
            declarations: [AppComponent],
            providers: [SettingsService],
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.settings).toBeDefined();
        expect(app.settings.showSettings).toBe(false);
    });

    it('should have a router', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.router).toBeDefined();
    });
});
