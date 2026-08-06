import { Link } from 'react-router';
import { commentLabel } from '../../lib/comments';
import { hasHttpUrl } from '../../lib/url';
import { useSettingsStore } from '../../store/settings';
import { Story } from '../../types/models';

interface StoryItemProps {
    item: Story;
}

export function StoryItem({ item }: StoryItemProps) {
    const openLinkInNewTab = useSettingsStore((state) => state.openLinkInNewTab);
    const titleFontSize = useSettingsStore((state) => state.titleFontSize);
    const listSpacing = useSettingsStore((state) => state.listSpacing);
    const isJob = item.type === 'job';
    const external = hasHttpUrl(item.url);
    const titleStyle = { fontSize: `${titleFontSize}px` };
    const label = commentLabel(item.comments_count ?? 0);
    const userPath = `/user/${item.user}`;
    const itemPath = `/item/${item.id}`;

    return (
        <div className="item-block" style={{ marginBottom: `${listSpacing}px` }}>
            {external ? (
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
                    <Link className="title" style={titleStyle} to={itemPath}>
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <Link to={userPath}>{item.user}</Link>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}{' '}
                    {!isJob && (
                        <Link className="comment-number" to={itemPath}>
                            • {label}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by <Link to={userPath}>{item.user}</Link>
                    </span>
                )}{' '}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <>
                            {' '}
                            | <Link to={itemPath}>{label}</Link>
                        </>
                    )}
                </span>
            </div>
        </div>
    );
}
