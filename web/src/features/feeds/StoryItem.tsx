import { Link } from 'react-router';
import { commentLabel } from '../../lib/comments';
import { hasHttpUrl } from '../../lib/url';
import { useSettingsStore } from '../../store/settings';
import { Story } from '../../types/models';

const legacySpace = ' ';
const legacyDoubleSpace = '  ';

interface StoryItemProps {
    item: Story;
}

// These separators are byte-exact with the legacy Angular textContent diff on frozen fixtures; see MIGRATION-INVARIANTS.md and do not tidy them.
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
        <div className="item-block">
            <div style={{ marginBottom: `${listSpacing}px` }}>
                {legacySpace}
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
                        {item.domain && (
                            <>
                                {legacySpace}
                                <span className="domain">({item.domain})</span>
                            </>
                        )}
                    </p>
                ) : (
                    <p>
                        <Link className="title" style={titleStyle} to={itemPath}>
                            {item.title}
                        </Link>
                        {legacySpace}
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
                    {legacySpace}
                    <div className="details">
                        {item.time_ago}
                        {!isJob ? legacyDoubleSpace : legacySpace}
                        {!isJob && (
                            <Link className="comment-number" to={itemPath}>
                                • {label}
                                {legacySpace}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {legacySpace}
                    {!isJob && (
                        <span>
                            {item.points} points by <Link to={userPath}>{item.user}</Link>
                        </span>
                    )}
                    {!isJob && legacySpace}
                    <span className={isJob ? undefined : 'item-details'}>
                        {item.time_ago}
                        {!isJob && (
                            <>
                                {legacyDoubleSpace}|{legacyDoubleSpace}
                                <Link to={itemPath}>
                                    {label}
                                    {legacySpace}
                                </Link>
                            </>
                        )}
                    </span>
                    {isJob && legacySpace}
                </div>
            </div>
        </div>
    );
}
