import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { ErrorMessageComponent } from '../../shared/components/error-message/ErrorMessageComponent';
import { LoaderComponent } from '../../shared/components/loader/LoaderComponent';
import type { Story } from '../../shared/models/story';
import { fetchFeed } from '../../shared/api/hackernews-api';
import { RouterLink } from '../../shared/router/RouterLink';
import { scope } from '../../shared/scope';
import { ItemComponent } from '../item/ItemComponent';
import './feed.component.scss';

const ng = scope('feed');

export function FeedComponent({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | undefined>(undefined);
    const [listStart, setListStart] = useState<number | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');
    const latestRequest = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        const request = ++latestRequest.current;
        fetchFeed(feedType, pageNum, controller.signal).then(
            (fetched) => {
                if (request !== latestRequest.current) {
                    return;
                }
                setItems(fetched);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            },
            () => {
                if (request === latestRequest.current) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            }
        );
        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <app-feed>
            <div {...ng} className="main-content">
                {!items && errorMessage === '' ? <LoaderComponent /> : null}
                {!items && errorMessage !== '' ? <ErrorMessageComponent message={errorMessage} /> : null}
                {items ? (
                    <div {...ng}>
                        {feedType === 'jobs' ? (
                            <p {...ng} className="job-header">
                                {' These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through '}
                                <a {...ng} href="https://triplebyte.com/?ref=yc_jobs">
                                    Triplebyte
                                </a>
                                {'. '}
                            </p>
                        ) : null}
                        <ol {...ng} className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li {...ng} key={item.id} className="post">
                                    <ItemComponent item={item} host={{ ...ng, className: 'item-block' }} />
                                </li>
                            ))}
                        </ol>
                        <div {...ng} className="nav">
                            {listStart !== 1 ? (
                                <RouterLink ng={ng} to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    {' \u2039 Prev '}
                                </RouterLink>
                            ) : null}
                            {items.length === 30 ? (
                                <RouterLink ng={ng} to={`/${feedType}/${pageNum + 1}`} className="more">
                                    {' More \u203a '}
                                </RouterLink>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </app-feed>
    );
}
