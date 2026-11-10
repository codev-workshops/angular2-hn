import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

class FakeXMLHttpRequest {
  static instances: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  async: boolean;
  body: unknown;
  sent = false;
  status = 0;
  statusText = '';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  requestHeaders: { [name: string]: string } = {};
  onload: () => void;
  onerror: (error: unknown) => void;

  constructor() {
    FakeXMLHttpRequest.instances.push(this);
  }

  static forUrl(url: string): FakeXMLHttpRequest {
    const matches = FakeXMLHttpRequest.instances.filter(xhr => xhr.url === url);
    expect(matches.length).toBe(1, `expected exactly one request to ${url}`);
    return matches[0];
  }

  open(method: string, url: string, async: boolean) {
    this.method = method;
    this.url = url;
    this.async = async;
  }

  setRequestHeader(name: string, value: string) {
    this.requestHeaders[name] = value;
  }

  send(body: unknown) {
    this.sent = true;
    this.body = body;
  }

  getAllResponseHeaders(): string {
    return 'content-type: application/json; charset=utf-8';
  }

  respond(status: number, body: unknown, statusText = 'OK') {
    this.status = status;
    this.statusText = statusText;
    this.responseText = typeof body === 'string' ? body : JSON.stringify(body);
    this.responseURL = this.url;
    this.onload();
  }

  fail(error: unknown) {
    this.onerror(error);
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;
  let subscription: Subscription;

  beforeEach(() => {
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    FakeXMLHttpRequest.instances = [];

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = undefined;
    }
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('targets the node-hnapi base url', () => {
    expect(service.baseUrl).toBe(BASE_URL);
  });

  describe('fetchFeed', () => {
    it('is lazy: no request is made until subscribed', () => {
      service.fetchFeed('news', 1);
      expect(FakeXMLHttpRequest.instances.length).toBe(0);
    });

    it('GETs the feed page asynchronously and emits the parsed stories then completes', fakeAsync(() => {
      const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }] as Story[];
      const next = jasmine.createSpy('next');
      const error = jasmine.createSpy('error');
      const complete = jasmine.createSpy('complete');

      subscription = service.fetchFeed('newest', 3).subscribe(next, error, complete);

      expect(FakeXMLHttpRequest.instances.length).toBe(1);
      const xhr = FakeXMLHttpRequest.instances[0];
      expect(xhr.method).toBe('get');
      expect(xhr.url).toBe(`${BASE_URL}/newest?page=3`);
      expect(xhr.async).toBe(true);
      expect(xhr.withCredentials).toBe(false);
      expect(xhr.sent).toBe(true);
      expect(xhr.body).toBeNull();
      expect(next).not.toHaveBeenCalled();

      xhr.respond(200, stories);
      flushMicrotasks();

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(stories);
      expect(complete).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
    }));

    it('issues a fresh request for every subscription (cold observable)', fakeAsync(() => {
      const feed$ = service.fetchFeed('show', 1);
      const first = feed$.subscribe();
      const second = feed$.subscribe();

      expect(FakeXMLHttpRequest.instances.length).toBe(2);
      expect(FakeXMLHttpRequest.instances.map(xhr => xhr.url))
        .toEqual([`${BASE_URL}/show?page=1`, `${BASE_URL}/show?page=1`]);

      first.unsubscribe();
      second.unsubscribe();
    }));
  });

  describe('fetchUser', () => {
    it('GETs /user/:id and emits the user', fakeAsync(() => {
      const user = { id: 'pg', karma: 155111, created: '12 years ago', about: 'Bio' } as User;
      let received: User;

      subscription = service.fetchUser('pg').subscribe(data => received = data);
      FakeXMLHttpRequest.forUrl(`${BASE_URL}/user/pg`).respond(200, user);
      flushMicrotasks();

      expect(received).toEqual(user);
    }));
  });

  describe('fetchPollContent', () => {
    it('GETs /item/:id and emits the poll option', fakeAsync(() => {
      const option = { points: 42, content: 'Yes' } as PollResult;
      let received: PollResult;

      subscription = service.fetchPollContent(77).subscribe(data => received = data);
      FakeXMLHttpRequest.forUrl(`${BASE_URL}/item/77`).respond(200, option);
      flushMicrotasks();

      expect(received).toEqual(option);
    }));
  });

  describe('fetchItemContent', () => {
    it('emits a non-poll story untouched without fetching poll options', fakeAsync(() => {
      const story = { id: 10, type: 'story', title: 'A story', comments: [] } as Story;
      let received: Story;

      subscription = service.fetchItemContent(10).subscribe(data => received = data);
      FakeXMLHttpRequest.forUrl(`${BASE_URL}/item/10`).respond(200, story);
      flushMicrotasks();

      expect(received).toEqual(story);
      expect(received.poll_votes_count).toBeUndefined();
      expect(FakeXMLHttpRequest.instances.length).toBe(1);
    }));

    it('fetches each poll option by sequential id and aggregates the vote count', fakeAsync(() => {
      const poll = {
        id: 100,
        type: 'poll',
        title: 'Which editor?',
        poll: [{ points: 0, content: '' }, { points: 0, content: '' }, { points: 0, content: '' }]
      } as Story;
      let received: Story;

      subscription = service.fetchItemContent(100).subscribe(data => received = data);
      FakeXMLHttpRequest.forUrl(`${BASE_URL}/item/100`).respond(200, poll);
      flushMicrotasks();

      expect(received.id).toBe(100);
      expect(received.poll_votes_count).toBe(0);
      expect(FakeXMLHttpRequest.instances.slice(1).map(xhr => xhr.url)).toEqual([
        `${BASE_URL}/item/101`,
        `${BASE_URL}/item/102`,
        `${BASE_URL}/item/103`
      ]);

      // respond out of order to prove each result lands in its own slot
      FakeXMLHttpRequest.forUrl(`${BASE_URL}/item/103`).respond(200, { points: 5, content: 'Emacs' });
      flushMicrotasks();
      expect(received.poll[2]).toEqual({ points: 5, content: 'Emacs' });
      expect(received.poll_votes_count).toBe(5);

      FakeXMLHttpRequest.forUrl(`${BASE_URL}/item/101`).respond(200, { points: 30, content: 'Vim' });
      FakeXMLHttpRequest.forUrl(`${BASE_URL}/item/102`).respond(200, { points: 12, content: 'VS Code' });
      flushMicrotasks();

      expect(received.poll).toEqual([
        { points: 30, content: 'Vim' },
        { points: 12, content: 'VS Code' },
        { points: 5, content: 'Emacs' }
      ]);
      expect(received.poll_votes_count).toBe(47);
    }));
  });

  describe('error handling', () => {
    it('errors (and does not emit) when the request fails at the network level', fakeAsync(() => {
      const networkError = new Error('offline');
      const next = jasmine.createSpy('next');
      const error = jasmine.createSpy('error');

      subscription = service.fetchUser('pg').subscribe(next, error);
      FakeXMLHttpRequest.instances[0].fail(networkError);
      flushMicrotasks();

      expect(error).toHaveBeenCalledWith(networkError);
      expect(next).not.toHaveBeenCalled();
    }));

    it('errors with a SyntaxError when the body is not valid JSON', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      const error = jasmine.createSpy('error');

      subscription = service.fetchFeed('news', 1).subscribe(next, error);
      FakeXMLHttpRequest.instances[0].respond(200, '<html>Bad gateway</html>');
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error.calls.mostRecent().args[0] instanceof SyntaxError).toBe(true);
    }));

    it('emits the JSON body of a non-2xx response as data (status is not checked)', fakeAsync(() => {
      const body = { error: 'not found' };
      const next = jasmine.createSpy('next');
      const error = jasmine.createSpy('error');

      subscription = service.fetchUser('ghost').subscribe(next, error);
      FakeXMLHttpRequest.instances[0].respond(404, body, 'Not Found');
      flushMicrotasks();

      expect(next).toHaveBeenCalledWith(body);
      expect(error).not.toHaveBeenCalled();
    }));
  });

  describe('cancellation', () => {
    it('does not emit or complete if unsubscribed before the response arrives', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      const error = jasmine.createSpy('error');
      const complete = jasmine.createSpy('complete');

      const sub = service.fetchUser('pg').subscribe(next, error, complete);
      sub.unsubscribe();
      FakeXMLHttpRequest.instances[0].respond(200, { id: 'pg' });
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
      expect(complete).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    }));
  });
});
