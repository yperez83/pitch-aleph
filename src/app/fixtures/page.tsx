import React from 'react';
import type { Metadata } from 'next';
import { BlogHeader } from '@/components/BlogNav';
import FixturesClient from './FixturesClient';

export const metadata: Metadata = {
  title: 'Upcoming Match Fixtures & Market Edges | Pitch Aleph',
  description:
    'Comprehensive schedule of upcoming European and domestic football fixtures with calculated Monte Carlo EV edges, local kickoff conversions, and simulation triggers.',
  openGraph: {
    title: 'Upcoming Match Fixtures | Pitch Aleph',
    description:
      'Live dynamic match schedule and predictive edge feed from Pitch Aleph ℵ₀.',
    type: 'website'
  }
};

export default function FixturesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <BlogHeader current="fixtures" />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        <FixturesClient />
      </main>
    </div>
  );
}
