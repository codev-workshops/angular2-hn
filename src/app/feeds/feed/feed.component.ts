import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  @ViewChildren('storyRow') storyRows: QueryList<ElementRef>;
  typeSub: Subscription;
  pageSub: Subscription;
  feedSub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  selectedIndex = -1;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
        this.selectedIndex = -1;
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this.selectedIndex = -1;
      if (this.feedSub) {
        this.feedSub.unsubscribe();
      }
      this.feedSub = this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => this.items = items,
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });
  }

  ngOnDestroy() {
    if (this.typeSub) {
      this.typeSub.unsubscribe();
    }
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
    if (this.feedSub) {
      this.feedSub.unsubscribe();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.items || this.items.length === 0) {
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    if (this.isEditableTarget(event.target)) {
      return;
    }

    switch (event.key) {
      case 'j':
        this.moveSelection(1);
        break;
      case 'k':
        this.moveSelection(-1);
        break;
      case 'Enter':
        if (!this.openSelected()) {
          return;
        }
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  private isEditableTarget(target: EventTarget): boolean {
    const element = target as HTMLElement;
    if (!element || !element.tagName) {
      return false;
    }
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select' ||
      element.isContentEditable === true;
  }

  private moveSelection(delta: number) {
    const lastIndex = this.items.length - 1;
    const nextIndex = this.selectedIndex === -1 ?
      (delta > 0 ? 0 : lastIndex) :
      Math.min(lastIndex, Math.max(0, this.selectedIndex + delta));
    this.selectedIndex = nextIndex;
    this.scrollSelectedIntoView();
  }

  private scrollSelectedIntoView() {
    const row = this.selectedRow();
    if (row && row.scrollIntoView) {
      row.scrollIntoView({ block: 'nearest' });
    }
  }

  private openSelected(): boolean {
    const row = this.selectedRow();
    if (!row) {
      return false;
    }
    const link = row.querySelector('a.title') as HTMLElement;
    if (!link) {
      return false;
    }
    link.click();
    return true;
  }

  private selectedRow(): HTMLElement {
    if (!this.storyRows || this.selectedIndex < 0) {
      return null;
    }
    const rows = this.storyRows.toArray();
    return rows[this.selectedIndex] ? rows[this.selectedIndex].nativeElement : null;
  }
}
