import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [CommonModule, RouterTestingModule.withRoutes([{ path: 'news/1', children: [] }])]
  }));

  it('renders and responds through its public interface', () => {
    const service = jasmine.createSpyObj('settings', ['toggleSettings']);
    service.settings = { showSettings: false };
    TestBed.configureTestingModule({ declarations: [HeaderComponent], schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: SettingsService, useValue: service }] });
    const scroll = spyOn(window, 'scrollTo');
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.settings').click();
    fixture.nativeElement.querySelector('.home-link').click();
    expect(service.toggleSettings).toHaveBeenCalled();
    expect(scroll).toHaveBeenCalledWith(0, 0);
  });
});
