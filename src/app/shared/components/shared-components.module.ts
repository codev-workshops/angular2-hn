import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { ItemComponent } from './item/item.component';
import { StoryListComponent } from './story-list/story-list.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [CommonModule, RouterModule, PipesModule],
  declarations: [ LoaderComponent, ErrorMessageComponent, ItemComponent, StoryListComponent ],
  exports: [ LoaderComponent, ErrorMessageComponent, ItemComponent, StoryListComponent ]
})
export class SharedComponentsModule {}
