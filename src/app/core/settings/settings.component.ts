import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  settings: Settings;
  themes = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
  ];

  constructor(
    private _settingsService: SettingsService,
    private dialogRef: MatDialogRef<SettingsComponent>
  ) {
    this.settings = this._settingsService.settings;
  }

  closeSettings() {
    this.dialogRef.close();
  }

  toggleOpenLinksInNewTab() {
    this._settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme: string) {
    this._settingsService.setTheme(theme);
  }

  changeTitleFont(val: string) {
    if (val !== '' && +val >= 1) {
      this._settingsService.setFont(val);
    }
  }

  changeSpacing(val: string) {
    if (val !== '' && +val >= 0) {
      this._settingsService.setSpacing(val);
    }
  }
}
