import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();
  });

  it('creates the loader', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the loading indicator inside the loading section', () => {
    const loader: HTMLElement = fixture.nativeElement.querySelector('.loading-section > .loader');
    expect(loader).not.toBeNull();
    expect(loader.textContent.trim()).toBe('Loading...');
  });
});
