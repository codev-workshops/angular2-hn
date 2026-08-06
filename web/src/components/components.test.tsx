import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage';
import { Footer } from './Footer';
import { Loader } from './Loader';

describe('shared components', () => {
    it('renders the loader contract', () => {
        render(<Loader />);
        expect(document.querySelector('div.loading-section > div.loader')).toHaveTextContent('Loading...');
    });

    it('renders the error contract', () => {
        render(<ErrorMessage message="Could not load news stories." />);
        expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
        expect(screen.getByText(/If you are offline viewing/)).toBeInTheDocument();
    });

    it('renders the footer contract', () => {
        render(<Footer />);
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener');
    });
});
