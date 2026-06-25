import { Injectable } from '@angular/core';

import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private readonly STORAGE_KEY = 'bookmarkedStories';

  getBookmarks(): Story[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  isBookmarked(storyId: number): boolean {
    return this.getBookmarks().some(story => story.id === storyId);
  }

  toggleBookmark(story: Story): boolean {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(s => s.id === story.id);

    if (index > -1) {
      bookmarks.splice(index, 1);
      this.saveBookmarks(bookmarks);
      return false;
    } else {
      bookmarks.unshift(story);
      this.saveBookmarks(bookmarks);
      return true;
    }
  }

  removeBookmark(storyId: number): void {
    const bookmarks = this.getBookmarks().filter(s => s.id !== storyId);
    this.saveBookmarks(bookmarks);
  }

  private saveBookmarks(bookmarks: Story[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
  }
}
