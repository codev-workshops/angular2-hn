import { useState } from 'react';
import { Link } from 'react-router';
import { sanitizeHtml } from '../../lib/html';
import { Comment as CommentModel } from '../../types/models';

export function CommentNode({ comment }: { comment: CommentModel }) {
    const [collapse, setCollapse] = useState(false);
    const comments = Array.isArray(comment.comments) ? comment.comments : [];

    if (comment.deleted) {
        return (
            <div>
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span className="collapse" onClick={() => setCollapse((value) => !value)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user ?? ''}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }} />
                    <ul className="subtree">
                        {comments.map((subComment) => (
                            <li key={subComment.id ?? `${subComment.user}-${subComment.time}`}>
                                <CommentNode comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
