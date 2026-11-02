import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [LoaderComponent] });
    fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();
  });

  it('should create and render the loading indicator', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.loader').textContent).toContain('Loading...');
  });
});
