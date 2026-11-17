import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';


describe('FooterComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [CommonModule] }));

  it('renders and responds through its public interface', () => {
    TestBed.configureTestingModule({ declarations: [FooterComponent] });
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('GitHub');
  });
});
