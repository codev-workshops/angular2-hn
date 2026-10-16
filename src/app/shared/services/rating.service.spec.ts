import { TestBed } from '@angular/core/testing';

import { RatingService, RATINGS_STORAGE_KEY } from './rating.service';

describe('RatingService', () => {
  let service: RatingService;

  const createService = () => {
    TestBed.configureTestingModule({});
    return TestBed.inject(RatingService);
  };

  const stored = () => JSON.parse(localStorage.getItem(RATINGS_STORAGE_KEY));

  beforeEach(() => {
    localStorage.removeItem(RATINGS_STORAGE_KEY);
    service = createService();
  });

  afterEach(() => {
    localStorage.removeItem(RATINGS_STORAGE_KEY);
  });

  it('returns 0 for unrated stories', () => {
    expect(service.getRating(123)).toBe(0);
  });

  it('sets and persists a rating', () => {
    service.setRating(123, 4);

    expect(service.getRating(123)).toBe(4);
    expect(stored()).toEqual({ 123: 4 });
  });

  it('overwrites an existing rating', () => {
    service.setRating(123, 2);
    service.setRating(123, 5);

    expect(service.getRating(123)).toBe(5);
  });

  it('clamps ratings to the 1-5 range', () => {
    service.setRating(1, 9);
    service.setRating(2, 0);

    expect(service.getRating(1)).toBe(5);
    expect(service.getRating(2)).toBe(0);
    expect(stored()).toEqual({ 1: 5 });
  });

  it('clears a rating', () => {
    service.setRating(123, 3);
    service.setRating(456, 1);
    service.clearRating(123);

    expect(service.getRating(123)).toBe(0);
    expect(service.getRating(456)).toBe(1);
    expect(stored()).toEqual({ 456: 1 });
  });

  it('loads previously stored ratings', () => {
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify({ 42: 3 }));
    TestBed.resetTestingModule();
    service = createService();

    expect(service.getRating(42)).toBe(3);
  });

  it('falls back to no ratings when stored JSON is corrupt', () => {
    localStorage.setItem(RATINGS_STORAGE_KEY, '{not json');
    TestBed.resetTestingModule();
    service = createService();

    expect(service.getRating(42)).toBe(0);
    service.setRating(42, 2);
    expect(stored()).toEqual({ 42: 2 });
  });

  it('falls back to no ratings when stored value is not an object', () => {
    localStorage.setItem(RATINGS_STORAGE_KEY, '[1,2,3]');
    TestBed.resetTestingModule();
    service = createService();

    expect(service.getRating(1)).toBe(0);
  });
});
