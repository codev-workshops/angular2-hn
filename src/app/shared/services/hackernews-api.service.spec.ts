import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
    let service: HackerNewsAPIService;

    beforeEach(() => {
        service = new HackerNewsAPIService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a baseUrl set', () => {
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });

    describe('fetchFeed', () => {
        it('should return an Observable', () => {
            const result = service.fetchFeed('news', 1);
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeDefined();
        });
    });

    describe('fetchItemContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchItemContent(123);
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeDefined();
        });
    });

    describe('fetchPollContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchPollContent(456);
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeDefined();
        });
    });

    describe('fetchUser', () => {
        it('should return an Observable', () => {
            const result = service.fetchUser('testuser');
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeDefined();
        });
    });
});
