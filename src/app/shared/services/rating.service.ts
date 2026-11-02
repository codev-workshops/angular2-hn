import { Injectable } from '@angular/core';

export const MIN_RATING = 1;
export const MAX_RATING = 5;

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private static storageKey(itemId: number): string {
    return `hn-rating-${itemId}`;
  }

  getRating(itemId: number): number {
    try {
      const raw = sessionStorage.getItem(RatingService.storageKey(itemId));
      const value = raw ? JSON.parse(raw) : 0;
      return Number.isInteger(value) && value >= MIN_RATING && value <= MAX_RATING ? value : 0;
    } catch {
      return 0;
    }
  }

  setRating(itemId: number, stars: number): void {
    if (!Number.isInteger(stars) || stars < MIN_RATING || stars > MAX_RATING) {
      return;
    }
    try {
      sessionStorage.setItem(RatingService.storageKey(itemId), JSON.stringify(stars));
    } catch {
      // sessionStorage unavailable (e.g. private mode quota); rating stays in-memory only.
    }
  }
}
