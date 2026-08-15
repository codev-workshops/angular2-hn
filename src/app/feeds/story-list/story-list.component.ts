import { Component, Input } from '@angular/core';

import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-story-list',
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss']
})
export class StoryListComponent {
  @Input() items: Story[] = [];
  @Input() listStart = 1;
  @Input() listMargin = false;
}
