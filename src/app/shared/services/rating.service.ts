import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface RatingMap {
  [itemId: number]: number;
}

export const RATINGS_STORAGE_KEY = 'postRatings';
export const MIN_RATING = 1;
export const MAX_RATING = 5;

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly ratingChangesSubject = new Subject<number>();

  /** Emits the id of an item whenever its rating is set or cleared. */
  readonly ratingChanges: Observable<number> = this.ratingChangesSubject.asObservable();

  getRating(itemId: number): number {
    return this.readRatings()[itemId] || 0;
  }

  setRating(itemId: number, rating: number): void {
    if (!Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) {
      return;
    }
    const ratings = this.readRatings();
    ratings[itemId] = rating;
    this.writeRatings(ratings, itemId);
  }

  clearRating(itemId: number): void {
    const ratings = this.readRatings();
    if (!(itemId in ratings)) {
      return;
    }
    delete ratings[itemId];
    this.writeRatings(ratings, itemId);
  }

  private readRatings(): RatingMap {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(RATINGS_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as RatingMap : {};
    } catch {
      return {};
    }
  }

  private writeRatings(ratings: RatingMap, itemId: number): void {
    try {
      localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));
    } catch {
      // Storage may be full or unavailable (e.g. private browsing); ratings are best-effort.
    }
    this.ratingChangesSubject.next(itemId);
  }
}
