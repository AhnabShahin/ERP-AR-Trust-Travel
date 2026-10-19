import type { Metadata } from 'next';
import { PackagesRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Holiday Packages — AR Trust Travel Qatar',
  description: 'Multi-day Qatar holiday packages combining tours, hotels and airport transfers.',
};

export default function Page() {
  return <PackagesRoute />;
}
