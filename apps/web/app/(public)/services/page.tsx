import type { Metadata } from 'next';
import { ServicesRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Services — AR Trust Travel Qatar',
  description: 'Airline ticketing, visa processing, hotel bookings and full destination management services.',
};

export default function Page() {
  return <ServicesRoute />;
}
