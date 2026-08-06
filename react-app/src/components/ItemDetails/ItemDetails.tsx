import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackerNews';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models/story';
import { Comment } from '../Comment/Comment';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Loader } from '../Loader/Loader';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

import './ItemDetails.scss';

export default function ItemDetails() {
    const params = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const itemID = Number(params.id);

    const [item, setItem] = useState<Story | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        fetchItemContent(itemID, controller.signal)
            .then((fetchedItem) => setItem(fetchedItem))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load item comments.');
            });

        window.scrollTo(0, 0);

        return () => controller.abort();
    }, [itemID]);

    const hasUrl = (item?.url ?? '').indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    const laptopClasses = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClasses.push('item-header');
    }
    if (item && item.text) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="c-item-details">
            <div className="main-content">
                {!item && !errorMessage ? <Loader /> : null}
                {!item && errorMessage !== '' ? <ErrorMessage message={errorMessage} /> : null}

                {item ? (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={() => navigate(-1)}></span>
                                {hasUrl ? (
                                    <a className="title" href={item.url} target={target} rel={rel}>
                                        {` ${item.title} `}
                                    </a>
                                ) : (
                                    <Link className="title" to={`/item/${item.id}`}>
                                        {` ${item.title} `}
                                    </Link>
                                )}
                            </p>
                        </div>
                        <div className={laptopClasses.join(' ')}>
                            {hasUrl ? (
                                <p>
                                    <a className="title" href={item.url} target={target} rel={rel}>
                                        {` ${item.title} `}
                                    </a>
                                    {item.domain ? <span className="domain">{`(${item.domain})`}</span> : null}
                                </p>
                            ) : (
                                <p>
                                    <Link className="title" to={`/item/${item.id}`}>
                                        {` ${item.title} `}
                                    </Link>
                                </p>
                            )}
                            <div className="subtext">
                                {item.type !== 'job' ? (
                                    <span>
                                        {` ${item.points} points by `}
                                        <Link to={`/user/${item.user}`}>{item.user}</Link>
                                    </span>
                                ) : null}
                                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                    {` ${item.time_ago} `}
                                    {item.type !== 'job' ? (
                                        <span>
                                            {' | '}
                                            <Link to={`/item/${item.id}`}>
                                                {` ${formatCommentCount(item.comments_count)} `}
                                            </Link>
                                        </span>
                                    ) : null}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' ? (
                            <div className="pollResults">
                                {(item.poll ?? []).map((pollResult, index) => (
                                    <div className="pollContent" key={index}>
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }}></div>
                                        <div className="subtext">{`${pollResult.points} points`}</div>
                                        <div
                                            className="pollBar"
                                            style={{
                                                width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content ?? '') }}></p>
                        <ul className="comment-list">
                            {(item.comments ?? []).map((comment) => (
                                <li key={comment.id}>
                                    <Comment comment={comment} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
