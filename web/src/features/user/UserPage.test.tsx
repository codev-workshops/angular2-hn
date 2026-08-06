import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchUser } from '../../lib/api';
import { UserPage } from './UserPage';

vi.mock('../../lib/api', () => ({
    fetchUser: vi.fn(),
}));

const mockedFetchUser = vi.mocked(fetchUser);

function renderUser(path = '/user/alice') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/user/:id" element={<UserPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('UserPage', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        mockedFetchUser.mockReset();
    });

    it('renders a full profile with sanitized about HTML', async () => {
        mockedFetchUser.mockResolvedValue({
            id: 'alice',
            karma: 1234,
            created: 'Nov 14, 2023',
            about: '<strong>Hello</strong><script>alert(1)</script><a href="https://example.com">site</a>',
        });

        renderUser();

        expect(await screen.findByText('Profile: alice')).toBeInTheDocument();
        expect(screen.getByText('Hello', { selector: '.other-details strong' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute('href', 'https://example.com');
        expect(document.querySelector('.other-details script')).not.toBeInTheDocument();
    });

    it('omits other details when about is absent', async () => {
        mockedFetchUser.mockResolvedValue({ id: 'quiet', karma: 1, created: 'today' });

        renderUser('/user/quiet');

        await screen.findByText('Profile: quiet');
        expect(document.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('shows the loader while loading', () => {
        mockedFetchUser.mockReturnValue(new Promise(() => undefined));

        renderUser();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows the exact error message when loading fails', async () => {
        mockedFetchUser.mockRejectedValue(new Error('offline'));

        renderUser('/user/missing-user');

        expect(await screen.findByText('Could not load user missing-user.')).toBeInTheDocument();
    });

    it('keeps loading for a null response', async () => {
        mockedFetchUser.mockResolvedValue(null);

        renderUser();

        await waitFor(() => expect(mockedFetchUser).toHaveBeenCalledWith('alice'));
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(document.querySelector('.profile')).not.toBeInTheDocument();
    });

    it.each([['text'], [['array']]])('renders malformed non-object response without throwing: %s', async (response) => {
        mockedFetchUser.mockResolvedValue(response as never);

        renderUser();

        expect(await screen.findByText('Profile:', { selector: '.title-block', exact: false })).toBeInTheDocument();
        expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('navigates back when the back button is clicked', async () => {
        mockedFetchUser.mockResolvedValue({ id: 'alice' });

        render(
            <MemoryRouter initialEntries={['/previous', '/user/alice']} initialIndex={1}>
                <Routes>
                    <Route path="/previous" element={<div>Previous</div>} />
                    <Route path="/user/:id" element={<UserPage />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByText('Profile: alice');
        fireEvent.click(document.querySelector('.back-button') as HTMLElement);
        expect(await screen.findByText('Previous')).toBeInTheDocument();
    });

    it('re-fetches when the route parameter changes', async () => {
        mockedFetchUser.mockImplementation(async (id) => ({ id }));
        function ChangeRoute() {
            const navigate = useNavigate();
            return <button onClick={() => navigate('/user/bob')}>Change user</button>;
        }

        render(
            <MemoryRouter initialEntries={['/user/alice']}>
                <Routes>
                    <Route
                        path="/user/:id"
                        element={
                            <>
                                <ChangeRoute />
                                <UserPage />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByText('Profile: alice');
        fireEvent.click(screen.getByRole('button', { name: 'Change user' }));

        expect(await screen.findByText('Profile: bob')).toBeInTheDocument();
        expect(mockedFetchUser).toHaveBeenNthCalledWith(2, 'bob');
    });
});
