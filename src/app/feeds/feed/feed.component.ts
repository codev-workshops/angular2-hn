import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { RankedStory } from '../../shared/models/ranked-story';
import { Story } from '../../shared/models/story';

const ITEMS_PER_PAGE = 30;

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  items: Story[];
  filteredItems: RankedStory[] = [];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';
  authorFilter = '';
  filterQueryParams: { author?: string } = {};
  private destroyed = new Subject<void>();

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.data
      .pipe(takeUntil(this.destroyed))
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.route.queryParams
      .pipe(takeUntil(this.destroyed))
      .subscribe(params => this.setAuthorFilter(this.readAuthorParam(params)));

    this.route.params
      .pipe(takeUntil(this.destroyed))
      .subscribe(params => {
        this.pageNum = params.page ? +params.page : 1;
        this.listStart = ((this.pageNum - 1) * ITEMS_PER_PAGE) + 1;
        this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
          .pipe(takeUntil(this.destroyed))
          .subscribe(
            items => {
              this.items = items;
              this.applyAuthorFilter();
            },
            error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
            () => window.scrollTo(0, 0)
          );
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  get canFilterByAuthor(): boolean {
    return this.feedType !== 'jobs';
  }

  onAuthorFilterChange(author: string) {
    this.setAuthorFilter(author);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filterQueryParams,
      replaceUrl: true
    });
  }

  private readAuthorParam(params: Params): string {
    const author = params.author;

    if (Array.isArray(author)) {
      return author[author.length - 1] || '';
    }

    return author || '';
  }

  private setAuthorFilter(author: string) {
    this.authorFilter = author;
    this.filterQueryParams = author && this.canFilterByAuthor ? { author } : {};
    this.applyAuthorFilter();
  }

  private applyAuthorFilter() {
    if (!this.items) {
      this.filteredItems = [];
      return;
    }

    const author = this.canFilterByAuthor ? this.authorFilter.trim().toLowerCase() : '';
    const ranked = this.items.map((story, index) => ({ story, rank: this.listStart + index }));

    if (!author) {
      this.filteredItems = ranked;
      return;
    }

    this.filteredItems = ranked.filter(entry => (entry.story.user || '').toLowerCase().indexOf(author) !== -1);
  }
}
