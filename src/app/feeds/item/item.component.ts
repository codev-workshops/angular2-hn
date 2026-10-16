import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { RatingService } from '../../shared/services/rating.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;

  constructor(private _settingsService: SettingsService, private _ratingService: RatingService) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  get rating(): number {
    return this._ratingService.getRating(this.item.id);
  }

  onRatingChange(stars: number): void {
    if (stars > 0) {
      this._ratingService.setRating(this.item.id, stars);
    } else {
      this._ratingService.clearRating(this.item.id);
    }
  }

}
