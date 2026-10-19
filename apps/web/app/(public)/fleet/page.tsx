import type { Metadata } from 'next';
import { FleetRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Airport Fleet & Transfers — AR Trust Travel Qatar',
  description: 'Luxury Mercedes V-Class, Land Cruisers and coaches for Hamad Airport transfers and tours.',
};

export default function Page() {
  return <FleetRoute />;
}
