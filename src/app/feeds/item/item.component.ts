import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { RatingService } from '../../shared/services/rating.service';

const RATED_FEEDS = ['news', 'newest', 'show', 'ask'];

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  @Input() feedType: string;
  settings: Settings;
  rating = 0;

  constructor(private _settingsService: SettingsService, private _ratingService: RatingService) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
    this.rating = this._ratingService.getRating(this.item.id);
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  get showRating(): boolean {
    return RATED_FEEDS.indexOf(this.feedType) !== -1 && this.item.type !== 'job';
  }

  onRated(stars: number): void {
    this.rating = stars;
    this._ratingService.setRating(this.item.id, stars);
  }

}
