import { useEffect, useState } from 'react';
import { Link, useMatches, useParams } from 'react-router';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import { fetchFeed } from '../../lib/api';
import { Story } from '../../types/models';
import { StoryItem } from './StoryItem';

type FeedBody = Story[] | null | Record<string, unknown> | undefined;

export function FeedPage() {
    const matches = useMatches();
    const params = useParams();
    const leafMatch = matches[matches.length - 1];
    const feedType = (leafMatch?.handle as { feedType?: string } | undefined)?.feedType ?? '';
    const pageNum = params.page ? +params.page : 1;
    const [items, setItems] = useState<FeedBody>();
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState<number>();

    useEffect(() => {
        fetchFeed(feedType, pageNum)
            .then((body) => {
                setItems(body);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                setErrorMessage(`Could not load ${feedType} stories.`);
            });
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {Array.isArray(items) &&
                            items.map((item) => (
                                <li className="post" key={item.id}>
                                    <StoryItem item={item} />
                                </li>
                            ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link className="prev" to={`/${feedType}/${pageNum - 1}`}>
                                ‹ Prev
                            </Link>
                        )}
                        {Array.isArray(items) && items.length === 30 && (
                            <Link className="more" to={`/${feedType}/${pageNum + 1}`}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
