import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [CommonModule] }));

  it('renders and responds through its public interface', () => {
    const service = jasmine.createSpyObj('settings', ['toggleSettings', 'toggleOpenLinksInNewTab', 'setTheme', 'setFont', 'setSpacing']);
    service.settings = { theme: 'default' };
    TestBed.configureTestingModule({ declarations: [SettingsComponent], providers: [{ provide: SettingsService, useValue: service }] });
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLElement>('.close').click();
    element.querySelector('input').dispatchEvent(new Event('change'));
    element.querySelector<HTMLElement>('[value="night"]').click();
    const inputs = element.querySelectorAll('input[type="number"]');
    (inputs[0] as HTMLInputElement).value = '20';
    inputs[0].dispatchEvent(new Event('keyup'));
    (inputs[1] as HTMLInputElement).value = '6';
    inputs[1].dispatchEvent(new Event('keyup'));
    expect(service.toggleSettings).toHaveBeenCalled();
    expect(service.toggleOpenLinksInNewTab).toHaveBeenCalled();
    expect(service.setTheme).toHaveBeenCalledWith('night');
    expect(service.setFont).toHaveBeenCalledWith('20');
    expect(service.setSpacing).toHaveBeenCalledWith('6');
  });
});
