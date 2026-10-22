'use client';

// Resolves the current /admin/<tab>[/...] route to its view component from the
// registry and renders it. Every admin sub-route (list, /new, /[id], /[id]/edit)
// renders this same component for the tab; the view itself reads the record id
// and mode from the URL (see useEntityRoute) to decide what to show. Unknown
// tabs fall back to the overview.

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ADMIN_VIEWS, DEFAULT_TAB, isKnownTab } from '../../config/adminRoutes';

export default function AdminTabView() {
  const params = useParams();
  const router = useRouter();
  const raw = params?.tab;
  const tab = Array.isArray(raw) ? raw[0] : raw;

  useEffect(() => {
    if (tab && !isKnownTab(tab)) router.replace('/admin');
  }, [tab, router]);

  const View = isKnownTab(tab) ? ADMIN_VIEWS[tab] : ADMIN_VIEWS[DEFAULT_TAB];
  return <View />;
}
