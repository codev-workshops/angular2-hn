import { Component, OnInit } from '@angular/core';

import { BookmarkService } from '../shared/services/bookmark.service';
import { Story } from '../shared/models/story';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit {
  bookmarks: Story[];

  constructor(private _bookmarkService: BookmarkService) {}

  ngOnInit() {
    this.loadBookmarks();
  }

  loadBookmarks(): void {
    this.bookmarks = this._bookmarkService.getBookmarks();
  }

  removeBookmark(storyId: number): void {
    this._bookmarkService.removeBookmark(storyId);
    this.loadBookmarks();
  }
}
