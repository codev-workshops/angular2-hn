import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent } from './api';
import { http } from './http';

describe('api', () => {
    beforeEach(() => vi.restoreAllMocks());

    it('keeps null feed bodies available to the caller', async () => {
        vi.spyOn(http, 'get').mockResolvedValue({ data: null } as never);
        await expect(fetchFeed('news', 1)).resolves.toBeNull();
    });

    it('fans polls out into sibling item requests and accumulates votes', async () => {
        const get = vi
            .spyOn(http, 'get')
            .mockResolvedValueOnce({
                data: { id: 10, type: 'poll', poll: [{}, {}], poll_votes_count: 0 },
            } as never)
            .mockResolvedValueOnce({ data: { points: 2, content: '<b>A</b>' } } as never)
            .mockResolvedValueOnce({ data: { points: 3, content: '<i>B</i>' } } as never);
        await expect(fetchItemContent(10)).resolves.toMatchObject({
            poll_votes_count: 5,
            poll: [{ points: 2 }, { points: 3 }],
        });
        expect(get.mock.calls.map(([url]) => url)).toEqual(['/item/10', '/item/11', '/item/12']);
    });

    it('throws for a null item body like the legacy map callback', async () => {
        vi.spyOn(http, 'get').mockResolvedValue({ data: null } as never);
        await expect(fetchItemContent(10)).rejects.toThrow(/reading 'type'/);
    });
});
