import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  typeSub: Subscription;
  pageSub: Subscription;
  querySub: Subscription;
  feedSub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  authorFilter = '';
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.querySub = this.route.queryParams.subscribe(params => {
      this.authorFilter = params['author'] || '';
    });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
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
    [this.typeSub, this.pageSub, this.querySub, this.feedSub].forEach(sub => {
      if (sub) {
        sub.unsubscribe();
      }
    });
  }

  get filteredItems(): Story[] {
    if (!this.items) {
      return [];
    }

    const author = this.filterableFeed ? this.authorFilter.trim().toLowerCase() : '';

    if (!author) {
      return this.items;
    }

    return this.items.filter(item => (item.user || '').toLowerCase().indexOf(author) !== -1);
  }

  get filterableFeed(): boolean {
    return this.feedType !== 'jobs';
  }

  get emptyMessage(): string {
    return this.filterableFeed && this.authorFilter.trim()
      ? 'No stories by an author matching "' + this.authorFilter.trim() + '" on this page.'
      : 'No stories to show.';
  }

  onAuthorFilterChange(author: string) {
    this.authorFilter = author;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { author: author.trim() ? author.trim() : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  clearAuthorFilter() {
    this.onAuthorFilterChange('');
  }
}
