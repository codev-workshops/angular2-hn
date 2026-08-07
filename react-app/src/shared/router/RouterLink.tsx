import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import type { Scope } from '../scope';

/** Angular's `routerLinkActive` without `[routerLinkActiveOptions]` marks a link
 * active when the current URL starts with the link's URL on a segment boundary. */
export function isRouterLinkActive(currentPath: string, target: string): boolean {
    const current = currentPath.replace(/\/+$/, '');
    const link = target.replace(/\/+$/, '');
    return current === link || current.startsWith(`${link}/`);
}

interface RouterLinkProps {
    to: string;
    ng?: Scope;
    className?: string;
    style?: CSSProperties;
    /** Set to false for links rendered without `routerLinkActive`. */
    activeClass?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    children?: ReactNode;
}

export function RouterLink({ to, ng, className, style, activeClass = true, onClick, children }: RouterLinkProps) {
    const { pathname } = useLocation();
    const active = activeClass && isRouterLinkActive(pathname, to);
    const classes = [className, active ? 'active' : null].filter(Boolean).join(' ');
    return (
        <Link {...ng} to={to} className={classes === '' ? undefined : classes} style={style} onClick={onClick}>
            {children}
        </Link>
    );
}
