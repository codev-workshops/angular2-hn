import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;

  constructor(private _settingsService: SettingsService) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  /** Domain of the story's external link, without any `www.` prefix. */
  get domain(): string {
    const domain = this.item.domain || this.extractDomain(this.item.url);
    return domain.replace(/^www\./, '');
  }

  private extractDomain(url: string): string {
    const match = /^https?:\/\/([^\/?#]+)/.exec(url || '');
    return match ? match[1] : '';
  }

}
