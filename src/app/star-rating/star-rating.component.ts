import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() interactive = true;
  @Output() rated = new EventEmitter<number>();

  readonly stars = [1, 2, 3, 4, 5];

  rate(value: number): void {
    if (!this.interactive) {
      return;
    }
    this.rating = value;
    this.rated.emit(value);
  }

  label(value: number): string {
    return `Rate ${value} star${value === 1 ? '' : 's'}`;
  }
}
