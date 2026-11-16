import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipesModule } from './pipes.module';

@Component({
  selector: 'app-pipes-host',
  template: '<span class="count">{{ count | comment }}</span>'
})
class PipesHostComponent {
  count = 0;
}

describe('PipesModule', () => {
  let fixture: ComponentFixture<PipesHostComponent>;

  function renderedText(): string {
    return fixture.nativeElement.querySelector('.count').textContent.trim();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipesModule],
      declarations: [PipesHostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(PipesHostComponent);
  });

  it('exports the comment pipe for use in templates of importing modules', () => {
    fixture.detectChanges();
    expect(renderedText()).toBe('discuss');

    fixture.componentInstance.count = 1;
    fixture.detectChanges();
    expect(renderedText()).toBe('1 comment');

    fixture.componentInstance.count = 12;
    fixture.detectChanges();
    expect(renderedText()).toBe('12 comments');
  });
});
