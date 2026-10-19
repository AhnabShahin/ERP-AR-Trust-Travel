import type { Metadata } from 'next';
import { ContactRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Contact Us — AR Trust Travel Qatar',
  description: 'Get in touch with AR Trust Travel & Tourism in Doha, Qatar for bookings and enquiries.',
};

export default function Page() {
  return <ContactRoute />;
}
