'use client';

// Public customer reviews, loaded from /api/reviews (public endpoint) with the
// built-in CUSTOMER_REVIEWS as the SSR / offline fallback. Only reviews flagged
// showOnWebsite are returned, ordered by the dashboard's sortOrder.

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { CUSTOMER_REVIEWS, type ReviewItem } from '../data/websiteData';

interface ApiReview {
  id: string;
  author: string;
  country?: string;
  rating?: number;
  date?: string;
  tour?: string;
  comment?: string;
  avatar?: string;
  showOnWebsite?: boolean;
}

export function useReviews(): ReviewItem[] {
  const [reviews, setReviews] = useState<ReviewItem[]>(CUSTOMER_REVIEWS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<ApiReview[]>('/api/reviews?take=200');
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setReviews(
          data
            .filter((r) => r.showOnWebsite !== false)
            .map((r) => ({
              id: r.id,
              author: r.author,
              country: r.country ?? '',
              rating: r.rating ?? 5,
              date: r.date ?? '',
              tour: r.tour ?? '',
              comment: r.comment ?? '',
              avatar: r.avatar ?? '',
            }))
        );
      } catch {
        /* keep the fallback */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return reviews;
}
