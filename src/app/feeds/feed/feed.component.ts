import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit {
  typeSub: Subscription;
  pageSub: Subscription;
  authorSub: Subscription;
  items: Story[];
  filteredItems: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';
  authorFilter = '';
  filterQueryParams: { author?: string } = {};

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

    this.authorSub = this.route.queryParams.subscribe(params => {
      this.setAuthorFilter(params.author || '');
    });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => {
            this.items = items;
            this.applyAuthorFilter();
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });
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

  private setAuthorFilter(author: string) {
    this.authorFilter = author;
    this.filterQueryParams = author ? { author } : {};
    this.applyAuthorFilter();
  }

  private applyAuthorFilter() {
    const author = this.authorFilter.trim().toLowerCase();

    if (!author || !this.items) {
      this.filteredItems = this.items;
      return;
    }

    this.filteredItems = this.items.filter(item => (item.user || '').toLowerCase().indexOf(author) !== -1);
  }
}
