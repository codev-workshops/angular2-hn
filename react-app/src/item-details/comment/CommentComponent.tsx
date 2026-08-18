import { useState } from 'react';

import type { Comment } from '../../shared/models/comment';
import { RouterLink } from '../../shared/router/RouterLink';
import { scope, type Scope } from '../../shared/scope';
import './comment.component.scss';

const ng = scope('comment');

interface CommentComponentProps {
    comment: Comment;
    /** Attributes the parent template puts on this component's host element. */
    host: Scope;
}

export function CommentComponent({ comment, host }: CommentComponentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <app-comment {...host}>
                <div {...ng}>
                    <div {...ng} className="deleted-meta">
                        <span {...ng} className="collapse">
                            [deleted]
                        </span>
                        {' | Comment Deleted '}
                    </div>
                </div>
            </app-comment>
        );
    }

    return (
        <app-comment {...host}>
            <div {...ng}>
                <div {...ng} className={collapse ? 'meta meta-collapse' : 'meta'}>
                    <span {...ng} className="collapse" onClick={() => setCollapse(!collapse)}>
                        {`[${collapse ? '+' : '-'}]`}
                    </span>
                    <RouterLink ng={ng} to={`/user/${comment.user}`}>
                        {comment.user}
                    </RouterLink>
                    <span {...ng} className="time">
                        {comment.time_ago}
                    </span>
                </div>
                <div {...ng} className="comment-tree">
                    <div {...ng} hidden={collapse}>
                        <p
                            {...ng}
                            className="comment-text"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        ></p>
                        <ul {...ng} className="subtree">
                            {comment.comments.map((subComment) => (
                                <li {...ng} key={subComment.id}>
                                    <CommentComponent comment={subComment} host={ng} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </app-comment>
    );
}
