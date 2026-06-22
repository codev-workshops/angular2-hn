import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from '../settings/settings.component';
import { FormsModule } from '@angular/forms';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let settingsService: SettingsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, FormsModule],
            declarations: [HeaderComponent, SettingsComponent],
            providers: [SettingsService]
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

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(settingsService.settings);
    });

    it('should toggle settings when toggleSettings is called', () => {
        spyOn(settingsService, 'toggleSettings').and.callThrough();
        component.toggleSettings();
        expect(settingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call window.scrollTo when scrollTop is called', () => {
        spyOn(window, 'scrollTo');
        component.scrollTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should render navigation links', () => {
        const compiled = fixture.nativeElement;
        const links = compiled.querySelectorAll('.header-nav a');
        expect(links.length).toBe(4);
        expect(links[0].textContent).toContain('new');
        expect(links[1].textContent).toContain('show');
        expect(links[2].textContent).toContain('ask');
        expect(links[3].textContent).toContain('jobs');
    });
});
