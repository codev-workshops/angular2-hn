import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useSettingsStore } from '../stores/settings';

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ showSettings: false, theme: 'default' });
  });

  it('renders the home link and nav links with feed hrefs', () => {
    renderHeader();
    expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
    expect(screen.getByText('new')).toHaveAttribute('href', '/newest/1');
    expect(screen.getByText('show')).toHaveAttribute('href', '/show/1');
    expect(screen.getByText('ask')).toHaveAttribute('href', '/ask/1');
    expect(screen.getByText('jobs')).toHaveAttribute('href', '/jobs/1');
  });

  it('scrolls to the top when a nav link is clicked', async () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    renderHeader();
    await userEvent.click(screen.getByText('ask'));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('toggles the settings popup when the cog is clicked', async () => {
    renderHeader();
    expect(screen.queryByText('Settings', { selector: 'h1' })).not.toBeInTheDocument();
    const cog = screen.getByAltText('Settings');
    expect(cog).toHaveAttribute('src', '/assets/images/cog.svg');
    await userEvent.click(cog);
    expect(screen.getByText('Settings', { selector: 'h1' })).toBeInTheDocument();
    await userEvent.click(cog);
    expect(screen.queryByText('Settings', { selector: 'h1' })).not.toBeInTheDocument();
  });
});
