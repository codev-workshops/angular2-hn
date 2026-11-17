import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';


describe('LoaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [CommonModule] }));

  it('renders and responds through its public interface', () => {
    TestBed.configureTestingModule({ declarations: [LoaderComponent] });
    const fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });
});
