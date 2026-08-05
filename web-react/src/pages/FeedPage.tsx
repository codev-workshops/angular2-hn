import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '../api/hackernews';
import { Item } from '../components/Item';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './FeedPage.scss';

export function FeedPage({ feedType }: { feedType: string }) {
  const params = useParams();
  const pageNum = Number(params.page ?? 1);
  const listStart = (pageNum - 1) * 30 + 1;

  const { data: items, isPending, isError } = useQuery({
    queryKey: ['feed', feedType, pageNum],
    queryFn: () => fetchFeed(feedType, pageNum),
  });

  useEffect(() => {
    if (items) {
      window.scrollTo(0, 0);
    }
  }, [items]);

  return (
    <div className="main-content">
      {isPending && !isError && <Loader />}
      {isError && <ErrorMessage message={'Could not load ' + feedType + ' stories.'} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at
              a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
