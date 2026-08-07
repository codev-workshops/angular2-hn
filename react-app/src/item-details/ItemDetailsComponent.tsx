import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { fetchItemContent } from '../shared/api/hackernews-api';
import { ErrorMessageComponent } from '../shared/components/error-message/ErrorMessageComponent';
import { LoaderComponent } from '../shared/components/loader/LoaderComponent';
import type { Story } from '../shared/models/story';
import { commentLabel } from '../shared/pipes/comment';
import { RouterLink } from '../shared/router/RouterLink';
import { scope } from '../shared/scope';
import { useSettings } from '../shared/services/use-settings';
import { CommentComponent } from './comment/CommentComponent';
import './item-details.component.scss';

const ng = scope('item-details');

export function ItemDetailsComponent() {
    const { id } = useParams();
    const itemID = Number(id);
    const navigate = useNavigate();
    const settings = useSettings();
    const [item, setItem] = useState<Story | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');
    const latestRequest = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        const request = ++latestRequest.current;
        fetchItemContent(itemID, controller.signal).then(
            (fetched) => {
                if (request === latestRequest.current) {
                    setItem(fetched);
                }
            },
            () => {
                if (request === latestRequest.current) {
                    setErrorMessage('Could not load item comments.');
                }
            }
        );
        return () => controller.abort();
    }, [itemID]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const hasUrl = item ? item.url.indexOf('http') === 0 : false;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <app-item-details>
            <div {...ng} className="main-content">
                {!item && errorMessage === '' ? <LoaderComponent /> : null}
                {!item && errorMessage !== '' ? <ErrorMessageComponent message={errorMessage} /> : null}

                {item ? (
                    <div {...ng} className="item">
                        <div {...ng} className="mobile item-header">
                            <p {...ng} className="title-block">
                                <span {...ng} className="back-button" onClick={() => navigate(-1)}></span>
                                {hasUrl ? (
                                    <a {...ng} className="title" href={item.url} target={target} rel={rel}>
                                        {` ${item.title} `}
                                    </a>
                                ) : (
                                    <RouterLink ng={ng} className="title" to={`/item/${item.id}`}>
                                        {` ${item.title} `}
                                    </RouterLink>
                                )}
                            </p>
                        </div>
                        <div
                            {...ng}
                            className={`laptop${
                                item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''
                            }`}
                        >
                            {hasUrl ? (
                                <p {...ng}>
                                    <a {...ng} className="title" href={item.url} target={target} rel={rel}>
                                        {` ${item.title} `}
                                    </a>
                                    {item.domain ? (
                                        <span {...ng} className="domain">
                                            {`(${item.domain})`}
                                        </span>
                                    ) : null}
                                </p>
                            ) : (
                                <p {...ng}>
                                    <RouterLink ng={ng} className="title" to={`/item/${item.id}`}>
                                        {` ${item.title} `}
                                    </RouterLink>
                                </p>
                            )}
                            <div {...ng} className="subtext">
                                {item.type !== 'job' ? (
                                    <span {...ng}>
                                        {` ${item.points} points by `}
                                        <RouterLink ng={ng} to={`/user/${item.user}`}>
                                            {item.user}
                                        </RouterLink>
                                    </span>
                                ) : null}
                                <span {...ng} className={item.type !== 'job' ? 'item-details' : undefined}>
                                    {` ${item.time_ago} `}
                                    {item.type !== 'job' ? (
                                        <span {...ng}>
                                            {' | '}
                                            <RouterLink ng={ng} to={`/item/${item.id}`}>
                                                {` ${commentLabel(item.comments_count)} `}
                                            </RouterLink>
                                        </span>
                                    ) : null}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' ? (
                            <div {...ng} className="pollResults">
                                {item.poll.map((pollResult, index) => (
                                    <div {...ng} key={index} className="pollContent">
                                        <div {...ng} dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                        <div {...ng} className="subtext">
                                            {`${pollResult.points} points`}
                                        </div>
                                        <div
                                            {...ng}
                                            className="pollBar"
                                            style={{
                                                width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <p
                            {...ng}
                            className="subject"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        ></p>
                        <ul {...ng} className="comment-list">
                            {item.comments.map((comment) => (
                                <li {...ng} key={comment.id}>
                                    <CommentComponent comment={comment} host={ng} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </app-item-details>
    );
}
