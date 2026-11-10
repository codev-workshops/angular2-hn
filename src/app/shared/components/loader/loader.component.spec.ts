import { TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    }).compileComponents();
  });

  it('creates the loader', () => {
    const fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
