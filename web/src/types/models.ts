export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export interface Comment {
    id?: number;
    level?: number;
    user?: string;
    time?: number;
    time_ago?: string;
    content?: string;
    deleted?: boolean;
    comments?: Comment[] | null;
}

export interface PollResult {
    points?: number;
    content?: string;
}

export interface Story {
    id?: number;
    title?: string;
    points?: number;
    user?: string;
    time?: number;
    time_ago?: string;
    type?: 'poll' | 'story' | 'link' | 'job' | string;
    url?: string;
    domain?: string;
    comments?: Comment[] | null;
    comments_count?: number;
    poll?: PollResult[] | null;
    poll_votes_count?: number;
    deleted?: boolean;
    dead?: boolean;
    content?: string;
    text?: string;
}

export interface User {
    id?: string;
    created_at_i?: number;
    created?: string;
    karma?: number;
    avg?: number;
    about?: string;
}

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
}
