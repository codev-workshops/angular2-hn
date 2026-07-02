import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import fetch from 'unfetch';
import { switchMap, map } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return lazyFetch(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return lazyFetch<Story>(`${this.baseUrl}/item/${id}`).pipe(
      switchMap((story: Story) => {
        if (story.type === 'poll' && story.poll && story.poll.length > 0) {
          const pollRequests = story.poll.map((_, i) =>
            this.fetchPollContent(story.id + i + 1)
          );
          return forkJoin(pollRequests).pipe(
            map((pollResults: PollResult[]) => {
              story.poll = pollResults;
              story.poll_votes_count = pollResults.reduce((sum, r) => sum + r.points, 0);
              return story;
            })
          );
        }
        return of(story);
      })
    );
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return lazyFetch(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return lazyFetch(`${this.baseUrl}/user/${id}`);
  }
}

function lazyFetch<T>(url, options?) {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}

