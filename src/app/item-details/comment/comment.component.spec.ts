import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comment } from '../../shared/models/comment';
import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;
  let el: HTMLElement;

  function render(comment: Partial<Comment>) {
    component.comment = {
      id: 1,
      user: 'bob',
      time_ago: '1 hour ago',
      content: '<p>Nice!</p>',
      deleted: false,
      comments: [],
      ...comment,
    } as Comment;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [CommentComponent], schemas: [NO_ERRORS_SCHEMA] });
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('should create expanded by default', () => {
    render({});
    expect(component).toBeTruthy();
    expect(component.collapse).toBe(false);
  });

  it('should render the author, time and HTML content', () => {
    render({});

    expect(el.querySelector('.meta a').textContent).toBe('bob');
    expect(el.querySelector('.time').textContent).toBe('1 hour ago');
    expect(el.querySelector('.comment-text').innerHTML).toBe('<p>Nice!</p>');
    expect(el.querySelector('.deleted-meta')).toBeNull();
  });

  it('should render a placeholder for deleted comments', () => {
    render({ deleted: true });

    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
    expect(el.querySelector('.meta')).toBeNull();
  });

  it('should render one nested app-comment per reply', () => {
    render({ comments: [{ id: 2 } as Comment, { id: 3 } as Comment] });
    expect(el.querySelectorAll('.subtree > li').length).toBe(2);
  });

  it('should toggle collapse when the [-]/[+] control is clicked', () => {
    render({});
    const toggle = el.querySelector('.collapse') as HTMLElement;
    const tree = el.querySelector('.comment-tree > div') as HTMLElement;

    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();

    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(el.querySelector('.meta').classList).toContain('meta-collapse');

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
  });
});
