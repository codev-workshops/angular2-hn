import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { CommentComponent } from './comment.component';


describe('CommentComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [CommonModule, RouterTestingModule] }));

  it('renders and responds through its public interface', () => {
    TestBed.configureTestingModule({ declarations: [CommentComponent] });
    const fixture = TestBed.createComponent(CommentComponent);
    fixture.componentInstance.comment = { user: 'alice', content: '<b>Hello</b>', comments: [], deleted: false } as any;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('b').textContent).toBe('Hello');
    fixture.nativeElement.querySelector('.collapse').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapse).toBe(true);
    fixture.nativeElement.querySelector('.collapse').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapse).toBe(false);
    fixture.componentInstance.comment.deleted = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Comment Deleted');
    expect(fixture.nativeElement.querySelector('.comment-text')).toBeNull();
  });
});
