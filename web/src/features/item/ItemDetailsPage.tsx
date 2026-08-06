import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import { fetchItemContent } from '../../lib/api';
import { commentLabel } from '../../lib/comments';
import { sanitizeHtml } from '../../lib/html';
import { hasHttpUrl } from '../../lib/url';
import { useSettingsStore } from '../../store/settings';
import { Comment, PollResult, Story } from '../../types/models';
import { CommentNode } from './CommentNode';

const legacySpace = ' ';
const legacyDoubleSpace = '  ';

function isHttpUrl(url: unknown): url is string {
    return typeof url === 'string' && hasHttpUrl(url);
}

function TitleLink({ item, openLinkInNewTab }: { item: Story; openLinkInNewTab: boolean }) {
    const hasUrl = isHttpUrl(item.url);
    if (hasUrl) {
        return (
            <a className="title" href={item.url} {...(openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {})}>
                {item.title}
            </a>
        );
    }
    return (
        <Link className="title" to={`/item/${item.id ?? ''}`}>
            {item.title}
        </Link>
    );
}

function ItemSubtext({ item }: { item: Story }) {
    return (
        <div className="subtext">
            {legacySpace}
            {item.type !== 'job' && (
                <span>
                    {item.points} points by <Link to={`/user/${item.user ?? ''}`}>{item.user}</Link>
                </span>
            )}
            {legacySpace}
            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                    <span>
                        {legacyDoubleSpace}|{legacyDoubleSpace}
                        <Link to={`/item/${item.id ?? ''}`}>{commentLabel(item.comments_count ?? 0)} </Link>
                    </span>
                )}
            </span>
        </div>
    );
}

function PollResultView({ result, votes }: { result: PollResult; votes: number }) {
    return (
        <div className="pollContent">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.content) }} />
            <div className="subtext">{result.points} points</div>
            <div className="pollBar" style={{ width: `${((result.points ?? 0) / votes) * 100}%` }} />
        </div>
    );
}

// These separators are byte-exact with the legacy Angular textContent diff on frozen fixtures; see MIGRATION-INVARIANTS.md and do not tidy.
export function ItemDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const openLinkInNewTab = useSettingsStore((state) => state.openLinkInNewTab);
    const [item, setItem] = useState<Story | undefined>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let current = true;
        setItem(undefined);
        setErrorMessage('');
        fetchItemContent(Number(id)).then(
            (nextItem) => {
                if (current) {
                    setItem(nextItem);
                }
            },
            () => {
                if (current) {
                    setErrorMessage('Could not load item comments.');
                }
            }
        );
        return () => {
            current = false;
        };
    }, [id]);

    const comments: Comment[] = item && Array.isArray(item.comments) ? item.comments : [];
    const poll = item && Array.isArray(item.poll) ? item.poll : [];

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)} />
                            {legacySpace}
                            <TitleLink item={item} openLinkInNewTab={openLinkInNewTab} />
                            {legacySpace}
                        </p>
                    </div>
                    <div
                        className={`laptop${(item.comments_count && item.comments_count > 0) || item.type === 'job' ? ' item-header' : ''}${
                            item.text ? ' head-margin' : ''
                        }`}
                    >
                        {legacySpace}
                        {isHttpUrl(item.url) ? (
                            <p>
                                <TitleLink item={item} openLinkInNewTab={openLinkInNewTab} />
                                {item.domain && (
                                    <>
                                        {legacySpace}
                                        <span className="domain">({item.domain})</span>
                                    </>
                                )}
                            </p>
                        ) : (
                            <p>
                                <TitleLink item={item} openLinkInNewTab={openLinkInNewTab} />
                                {legacySpace}
                            </p>
                        )}
                        <ItemSubtext item={item} />
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {poll.map((result, index) => (
                                <PollResultView key={index} result={result} votes={item.poll_votes_count ?? 0} />
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
                    <ul className="comment-list">
                        {comments.map((comment) => (
                            <li key={comment.id ?? `${comment.user}-${comment.time}`}>
                                <CommentNode comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
