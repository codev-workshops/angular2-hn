import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SharedComponentsModule } from './shared-components.module';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';

@Component({
  selector: 'app-shared-host',
  template: `
    <app-loader *ngIf="loading"></app-loader>
    <app-error-message *ngIf="!loading" [message]="message"></app-error-message>
  `
})
class SharedHostComponent {
  loading = true;
  message = 'Something went wrong.';
}

describe('SharedComponentsModule', () => {
  let fixture: ComponentFixture<SharedHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedComponentsModule],
      declarations: [SharedHostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(SharedHostComponent);
    fixture.detectChanges();
  });

  it('exports a working LoaderComponent', () => {
    const loader = fixture.debugElement.query(By.directive(LoaderComponent));
    expect(loader).not.toBeNull();
    expect(loader.nativeElement.textContent.trim()).toBe('Loading...');
    expect(fixture.debugElement.query(By.directive(ErrorMessageComponent))).toBeNull();
  });

  it('exports a working ErrorMessageComponent with its message input bound', () => {
    fixture.componentInstance.loading = false;
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.directive(ErrorMessageComponent));
    expect(error).not.toBeNull();
    expect((error.componentInstance as ErrorMessageComponent).message).toBe('Something went wrong.');
    expect(error.nativeElement.querySelector('p.strong').textContent.trim()).toBe('Something went wrong.');
    expect(fixture.debugElement.query(By.directive(LoaderComponent))).toBeNull();
  });
});
