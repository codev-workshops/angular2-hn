import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MAX_RATING, RatingService } from '../../services/rating.service';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent implements OnInit, OnChanges, OnDestroy {
  @Input() itemId: number;

  readonly stars: number[] = Array.from({ length: MAX_RATING }, (_, i) => i + 1);
  rating = 0;
  hoveredStar = 0;

  private ratingChangesSubscription: Subscription;

  constructor(private ratingService: RatingService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadRating();
    // Keep sibling widgets for the same item (e.g. the hidden mobile/desktop copy) in sync.
    this.ratingChangesSubscription = this.ratingService.ratingChanges
      .pipe(filter(changedId => changedId === this.itemId))
      .subscribe(() => {
        this.loadRating();
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnChanges() {
    this.loadRating();
  }

  ngOnDestroy() {
    if (this.ratingChangesSubscription) {
      this.ratingChangesSubscription.unsubscribe();
    }
  }

  rate(star: number): void {
    if (star === this.rating) {
      this.ratingService.clearRating(this.itemId);
      this.hoveredStar = 0;
    } else {
      this.ratingService.setRating(this.itemId, star);
    }
    this.loadRating();
  }

  isFilled(star: number): boolean {
    return star <= (this.hoveredStar || this.rating);
  }

  private loadRating(): void {
    this.rating = this.itemId != null ? this.ratingService.getRating(this.itemId) : 0;
  }
}
