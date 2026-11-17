import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ErrorMessageComponent } from './error-message.component';


describe('ErrorMessageComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [CommonModule] }));

  it('renders and responds through its public interface', () => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    const fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('network connection');
  });
});
