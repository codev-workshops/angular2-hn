import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { StarRatingComponent } from './star-rating/star-rating.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ LoaderComponent, ErrorMessageComponent, StarRatingComponent ],
  exports: [ LoaderComponent, ErrorMessageComponent, StarRatingComponent ]
})
export class SharedComponentsModule {}
