import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  sub = new Subscription();
  user: User;
  errorMessage = '';

  constructor(
    private hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.sub.add(this.route.params.subscribe(params => {
      const userID = params.id;
      const request = this.hackerNewsAPIService.fetchUser(userID).subscribe(data => {
        this.user = data;
      }, error => this.errorMessage = 'Could not load user ' + userID + '.');
      this.sub.add(request);
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.location.back();
  }
}
