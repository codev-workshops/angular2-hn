import { Link } from 'react-router-dom';
import type { Story } from '../models';
import { useSettingsStore } from '../stores/settings';
import { commentLabel } from '../utils/comment-label';
import './Item.scss';

export function Item({ item }: { item: Story }) {
  const openLinkInNewTab = useSettingsStore((s) => s.openLinkInNewTab);
  const titleFontSize = useSettingsStore((s) => s.titleFontSize);
  const listSpacing = useSettingsStore((s) => s.listSpacing);

  const hasUrl = item.url != null && item.url.indexOf('http') === 0;
  const titleStyle = { fontSize: `${titleFontSize}px` };

  return (
    <div className="item-block" style={{ marginBottom: `${listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a
            className="title"
            style={titleStyle}
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
          <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
            {item.title}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        {item.type !== 'job' && (
          <div className="details">
            <span className="name">
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' '}• {commentLabel(item.comments_count)}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {item.type !== 'job' && (
          <span>
            {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        )}
        <span className={item.type !== 'job' ? 'item-details' : undefined}>
          {item.time_ago}
          {item.type !== 'job' && (
            <span>
              {' '}| <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
