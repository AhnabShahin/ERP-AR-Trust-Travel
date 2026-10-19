import type { ReactNode } from 'react';
import { getPublicCatalog } from '@lib/server-api';
import PublicShell from '@/components/public/PublicShell';

// Render per request so the public pages are true SSR with live data (not
// built once at deploy time). server-api still sets a short revalidate on the
// underlying fetches, so repeated requests stay fast.
export const dynamic = 'force-dynamic';

// Fetch the live catalogue on the server for every public request so the
// shell (and the pages below) render with real data in the initial HTML.
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const catalog = await getPublicCatalog();
  return <PublicShell catalog={catalog}>{children}</PublicShell>;
}
