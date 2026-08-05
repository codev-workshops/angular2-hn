import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from './Settings';
import { useSettingsStore } from '../stores/settings';

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('closes the popup when the close span is clicked', async () => {
    render(<Settings />);
    await userEvent.click(screen.getByText('×'));
    expect(useSettingsStore.getState().showSettings).toBe(false);
  });

  it('updates the theme in the store and localStorage', async () => {
    render(<Settings />);
    const night = screen.getByRole('radio', { name: 'Night' });
    expect(night).not.toBeChecked();
    await userEvent.click(night);
    expect(useSettingsStore.getState().theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();

    await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
    expect(useSettingsStore.getState().theme).toBe('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('toggles the open-links-in-new-tab checkbox', async () => {
    render(<Settings />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(useSettingsStore.getState().openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('updates font size and list spacing from the number inputs', async () => {
    render(<Settings />);
    const font = screen.getByRole('spinbutton', { name: 'Font size:' });
    await userEvent.clear(font);
    await userEvent.type(font, '20');
    expect(useSettingsStore.getState().titleFontSize).toBe('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');

    const spacing = screen.getByRole('spinbutton', { name: 'List spacing:' });
    await userEvent.clear(spacing);
    await userEvent.type(spacing, '5');
    expect(useSettingsStore.getState().listSpacing).toBe('5');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });
});
