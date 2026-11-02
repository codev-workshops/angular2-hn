import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  settings: Settings;
  private settingsDialogRef: MatDialogRef<SettingsComponent>;

  constructor(private _settingsService: SettingsService, private dialog: MatDialog) {
    this.settings = this._settingsService.settings;
  }

  openSettings() {
    if (this.settingsDialogRef) {
      return;
    }
    this._settingsService.toggleSettings();
    this.settingsDialogRef = this.dialog.open(SettingsComponent, {
      panelClass: 'settings-dialog',
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: true,
      restoreFocus: true,
    });
    this.settingsDialogRef.afterClosed().subscribe(() => {
      this.settingsDialogRef = null;
      this._settingsService.toggleSettings();
    });
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
