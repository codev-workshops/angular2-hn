import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RatingsService {
  private readonly storageKey = 'itemRatings';
  private ratings: { [id: string]: number } = Object.create(null);

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey));
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        Object.keys(saved).forEach(id => {
          if (this.isRating(saved[id])) {
            this.ratings[id] = saved[id];
          }
        });
      }
    } catch (_) {}
  }

  getRating(id: number | string): number {
    return this.ratings[id] || 0;
  }

  setRating(id: number | string, value: number): void {
    if (value === 0) {
      delete this.ratings[id];
    } else if (this.isRating(value)) {
      this.ratings[id] = value;
    } else {
      return;
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.ratings));
    } catch (_) {}
  }

  private isRating(value: number): boolean {
    return Number.isInteger(value) && value >= 1 && value <= 5;
  }
}
