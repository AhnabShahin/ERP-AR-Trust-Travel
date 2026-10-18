'use client';

import dynamic from 'next/dynamic';

// The existing app is a client-side SPA with its own window-based router, so
// we load it with SSR disabled. Kept in a client component so the route's
// page.tsx can stay a server component and export generateStaticParams
// (required for `next build` with output: 'export').
const App = dynamic(() => import('../../src/App'), { ssr: false });

export default function AppClient() {
  return <App />;
}
