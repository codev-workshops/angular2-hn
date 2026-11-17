import { ROUTES, Route } from '@angular/router';
import { ValueProvider } from '@angular/core';
import { routing } from './app.routes';

describe('Application routes', () => {
  it('loads both lazy feature modules', async () => {
    const flatten = (entries: unknown[]): ValueProvider[] => entries.reduce<ValueProvider[]>((result, entry) =>
      result.concat(Array.isArray(entry) ? flatten(entry) : entry as ValueProvider), []);
    const provider = flatten(routing.providers).find(entry => entry.provide === ROUTES);
    const routes: Route[] = [].concat(...provider.useValue);
    const item = routes.find(route => route.path === 'item');
    const user = routes.find(route => route.path === 'user');
    expect(await (item.loadChildren as () => Promise<unknown>)()).toBeTruthy();
    expect(await (user.loadChildren as () => Promise<unknown>)()).toBeTruthy();
    expect(routes.find(route => route.path === '').redirectTo).toBe('news/1');
    expect(routes.filter(route => route.children).length).toBe(5);
  });
});
