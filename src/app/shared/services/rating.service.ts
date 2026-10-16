import { Injectable } from '@angular/core';

export const RATINGS_STORAGE_KEY = 'storyRatings';
export const MAX_RATING = 5;

export interface StoryRatings {
  [storyId: number]: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private ratings: StoryRatings;

  constructor() {
    this.ratings = this.loadRatings();
  }

  getRating(storyId: number): number {
    return this.ratings[storyId] || 0;
  }

  setRating(storyId: number, stars: number): void {
    const rating = Math.round(stars);
    if (!(rating >= 1)) {
      this.clearRating(storyId);
      return;
    }
    this.ratings[storyId] = Math.min(rating, MAX_RATING);
    this.persist();
  }

  clearRating(storyId: number): void {
    if (!(storyId in this.ratings)) {
      return;
    }
    delete this.ratings[storyId];
    this.persist();
  }

  private loadRatings(): StoryRatings {
    try {
      const parsed = JSON.parse(localStorage.getItem(RATINGS_STORAGE_KEY));
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(this.ratings));
    } catch {
      // Storage may be full or unavailable (e.g. private mode); keep the in-memory rating.
    }
  }
}
