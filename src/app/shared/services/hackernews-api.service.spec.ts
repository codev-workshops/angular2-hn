import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
    let service: HackerNewsAPIService;

    beforeEach(() => {
        service = new HackerNewsAPIService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have baseUrl set', () => {
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });

    it('should return an Observable from fetchFeed', () => {
        const result = service.fetchFeed('news', 1);
        expect(result).toBeTruthy();
        expect(result.subscribe).toBeDefined();
    });

    it('should return an Observable from fetchItemContent', () => {
        const result = service.fetchItemContent(123);
        expect(result).toBeTruthy();
        expect(result.subscribe).toBeDefined();
    });

    it('should return an Observable from fetchPollContent', () => {
        const result = service.fetchPollContent(123);
        expect(result).toBeTruthy();
        expect(result.subscribe).toBeDefined();
    });

    it('should return an Observable from fetchUser', () => {
        const result = service.fetchUser('testuser');
        expect(result).toBeTruthy();
        expect(result.subscribe).toBeDefined();
    });
});
