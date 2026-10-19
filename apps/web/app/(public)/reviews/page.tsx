import type { Metadata } from 'next';
import { ReviewsRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Guest Reviews — AR Trust Travel Qatar',
  description: 'Read verified reviews from travellers who explored Qatar with AR Trust Travel & Tourism.',
};

export default function Page() {
  return <ReviewsRoute />;
}
