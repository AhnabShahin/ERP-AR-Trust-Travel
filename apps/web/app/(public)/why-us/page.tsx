import type { Metadata } from 'next';
import { WhyUsRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Why Choose Us — AR Trust Travel Qatar',
  description: 'Licensed Qatar DMC with 24/7 support, trusted partners and thousands of happy travellers.',
};

export default function Page() {
  return <WhyUsRoute />;
}
