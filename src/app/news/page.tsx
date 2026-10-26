import React from 'react';
import type { Metadata } from 'next';
import NewsClientPage from '@/components/news/NewsClientPage';

export const metadata: Metadata = {
  title: 'News & Live Test Ledger | Pitch Aleph',
  description:
    'Live in-play quantitative post-mortems and news ledger comparing the v1.2.1 Smart Engine memory-state execution against legacy v1.2 Naive baselines.',
  openGraph: {
    title: 'News & Live Test Ledger | Pitch Aleph',
    description:
      'Quantitative match ledger comparing PitchAleph v1.2.1 Smart Engine vs v1.2 Naive.',
    type: 'website'
  }
};

export default function NewsPage() {
  return <NewsClientPage />;
}
