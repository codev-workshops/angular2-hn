import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { fetchItem, fetchPollResult } from '../api/hackernews';
import { useSettingsStore } from '../stores/settings';
import { commentLabel } from '../utils/comment-label';
import { Comment } from '../components/Comment';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import './ItemDetailsPage.scss';

export function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const openLinkInNewTab = useSettingsStore((s) => s.openLinkInNewTab);
  const itemId = Number(id);
  const { data: item, isPending, isError } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => fetchItem(itemId),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pollQuery = useQuery({
    queryKey: ['poll', item?.id],
    enabled: item?.type === 'poll',
    queryFn: async () => {
      const optionIds = Array.from(
        { length: item?.poll?.length ?? 0 },
        (_, index) => itemId + index + 1
      );
      const options = await Promise.all(optionIds.map((optionId) => fetchPollResult(optionId)));
      return {
        options,
        votesCount: options.reduce((sum, option) => sum + option.points, 0),
      };
    },
  });

  if (isPending) return <Loader />;
  if (isError || !item) return <ErrorMessage message="Could not load item comments." />;

  const hasUrl = item.url != null && item.url.indexOf('http') === 0;
  const pollOptions = pollQuery.data?.options ?? item.poll ?? [];
  const votesCount = pollQuery.data?.votesCount ?? item.poll_votes_count ?? 0;

  return (
    <div className="main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={() => navigate(-1)}></span>
            {hasUrl ? (
              <a
                className="title"
                href={item.url}
                target={openLinkInNewTab ? '_blank' : undefined}
                rel={openLinkInNewTab ? 'noopener' : undefined}
              >
                {item.title}
              </a>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
        </div>
        <div
          className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${
            item.text ? ' head-margin' : ''
          }`}
        >
          {hasUrl ? (
            <p>
              <a
                className="title"
                href={item.url}
                target={openLinkInNewTab ? '_blank' : undefined}
                rel={openLinkInNewTab ? 'noopener' : undefined}
              >
                {item.title}
              </a>
              {item.domain && <span className="domain">({item.domain})</span>}
            </p>
          ) : (
            <p>
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            </p>
          )}
          <div className="subtext">
            {item.type !== 'job' && (
              <span>
                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
            )}
            <span className={item.type !== 'job' ? 'item-details' : undefined}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' '}
                  | <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && (
          <div className="pollResults">
            {pollOptions.map((pollResult, index) => (
              <div className="pollContent" key={index}>
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pollResult.content) }}
                ></div>
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{ width: `${votesCount ? (pollResult.points / votesCount) * 100 : 0}%` }}
                ></div>
              </div>
            ))}
          </div>
        )}
        <p
          className="subject"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content ?? '') }}
        ></p>
        <ul className="comment-list">
          {item.comments.map((comment) => (
            <li key={comment.id}>
              <Comment comment={comment} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
