'use client';

import dynamic from 'next/dynamic';

// The existing app is a client-side SPA with its own window-based router,
// so we load it with SSR disabled and let it handle every route. This is an
// optional catch-all route ([[...slug]]) so /login, /dashboard, role slugs,
// etc. all render the SPA. Routes are migrated to real Next pages gradually.
const App = dynamic(() => import('../../src/App'), { ssr: false });

export default function CatchAllPage() {
  return <App />;
}
