import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  beforeEach(() => localStorage.removeItem('itemRatings'));
  afterEach(() => localStorage.removeItem('itemRatings'));

  it('returns zero for unrated items and persists ratings independently', () => {
    const service = new RatingsService();
    expect(service.getRating(1)).toBe(0);
    service.setRating(1, 4);
    service.setRating(2, 5);
    const restored = new RatingsService();
    expect(restored.getRating(1)).toBe(4);
    expect(restored.getRating(2)).toBe(5);
  });

  it('clears a rating persistently without clearing other items', () => {
    const service = new RatingsService();
    service.setRating(1, 3);
    service.setRating(2, 2);
    service.setRating(1, 0);
    expect(new RatingsService().getRating(1)).toBe(0);
    expect(new RatingsService().getRating(2)).toBe(2);
    expect(JSON.parse(localStorage.getItem('itemRatings'))).toEqual({ 2: 2 });
  });

  it('recovers from corrupt JSON and invalid storage shapes', () => {
    ['{broken', 'null', '[]', '7'].forEach(saved => {
      localStorage.setItem('itemRatings', saved);
      const service = new RatingsService();
      expect(service.getRating(1)).toBe(0);
      service.setRating(1, 5);
      expect(new RatingsService().getRating(1)).toBe(5);
    });
  });

  it('rejects invalid ratings from storage and callers', () => {
    localStorage.setItem('itemRatings', '{"1":8,"2":"3","3":2.5}');
    const service = new RatingsService();
    [1, 2, 3].forEach(id => expect(service.getRating(id)).toBe(0));
    [-1, 6, 2.5, NaN].forEach(value => service.setRating(1, value));
    expect(service.getRating(1)).toBe(0);
  });

  it('keeps working in memory when storage reads and writes throw', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('unavailable');
    spyOn(Storage.prototype, 'setItem').and.throwError('unavailable');
    const service = new RatingsService();
    expect(service.getRating(1)).toBe(0);
    expect(() => service.setRating(1, 4)).not.toThrow();
    expect(service.getRating(1)).toBe(4);
    service.setRating(1, 0);
    expect(service.getRating(1)).toBe(0);
  });
});
