import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchUser } from '../api/hackernews';
import { UserPage } from './UserPage';

vi.mock('../api/hackernews', () => ({
  fetchUser: vi.fn(),
}));

const mockedFetchUser = vi.mocked(fetchUser);

function renderUserPage(id = 'pg') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/user/${id}`]}>
        <Routes>
          <Route path="/user/:id" element={<UserPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('UserPage', () => {
  beforeEach(() => {
    mockedFetchUser.mockReset();
  });

  it('renders the user profile details', async () => {
    mockedFetchUser.mockResolvedValue({
      id: 'pg',
      created_time: 123,
      created: '10 years ago',
      karma: 42,
      avg: 1,
      about: '<strong>Hacker</strong>',
    });

    renderUserPage();

    expect(await screen.findByText('pg')).toBeInTheDocument();
    expect(screen.getByText('42 ★')).toBeInTheDocument();
    expect(screen.getByText('Created 10 years ago')).toBeInTheDocument();
    expect(screen.getByText('Hacker')).toBeInTheDocument();
  });

  it('renders the exact error message', async () => {
    mockedFetchUser.mockRejectedValue(new Error('Request failed'));

    renderUserPage();

    expect(await screen.findByText('Could not load user pg.')).toBeInTheDocument();
  });

  it('omits the about section when about is missing', async () => {
    mockedFetchUser.mockResolvedValue({
      id: 'pg',
      created_time: 123,
      created: '10 years ago',
      karma: 42,
      avg: 1,
    });

    const { container } = renderUserPage();

    await waitFor(() => expect(screen.getByText('pg')).toBeInTheDocument());
    expect(container.querySelector('div.other-details')).not.toBeInTheDocument();
  });
});
