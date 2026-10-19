import type { Metadata } from 'next';
import { ToursRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Tours & Safaris — AR Trust Travel Qatar',
  description: 'Desert safaris, inland sea dune expeditions and cultural day tours across Qatar.',
};

export default function Page() {
  return <ToursRoute />;
}
