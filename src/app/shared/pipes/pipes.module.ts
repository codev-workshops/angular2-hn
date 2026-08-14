import { NgModule } from '@angular/core';
import { CommentPipe } from './comment.pipe';
import { TimeAgoPipe } from './time-ago.pipe';

@NgModule({
  declarations: [CommentPipe, TimeAgoPipe],
  exports: [CommentPipe, TimeAgoPipe]
})
export class PipesModule {}
