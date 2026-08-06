import { getJson } from './http';
import { FeedType, PollResult, Story, User } from '../types/models';

export function fetchFeed(
    feedType: FeedType | string,
    page: number
): Promise<Story[] | null | Record<string, unknown>> {
    return getJson<Story[] | null | Record<string, unknown>>(`/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story | null>(`/item/${id}`);
    if (story?.type === 'poll') {
        const poll = story.poll ?? [];
        story.poll_votes_count = 0;
        for (let index = 1; index <= poll.length; index += 1) {
            const pollResult = await fetchPollContent((story.id as number) + index);
            poll[index - 1] = pollResult;
            story.poll_votes_count += pollResult.points ?? 0;
        }
    } else if (story === null) {
        // Match the legacy map callback, which dereferences `story.type` for null bodies.
        throw new TypeError("Cannot read properties of null (reading 'type')");
    }
    return story;
}

export function fetchUser(id: string): Promise<User | null> {
    return getJson<User | null>(`/user/${id}`);
}
