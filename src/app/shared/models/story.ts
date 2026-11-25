import { Comment } from './comment';
import { FeedType } from './feed-type.type';
import { PollResult } from './poll-result';

export class Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    // tslint:disable-next-line:variable-name
    time_ago: number;
    type: FeedType;
    url: string;
    domain: string;
    comments: Comment[];
    // tslint:disable-next-line:variable-name
    comments_count: number;
    poll: PollResult[];
    // tslint:disable-next-line:variable-name
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}
