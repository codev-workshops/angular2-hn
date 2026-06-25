import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    const mockComment: Comment = {
        id: 1,
        level: 0,
        user: 'testuser',
        time: 123456,
        time_ago: '2 hours ago',
        content: '<p>This is a test comment</p>',
        deleted: false,
        comments: [],
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CommentComponent],
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

    it('should initialize collapse to false', () => {
        expect(component.collapse).toBe(false);
    });

    it('should have the comment input', () => {
        expect(component.comment).toEqual(mockComment);
    });

    it('should have comment user', () => {
        expect(component.comment.user).toBe('testuser');
    });

    it('should have comment content', () => {
        expect(component.comment.content).toBe('<p>This is a test comment</p>');
    });
});
