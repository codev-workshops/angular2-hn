import { Component, OnInit } from '@angular/core';
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

export class FeedComponent implements OnInit {
  typeSub: Subscription;
  pageSub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  authorFilter = '';
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute
  ) { }

  get visibleItems(): Story[] {
    const author = this.authorFilter.trim().toLowerCase();

    if (!author || !this.items) {
      return this.items;
    }

    return this.items.filter(item => item.user && item.user.toLowerCase().indexOf(author) !== -1);
  }

  get showAuthorFilter(): boolean {
    return this.feedType !== 'jobs' && !!this.items && this.items.length > 0;
  }

  get listMargin(): boolean {
    return this.feedType !== 'jobs' && !this.showAuthorFilter;
  }

  clearAuthorFilter() {
    this.authorFilter = '';
  }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
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
}
