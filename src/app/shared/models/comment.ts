export class Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    // tslint:disable-next-line:variable-name
    time_ago: string;
    content: string;
    deleted: boolean;
    comments: Comment[];
}
