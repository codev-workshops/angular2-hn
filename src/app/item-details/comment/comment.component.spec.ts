import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CommentComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = {
            id: 1,
            level: 0,
            user: 'testuser',
            time: 123,
            time_ago: '2 hours ago',
            content: '<p>Test comment</p>',
            deleted: false,
            comments: [],
        } as Comment;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize collapse to false', () => {
        expect(component.collapse).toBe(false);
    });
});
