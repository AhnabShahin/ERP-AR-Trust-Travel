import type { Metadata } from 'next';
import HomePage from '@/components/public/HomePage';

export const metadata: Metadata = {
  title: 'AR Trust Travel & Tourism — Qatar Desert Safaris, Dhow Cruises & VIP Airport Transit',
  description:
    'Official Qatar destination management: desert & inland sea safaris, traditional dhow cruises, luxury airport transfers and holiday packages in Doha.',
};

export default function Page() {
  return <HomePage />;
}
