import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SettingsService } from './shared/services/settings.service';

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
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
