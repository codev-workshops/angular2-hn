import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { SettingsComponent } from './settings/settings.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [CommonModule, RouterModule, MaterialModule],
  declarations: [HeaderComponent, FooterComponent, SettingsComponent],
  entryComponents: [SettingsComponent],
  exports: [HeaderComponent, FooterComponent]
})
export class CoreModule { }
