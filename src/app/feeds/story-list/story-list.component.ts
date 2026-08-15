import { Component, Input } from '@angular/core';

import { RankedStory } from '../../shared/models/ranked-story';

@Component({
  selector: 'app-story-list',
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss']
})
export class StoryListComponent {
  @Input() items: RankedStory[] = [];
  @Input() listMargin = false;
}
