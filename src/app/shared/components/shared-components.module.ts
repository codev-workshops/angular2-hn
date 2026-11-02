import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { SubHeaderComponent } from './sub-header/sub-header.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatIconModule],
  declarations: [ LoaderComponent, ErrorMessageComponent, SubHeaderComponent ],
  exports: [ LoaderComponent, ErrorMessageComponent, SubHeaderComponent ]
})
export class SharedComponentsModule {}
