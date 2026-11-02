import { Component, Input, OnChanges } from '@angular/core';
import { RatingsService } from '../../services/ratings.service';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnChanges {
  @Input() itemId: number | string;
  @Input() max = 5;
  stars: number[] = [];
  preview = 0;

  constructor(private ratings: RatingsService) {}

  ngOnChanges(): void {
    const count = Number.isFinite(this.max) ? Math.max(0, Math.min(5, Math.floor(this.max))) : 5;
    this.stars = Array.from({ length: count }, (_, index) => index + 1);
    this.preview = 0;
  }

  get rating(): number {
    return this.ratings.getRating(this.itemId);
  }

  rate(event: Event, value: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.ratings.setRating(this.itemId, this.rating === value ? 0 : value);
    this.preview = 0;
  }
}
