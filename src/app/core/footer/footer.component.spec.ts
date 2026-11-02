import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [FooterComponent] });
    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('should create and link to the GitHub project in a new tab', () => {
    expect(fixture.componentInstance).toBeTruthy();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.href).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
  });
});
