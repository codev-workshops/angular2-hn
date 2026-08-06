import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App analytics', () => {
    afterEach(() => {
        cleanup();
        window.ga = undefined;
        vi.restoreAllMocks();
    });

    it('does not throw during navigation when Google Analytics is unavailable', () => {
        window.ga = undefined;
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
        render(
            <MemoryRouter initialEntries={['/news/1']}>
                <App />
            </MemoryRouter>
        );

        expect(() => fireEvent.click(screen.getByRole('link', { name: 'show' }))).not.toThrow();
        scrollTo.mockRestore();
    });

    it('sends the page and pageview calls for completed navigation', async () => {
        const ga = vi.fn();
        window.ga = ga;
        vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
        render(
            <MemoryRouter initialEntries={['/news/1']}>
                <App />
            </MemoryRouter>
        );

        await waitFor(() => expect(ga).toHaveBeenCalledTimes(2));
        expect(ga).toHaveBeenNthCalledWith(1, 'set', 'page', '/news/1');
        expect(ga).toHaveBeenNthCalledWith(2, 'send', 'pageview');

        fireEvent.click(screen.getByRole('link', { name: 'show' }));
        await waitFor(() => expect(ga).toHaveBeenCalledTimes(4));
        expect(ga).toHaveBeenNthCalledWith(3, 'set', 'page', '/show/1');
        expect(ga).toHaveBeenNthCalledWith(4, 'send', 'pageview');
    });
});
