import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';

interface FakeResponse {
  status?: number;
  body?: string;
  networkError?: boolean;
}

// The service uses `unfetch`, which is backed by XMLHttpRequest (not HttpClient),
// so requests are intercepted with a fake XHR instead of HttpTestingController.
class FakeXMLHttpRequest {
  static responses: { [url: string]: FakeResponse } = {};
  static requests: { method: string; url: string }[] = [];

  status = 0;
  statusText = '';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err: any) => void;
  private url: string;

  open(method: string, url: string) {
    this.url = url;
    FakeXMLHttpRequest.requests.push({ method, url });
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  send() {
    const res = FakeXMLHttpRequest.responses[this.url];
    if (!res || res.networkError) {
      this.onerror(new TypeError('Network request failed'));
      return;
    }
    this.status = res.status || 200;
    this.responseText = res.body;
    this.responseURL = this.url;
    this.onload();
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;

  function respond(url: string, body: any) {
    FakeXMLHttpRequest.responses[url] = { body: JSON.stringify(body) };
  }

  beforeEach(() => {
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    FakeXMLHttpRequest.responses = {};
    FakeXMLHttpRequest.requests = [];

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('should be created with the HN API base url', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('should be lazy and not request until subscribed', () => {
    service.fetchFeed('news', 1);
    expect(FakeXMLHttpRequest.requests.length).toBe(0);
  });

  describe('fetchFeed', () => {
    it('should GET /<feedType>?page=<page> and emit the stories then complete', fakeAsync(() => {
      const stories = [{ id: 1, title: 'a' }, { id: 2, title: 'b' }];
      respond(`${baseUrl}/newest?page=3`, stories);
      const next = jasmine.createSpy('next');
      const complete = jasmine.createSpy('complete');

      service.fetchFeed('newest', 3).subscribe(next, fail, complete);
      flushMicrotasks();

      expect(FakeXMLHttpRequest.requests).toEqual([{ method: 'get', url: `${baseUrl}/newest?page=3` }]);
      expect(next).toHaveBeenCalledWith(stories as any);
      expect(complete).toHaveBeenCalled();
    }));

    it('should error when the network request fails', fakeAsync(() => {
      FakeXMLHttpRequest.responses[`${baseUrl}/news?page=1`] = { networkError: true };
      const error = jasmine.createSpy('error');

      service.fetchFeed('news', 1).subscribe(fail, error);
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));

    it('should error when the response body is not valid JSON', fakeAsync(() => {
      FakeXMLHttpRequest.responses[`${baseUrl}/news?page=1`] = { body: '<html>oops</html>' };
      const error = jasmine.createSpy('error');

      service.fetchFeed('news', 1).subscribe(fail, error);
      flushMicrotasks();

      expect(error).toHaveBeenCalledWith(jasmine.any(SyntaxError));
    }));

    it('should not emit if unsubscribed before the response arrives', fakeAsync(() => {
      respond(`${baseUrl}/news?page=1`, []);
      const next = jasmine.createSpy('next');

      const sub = service.fetchFeed('news', 1).subscribe(next);
      sub.unsubscribe();
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
    }));
  });

  describe('fetchItemContent', () => {
    it('should GET /item/<id> and return non-poll stories untouched', fakeAsync(() => {
      const story = { id: 10, type: 'story', title: 'Hello', comments: [] };
      respond(`${baseUrl}/item/10`, story);
      let result: any;

      service.fetchItemContent(10).subscribe(s => (result = s));
      flushMicrotasks();

      expect(FakeXMLHttpRequest.requests.map(r => r.url)).toEqual([`${baseUrl}/item/10`]);
      expect(result).toEqual(story);
      expect(result.poll_votes_count).toBeUndefined();
    }));

    it('should fetch each poll option and aggregate vote counts for polls', fakeAsync(() => {
      respond(`${baseUrl}/item/100`, { id: 100, type: 'poll', poll: [{}, {}] });
      respond(`${baseUrl}/item/101`, { points: 7, content: 'yes' });
      respond(`${baseUrl}/item/102`, { points: 3, content: 'no' });
      let result: any;

      service.fetchItemContent(100).subscribe(s => (result = s));
      flushMicrotasks();

      expect(FakeXMLHttpRequest.requests.map(r => r.url)).toEqual([
        `${baseUrl}/item/100`,
        `${baseUrl}/item/101`,
        `${baseUrl}/item/102`,
      ]);
      expect(result.poll).toEqual([{ points: 7, content: 'yes' }, { points: 3, content: 'no' }]);
      expect(result.poll_votes_count).toBe(10);
    }));

    it('should set poll_votes_count to 0 for a poll without options', fakeAsync(() => {
      respond(`${baseUrl}/item/200`, { id: 200, type: 'poll', poll: [] });
      let result: any;

      service.fetchItemContent(200).subscribe(s => (result = s));
      flushMicrotasks();

      expect(result.poll_votes_count).toBe(0);
      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    }));

    it('should propagate request errors', fakeAsync(() => {
      const error = jasmine.createSpy('error');

      service.fetchItemContent(404).subscribe(fail, error);
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));
  });

  describe('fetchPollContent', () => {
    it('should GET /item/<id>', fakeAsync(() => {
      respond(`${baseUrl}/item/5`, { points: 1, content: 'opt' });
      let result: any;

      service.fetchPollContent(5).subscribe(r => (result = r));
      flushMicrotasks();

      expect(result).toEqual({ points: 1, content: 'opt' });
    }));
  });

  describe('fetchUser', () => {
    it('should GET /user/<id>', fakeAsync(() => {
      const user = { id: 'pg', karma: 155000, created: '13 years ago', about: 'hi' };
      respond(`${baseUrl}/user/pg`, user);
      let result: any;

      service.fetchUser('pg').subscribe(u => (result = u));
      flushMicrotasks();

      expect(FakeXMLHttpRequest.requests.map(r => r.url)).toEqual([`${baseUrl}/user/pg`]);
      expect(result).toEqual(user);
    }));

    it('should propagate request errors', fakeAsync(() => {
      FakeXMLHttpRequest.responses[`${baseUrl}/user/nobody`] = { networkError: true };
      const error = jasmine.createSpy('error');

      service.fetchUser('nobody').subscribe(fail, error);
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));
  });
});
