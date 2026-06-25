import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from '../settings/settings.component';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let settingsService: SettingsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent, SettingsComponent],
            providers: [SettingsService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        settingsService = TestBed.inject(SettingsService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings', () => {
        expect(component.settings).toBeDefined();
    });

    it('should toggle settings on toggleSettings call', () => {
        const initialState = component.settings.showSettings;
        component.toggleSettings();
        expect(component.settings.showSettings).toBe(!initialState);
    });

    it('should call window.scrollTo on scrollTop', () => {
        spyOn(window, 'scrollTo');
        component.scrollTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
