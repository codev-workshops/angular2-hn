import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { BookmarkService } from '../../shared/services/bookmark.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;
  isBookmarked: boolean;

  constructor(
    private _settingsService: SettingsService,
    private _bookmarkService: BookmarkService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
    this.isBookmarked = this._bookmarkService.isBookmarked(this.item.id);
  }

  toggleBookmark(): void {
    this.isBookmarked = this._bookmarkService.toggleBookmark(this.item);
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }
}
