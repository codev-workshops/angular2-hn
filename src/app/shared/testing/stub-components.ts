import { Component, Input } from '@angular/core';
import { Comment } from '../models/comment';
import { Story } from '../models/story';

@Component({ selector: 'app-loader', template: '' })
export class StubLoaderComponent {}

@Component({ selector: 'app-error-message', template: '' })
export class StubErrorMessageComponent {
  @Input() message: string;
}

// tslint:disable-next-line:component-selector
@Component({ selector: 'item', template: '' })
export class StubItemComponent {
  @Input() item: Story;
}

@Component({ selector: 'app-comment', template: '' })
export class StubCommentComponent {
  @Input() comment: Comment;
}

@Component({ selector: 'app-settings', template: '' })
export class StubSettingsComponent {}

@Component({ selector: 'app-header', template: '' })
export class StubHeaderComponent {}

@Component({ selector: 'app-footer', template: '' })
export class StubFooterComponent {}

export const STUB_COMPONENTS = [
  StubLoaderComponent,
  StubErrorMessageComponent,
  StubItemComponent,
  StubCommentComponent,
  StubSettingsComponent,
  StubHeaderComponent,
  StubFooterComponent
];
