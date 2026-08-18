import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  @ViewChildren('feedRow') rows: QueryList<ElementRef>;
  typeSub: Subscription;
  pageSub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  selectedIndex = -1;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private router: Router
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
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
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
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.items || !this.items.length || this.isTyping(event.target)) {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
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
        if (this.selectedIndex < 0) {
          return;
        }
        this.openSelected();
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  private isTyping(target: EventTarget): boolean {
    const element = target as HTMLElement;
    if (!element || !element.tagName) {
      return false;
    }
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || element.isContentEditable;
  }

  private moveSelection(offset: number) {
    const next = this.selectedIndex < 0 ? (offset > 0 ? 0 : this.items.length - 1) : this.selectedIndex + offset;
    this.selectedIndex = Math.min(Math.max(next, 0), this.items.length - 1);
    this.scrollSelectionIntoView();
  }

  private scrollSelectionIntoView() {
    if (!this.rows) {
      return;
    }
    const row = this.rows.toArray()[this.selectedIndex];
    if (row) {
      row.nativeElement.scrollIntoView({ block: 'nearest' });
    }
  }

  private openSelected() {
    const item = this.items[this.selectedIndex];
    if (item.url && item.url.indexOf('http') === 0) {
      if (this.settingsService.settings.openLinkInNewTab) {
        window.open(item.url, '_blank', 'noopener');
      } else {
        window.location.href = item.url;
      }
    } else {
      this.router.navigate(['/item', item.id]);
    }
  }
}
