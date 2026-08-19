import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackerNews';
import type { Story } from '../../models/story';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Item } from '../Item/Item';
import { Loader } from '../Loader/Loader';

import './Feed.scss';

export function Feed({ feedType }: { feedType: string }) {
    const params = useParams();
    const pageNum = params.page ? +params.page : 1;

    const [items, setItems] = useState<Story[] | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState<number | undefined>(undefined);

    useEffect(() => {
        const controller = new AbortController();

        fetchFeed(feedType, pageNum, controller.signal)
            .then((fetchedItems) => {
                setItems(fetchedItems);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load ' + feedType + ' stories.');
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <div className="c-feed">
            <div className="main-content">
                {!items && !errorMessage ? <Loader /> : null}
                {!items && errorMessage !== '' ? <ErrorMessage message={errorMessage} /> : null}

                {items ? (
                    <div>
                        {feedType === 'jobs' ? (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                                YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>
                                {'. '}
                            </p>
                        ) : null}
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 ? (
                                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    {' ‹ Prev '}
                                </Link>
                            ) : null}
                            {items.length === 30 ? (
                                <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                    {' More › '}
                                </Link>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
