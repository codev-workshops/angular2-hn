import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { useSettingsStore } from '../store/settings';

function renderHeader(initialEntry = '/news/1') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Header />
        </MemoryRouter>
    );
}

describe('Header', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    beforeEach(() => {
        useSettingsStore.setState({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('renders all navigation hrefs and marks the current route active', () => {
        renderHeader('/show/1');
        expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
    });

    it('scrolls to the top when navigation links are clicked', () => {
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
        renderHeader();
        fireEvent.click(screen.getByRole('link', { name: 'ask' }));
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('toggles the settings panel with the cog', () => {
        renderHeader();
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        fireEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByText('Settings')).toBeInTheDocument();
        fireEvent.click(screen.getByText('×'));
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
});

describe('SettingsPanel', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    beforeEach(() => {
        window.localStorage.clear();
        useSettingsStore.setState({
            showSettings: true,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('fires actions for all controls and persists values', () => {
        render(<SettingsPanel />);
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByLabelText('Night'));
        fireEvent.click(screen.getByLabelText('Black (AMOLED)'));
        fireEvent.keyUp(screen.getByLabelText('Font size:'), { target: { value: '21' } });
        fireEvent.keyUp(screen.getByLabelText('List spacing:'), { target: { value: '7' } });

        expect(useSettingsStore.getState()).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '21',
            listSpacing: '7',
        });
        expect(window.localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(window.localStorage.getItem('theme')).toBe('amoledblack');
        expect(window.localStorage.getItem('titleFontSize')).toBe('21');
        expect(window.localStorage.getItem('listSpacing')).toBe('7');
    });

    it('seeds number input values from the store', () => {
        useSettingsStore.setState({ titleFontSize: '24', listSpacing: '9' });
        render(<SettingsPanel />);
        expect(screen.getByLabelText('Font size:')).toHaveValue(24);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(9);
    });
});
