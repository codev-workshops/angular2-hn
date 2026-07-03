import { NgModule } from '@angular/core';
import { CommentPipe } from './comment.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
  declarations: [CommentPipe, SafeHtmlPipe],
  exports: [CommentPipe, SafeHtmlPipe]
})
export class PipesModule {}
