import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let settingsService: SettingsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            providers: [SettingsService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        settingsService = TestBed.inject(SettingsService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
    });

    it('should close settings', () => {
        settingsService.settings.showSettings = true;
        component.closeSettings();
        expect(settingsService.settings.showSettings).toBe(false);
    });

    it('should toggle open links in new tab', () => {
        const initial = settingsService.settings.openLinkInNewTab;
        component.toggleOpenLinksInNewTab();
        expect(settingsService.settings.openLinkInNewTab).toBe(!initial);
    });

    it('should select a theme', () => {
        component.selectTheme('night');
        expect(settingsService.settings.theme).toBe('night');
    });

    it('should change title font size', () => {
        component.changeTitleFont('20');
        expect(settingsService.settings.titleFontSize).toBe('20');
    });

    it('should change spacing', () => {
        component.changeSpacing('5');
        expect(settingsService.settings.listSpacing).toBe('5');
    });
});
