import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

class FakeRequest {
  static requests: FakeRequest[];
  responseText: string;
  status = 200;
  statusText = 'OK';
  onload: () => void;
  onerror: () => void;
  url: string;
  open(method: string, url: string) { this.url = url; }
  send() { FakeRequest.requests.push(this); }
  getAllResponseHeaders() { return ''; }
  respond(data: unknown) {
    this.responseText = JSON.stringify(data);
    this.onload();
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  beforeEach(() => {
    FakeRequest.requests = [];
    spyOn(window, 'XMLHttpRequest').and.callFake(() => new FakeRequest() as unknown as XMLHttpRequest);
    service = new HackerNewsAPIService();
  });

  it('loads feeds including empty results and completes', fakeAsync(() => {
    const next = jasmine.createSpy('next');
    const complete = jasmine.createSpy('complete');
    service.fetchFeed('news', 2).subscribe({ next, complete });
    expect(FakeRequest.requests[0].url).toBe(service.baseUrl + '/news?page=2');
    FakeRequest.requests[0].respond([]);
    flushMicrotasks();
    expect(next).toHaveBeenCalledWith([]);
    expect(complete).toHaveBeenCalled();
  }));

  it('loads users and ordinary stories', fakeAsync(() => {
    const user = jasmine.createSpy('user');
    const item = jasmine.createSpy('item');
    service.fetchUser('alice').subscribe(user);
    service.fetchItemContent(12).subscribe(item);
    expect(FakeRequest.requests[0].url).toBe(service.baseUrl + '/user/alice');
    expect(FakeRequest.requests[1].url).toBe(service.baseUrl + '/item/12');
    FakeRequest.requests[0].respond({ id: 'alice' });
    FakeRequest.requests[1].respond({ id: 12, type: 'story' });
    flushMicrotasks();
    expect(user).toHaveBeenCalledWith({ id: 'alice' });
    expect(item).toHaveBeenCalledWith({ id: 12, type: 'story' });
  }));

  it('populates poll choices and sums votes', fakeAsync(() => {
    let result: Story;
    service.fetchItemContent(10).subscribe(value => result = value);
    FakeRequest.requests[0].respond({ id: 10, type: 'poll', poll: [{}, {}] });
    flushMicrotasks();
    expect(FakeRequest.requests[1].url).toBe(service.baseUrl + '/item/11');
    expect(FakeRequest.requests[2].url).toBe(service.baseUrl + '/item/12');
    FakeRequest.requests[1].respond({ content: 'A', points: 3 });
    FakeRequest.requests[2].respond({ content: 'B', points: 5 });
    flushMicrotasks();
    expect(result.poll_votes_count).toBe(8);
    expect(result.poll.map(choice => choice.content)).toEqual(['A', 'B']);
  }));

  it('handles polls with no choices', fakeAsync(() => {
    let result: Story;
    service.fetchItemContent(10).subscribe(value => result = value);
    FakeRequest.requests[0].respond({ id: 10, type: 'poll', poll: [] });
    flushMicrotasks();
    expect(result.poll_votes_count).toBe(0);
    expect(FakeRequest.requests.length).toBe(1);
  }));

  it('reports request failures', fakeAsync(() => {
    const error = jasmine.createSpy('error');
    service.fetchUser('missing').subscribe({ error });
    FakeRequest.requests[0].onerror();
    flushMicrotasks();
    expect(error).toHaveBeenCalled();
  }));

  it('does not emit after cancellation', fakeAsync(() => {
    const next = jasmine.createSpy('next');
    const subscription = service.fetchFeed('jobs', 1).subscribe(next);
    subscription.unsubscribe();
    FakeRequest.requests[0].respond([]);
    flushMicrotasks();
    expect(next).not.toHaveBeenCalled();
  }));
});
