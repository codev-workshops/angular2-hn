import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
    beforeEach(async(() => {
        (window as any).ga = () => {};

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
            providers: [SettingsService],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should apply the theme from settings', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.settings.theme = 'night';
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('div').className).toContain('night');
    });
});
