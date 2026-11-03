import { TestBed } from '@angular/core/testing';

import { RATINGS_STORAGE_KEY, RatingService } from './rating.service';

describe('RatingService', () => {
  let service: RatingService;

  beforeEach(() => {
    localStorage.removeItem(RATINGS_STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatingService);
  });

  afterEach(() => localStorage.removeItem(RATINGS_STORAGE_KEY));

  it('returns 0 for unrated items', () => {
    expect(service.getRating(1)).toBe(0);
  });

  it('stores ratings as a JSON map under a single key', () => {
    service.setRating(1, 4);
    service.setRating(2, 2);

    expect(service.getRating(1)).toBe(4);
    expect(JSON.parse(localStorage.getItem(RATINGS_STORAGE_KEY))).toEqual({ 1: 4, 2: 2 });
  });

  it('ignores ratings outside 1-5', () => {
    service.setRating(1, 0);
    service.setRating(1, 6);
    service.setRating(1, 2.5);

    expect(service.getRating(1)).toBe(0);
  });

  it('clears a rating', () => {
    service.setRating(1, 3);
    service.clearRating(1);

    expect(service.getRating(1)).toBe(0);
    expect(JSON.parse(localStorage.getItem(RATINGS_STORAGE_KEY))).toEqual({});
  });

  it('treats corrupted storage as empty', () => {
    localStorage.setItem(RATINGS_STORAGE_KEY, '{not json');

    expect(service.getRating(1)).toBe(0);
    service.setRating(1, 5);
    expect(service.getRating(1)).toBe(5);
  });

  it('notifies subscribers when a rating changes', () => {
    const changed: number[] = [];
    service.ratingChanges.subscribe(id => changed.push(id));

    service.setRating(7, 3);
    service.clearRating(7);

    expect(changed).toEqual([7, 7]);
  });
});
