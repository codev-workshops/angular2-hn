import { Component, Input } from '@angular/core';
import { Story } from '../../models/story';

@Component({
  selector: 'app-story-list',
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss']
})
export class StoryListComponent {
  @Input() stories: Story[] = [];
  @Input() listStart = 1;
  @Input() emptyMessage = 'No stories to show.';
}
