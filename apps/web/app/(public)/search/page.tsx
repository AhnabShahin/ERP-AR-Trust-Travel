import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchRoute } from '@/components/public/pages';

export const metadata: Metadata = {
  title: 'Explore & Search — AR Trust Travel Qatar',
  description: 'Search tours, fleet and holiday packages across AR Trust Travel Qatar.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchRoute />
    </Suspense>
  );
}
