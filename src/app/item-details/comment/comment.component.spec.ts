import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    const mockComment: Comment = {
        id: 1,
        level: 0,
        user: 'testuser',
        time: 1234567890,
        time_ago: '2 hours ago',
        content: '<p>Test comment content</p>',
        deleted: false,
        comments: []
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = mockComment;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize collapse as false', () => {
        expect(component.collapse).toBe(false);
    });

    it('should display comment user', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.meta a').textContent).toContain('testuser');
    });

    it('should display time ago', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.time').textContent).toContain('2 hours ago');
    });

    it('should show deleted message for deleted comments', () => {
        const deletedComment: Comment = { ...mockComment, deleted: true };
        component.comment = deletedComment;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.deleted-meta')).toBeTruthy();
    });

    it('should not show deleted message for non-deleted comments', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.deleted-meta')).toBeFalsy();
    });
});
