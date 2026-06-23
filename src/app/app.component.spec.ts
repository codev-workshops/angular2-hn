import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { CoreModule } from './core/core.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';

describe('AppComponent', () => {
    beforeEach(async(() => {
        (window as any).ga = jasmine.createSpy('ga');

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, CoreModule, SharedComponentsModule],
            declarations: [AppComponent],
            providers: [SettingsService],
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
        expect(app.settings).toBeTruthy();
        expect(app.settings.showSettings).toBeDefined();
    });
});
