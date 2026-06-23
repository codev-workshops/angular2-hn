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

    it('should have settings', () => {
        expect(component.settings).toBeTruthy();
    });

    it('should close settings', () => {
        settingsService.settings.showSettings = true;
        component.closeSettings();
        expect(settingsService.settings.showSettings).toBe(false);
    });

    it('should toggle open links in new tab', () => {
        spyOn(settingsService, 'toggleOpenLinksInNewTab');
        component.toggleOpenLinksInNewTab();
        expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('should select a theme', () => {
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
        component.changeSpacing('5');
        expect(settingsService.setSpacing).toHaveBeenCalledWith('5');
    });
});
