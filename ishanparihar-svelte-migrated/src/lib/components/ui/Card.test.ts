import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Card from './Card.svelte';

// Define the expected props type to match the component
interface CardProps {
  title: string;
  excerpt: string;
  coverImage?: string;
  date?: string;
  category?: string;
  slug?: string;
  premium?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  content_type?: "blog" | "research_paper";
}

describe('Card Component', () => {
	it('renders card with all props', () => {
		const props = {
			title: 'Test Card',
			excerpt: 'This is a test card excerpt',
			coverImage: 'https://example.com/image.jpg',
			date: '2024-01-01',
			category: 'Technology',
			slug: 'test-card',
			premium: false,
			likes_count: 10,
			comments_count: 5,
			views_count: 100
		};

		const { getByText, getByRole } = render(Card as any, { props });

		expect(getByText('Test Card')).toBeInTheDocument();
		expect(getByText('This is a test card excerpt')).toBeInTheDocument();
		expect(getByText('Technology')).toBeInTheDocument();
		expect(getByText('10')).toBeInTheDocument();
		expect(getByText('5')).toBeInTheDocument();
		expect(getByText('100')).toBeInTheDocument();
		
		const image = getByRole('img');
		expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
		expect(image).toHaveAttribute('alt', 'Test Card');
	});

	it('displays premium badge for premium content', () => {
		const { getByText } = render(Card as any, {
			props: {
				title: 'Premium Card',
				excerpt: 'Premium content',
				premium: true
			}
		});

		expect(getByText('Premium')).toBeInTheDocument();
	});

	it('hides engagement metrics when counts are zero', () => {
		const { queryByText } = render(Card as any, {
			props: {
				title: 'No Metrics Card',
				excerpt: 'No engagement metrics',
				likes_count: 0,
				comments_count: 0,
				views_count: 0
			}
		});

		expect(queryByText('0')).not.toBeInTheDocument();
	});

	it('renders correctly without cover image', () => {
		const { queryByRole } = render(Card as any, {
			props: {
				title: 'No Image Card',
				excerpt: 'No cover image'
			}
		});

		expect(queryByRole('img')).not.toBeInTheDocument();
	});
});
