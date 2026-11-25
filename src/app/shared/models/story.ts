import { Comment } from './comment';
import { FeedType } from './feed-type.type';
import { PollResult } from './poll-result';

export class Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    // tslint:disable-next-line:variable-name -- Field name mirrors the HN API JSON.
    time_ago: number;
    type: FeedType;
    url: string;
    domain: string;
    comments: Comment[];
    // tslint:disable-next-line:variable-name -- Field name mirrors the HN API JSON.
    comments_count: number;
    poll: PollResult[];
    // tslint:disable-next-line:variable-name -- Field name mirrors the HN API JSON.
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}
