import type { Story } from '../../shared/models/story';
import { commentLabel } from '../../shared/pipes/comment';
import { RouterLink } from '../../shared/router/RouterLink';
import { scope, type Scope } from '../../shared/scope';
import { useSettings } from '../../shared/services/use-settings';
import './item.component.scss';

const ng = scope('item');

interface ItemComponentProps {
    item: Story;
    /** Attributes the parent template puts on this component's host element. */
    host: Scope & { className?: string };
}

export function ItemComponent({ item, host }: ItemComponentProps) {
    const settings = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <item {...host}>
            <div {...ng} style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasUrl ? (
                    <p {...ng}>
                        <a
                            {...ng}
                            className="title"
                            style={{ fontSize: `${settings.titleFontSize}px` }}
                            href={item.url}
                            target={target}
                            rel={rel}
                        >
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
                        <RouterLink
                            ng={ng}
                            className="title"
                            style={{ fontSize: `${settings.titleFontSize}px` }}
                            to={`/item/${item.id}`}
                        >
                            {` ${item.title} `}
                        </RouterLink>
                    </p>
                )}
                <div {...ng} className="subtext-palm">
                    {item.type !== 'job' ? (
                        <div {...ng} className="details">
                            <span {...ng} className="name">
                                <RouterLink ng={ng} to={`/user/${item.user}`}>
                                    {item.user}
                                </RouterLink>
                            </span>
                            <span {...ng} className="right">
                                {`${item.points} \u2605`}
                            </span>
                        </div>
                    ) : null}
                    <div {...ng} className="details">
                        {` ${item.time_ago} `}
                        {item.type !== 'job' ? (
                            <RouterLink ng={ng} to={`/item/${item.id}`} className="comment-number">
                                {` \u2022 ${commentLabel(item.comments_count)} `}
                            </RouterLink>
                        ) : null}
                    </div>
                </div>
                <div {...ng} className="subtext-laptop">
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
        </item>
    );
}
