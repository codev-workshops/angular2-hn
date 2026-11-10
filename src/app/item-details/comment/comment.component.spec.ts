import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;

  function comment(overrides: Partial<Comment> = {}): Comment {
    return Object.assign(new Comment(), {
      id: 1, user: 'alice', time_ago: '2 hours ago', content: '<b>Hello</b>', deleted: false, comments: []
    }, overrides);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule], declarations: [CommentComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(CommentComponent);
  });

  it('renders author navigation, age and HTML content expanded initially', () => {
    fixture.componentInstance.comment = comment();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('a').getAttribute('href')).toBe('/user/alice');
    expect(element.querySelector('a').textContent).toBe('alice');
    expect(element.querySelector('.time').textContent).toBe('2 hours ago');
    expect(element.querySelector('.comment-text b').textContent).toBe('Hello');
    expect(element.querySelector('.collapse').textContent).toBe('[-]');
    expect((element.querySelector('.comment-tree > div') as HTMLElement).hidden).toBe(false);
    expect(element.querySelectorAll('.subtree li').length).toBe(0);
  });

  it('renders nested comments recursively and passes each comment input intact', () => {
    const leaf = comment({ id: 3, user: 'carol', content: 'Leaf' });
    const child = comment({ id: 2, user: 'bob', comments: [leaf] });
    fixture.componentInstance.comment = comment({ comments: [child] });
    fixture.detectChanges();
    const children = fixture.debugElement.queryAll(By.directive(CommentComponent));
    expect(children.length).toBe(2);
    expect(children[0].componentInstance.comment).toBe(child);
    expect(children[1].componentInstance.comment).toBe(leaf);
    expect(fixture.nativeElement.querySelector('a[href="/user/carol"]').textContent).toBe('carol');
    expect(fixture.nativeElement.textContent).toContain('Leaf');
  });

  it('toggles collapse and restores the comment tree without collapsing its child', () => {
    fixture.componentInstance.comment = comment({ comments: [comment({ id: 2 })] });
    fixture.detectChanges();
    const control: HTMLElement = fixture.nativeElement.querySelector('.collapse');
    const tree: HTMLElement = fixture.nativeElement.querySelector('.comment-tree > div');
    control.click();
    fixture.detectChanges();
    expect(control.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(fixture.nativeElement.querySelector('.meta').classList.contains('meta-collapse')).toBe(true);
    expect(fixture.debugElement.query(By.directive(CommentComponent)).componentInstance.collapse).toBe(false);
    control.click();
    fixture.detectChanges();
    expect(control.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);
    expect(fixture.nativeElement.querySelector('.meta').classList.contains('meta-collapse')).toBe(false);
  });

  it('renders only a deleted marker without author, content or children for deleted comments', () => {
    fixture.componentInstance.comment = comment({ deleted: true, comments: [comment({ id: 2 })] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('[deleted] | Comment Deleted');
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('.comment-text')).toBeNull();
    expect(fixture.debugElement.query(By.directive(CommentComponent))).toBeNull();
  });

  it('handles an empty comment body without inventing content', () => {
    fixture.componentInstance.comment = comment({ content: '', comments: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.comment-text').textContent).toBe('');
    expect(fixture.nativeElement.querySelectorAll('app-comment').length).toBe(0);
  });
});
