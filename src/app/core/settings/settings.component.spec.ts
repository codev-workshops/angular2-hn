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
            providers: [SettingsService]
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
        expect(component.settings).toBe(settingsService.settings);
    });

    it('should close settings when closeSettings is called', () => {
        spyOn(settingsService, 'toggleSettings');
        component.closeSettings();
        expect(settingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should toggle open links in new tab', () => {
        spyOn(settingsService, 'toggleOpenLinksInNewTab');
        component.toggleOpenLinksInNewTab();
        expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('should select theme', () => {
        spyOn(settingsService, 'setTheme');
        component.selectTheme('night');
        expect(settingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('should change title font', () => {
        spyOn(settingsService, 'setFont');
        component.changeTitleFont('20');
        expect(settingsService.setFont).toHaveBeenCalledWith('20');
    });

    it('should change spacing', () => {
        spyOn(settingsService, 'setSpacing');
        component.changeSpacing('10');
        expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
    });
});
