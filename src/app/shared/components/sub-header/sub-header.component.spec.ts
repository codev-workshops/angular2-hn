import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SubHeaderComponent } from './sub-header.component';

@Component({ template: '<app-sub-header><h2 class="title">Story</h2></app-sub-header>' })
class HostComponent {}

describe('SubHeaderComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatButtonModule, MatIconModule],
      declarations: [SubHeaderComponent, HostComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('projects the title content', () => {
    expect(fixture.nativeElement.querySelector('.sub-header .title').textContent).toBe('Story');
  });

  it('navigates back when there is history', () => {
    spyOnProperty(History.prototype, 'length').and.returnValue(2);
    const location = TestBed.inject(Location);
    spyOn(location, 'back');
    fixture.nativeElement.querySelector('button.back-button').click();
    expect(location.back).toHaveBeenCalled();
  });

  it('falls back to the top stories feed without history', () => {
    spyOnProperty(History.prototype, 'length').and.returnValue(1);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.nativeElement.querySelector('button.back-button').click();
    expect(router.navigate).toHaveBeenCalledWith(['/news', 1]);
  });
});
