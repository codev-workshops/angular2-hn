import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ErrorMessageComponent } from './error-message.component';

@Component({
  selector: 'app-error-host',
  template: '<app-error-message [message]="message"></app-error-message>'
})
class ErrorHostComponent {
  message = 'Could not load user pg.';
}

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorHostComponent>;

  function strongText(): string {
    return fixture.nativeElement.querySelector('.error-section p.strong').textContent.trim();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent, ErrorHostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorHostComponent);
    fixture.detectChanges();
  });

  it('receives the message through its @Input', () => {
    const child = fixture.debugElement.query(By.directive(ErrorMessageComponent)).componentInstance as ErrorMessageComponent;
    expect(child.message).toBe('Could not load user pg.');
  });

  it('renders the message in the emphasised paragraph', () => {
    expect(strongText()).toBe('Could not load user pg.');
  });

  it('re-renders when the message input changes', () => {
    fixture.componentInstance.message = 'Could not load item 42.';
    fixture.detectChanges();
    expect(strongText()).toBe('Could not load item 42.');
  });

  it('always shows the offline-viewing hint and the skull illustration', () => {
    const paragraphs = fixture.nativeElement.querySelectorAll('.error-section p');
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[1].textContent).toContain('If you are offline viewing');
    expect(fixture.nativeElement.querySelector('.skull .head .crack')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.skull .mouth .teeth')).not.toBeNull();
  });

  it('renders an empty emphasised paragraph when no message is given', () => {
    const standalone = TestBed.createComponent(ErrorMessageComponent);
    standalone.detectChanges();
    expect(standalone.nativeElement.querySelector('p.strong').textContent.trim()).toBe('');
  });
});
