import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() readonly = false;
  @Output() ratingChange = new EventEmitter<number>();

  readonly stars = [1, 2, 3, 4, 5];

  rate(stars: number): void {
    if (this.readonly) {
      return;
    }
    this.ratingChange.emit(stars === this.rating ? 0 : stars);
  }
}
