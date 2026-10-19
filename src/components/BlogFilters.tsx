'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BlogFiltersProps {
  initialQ?: string;
  initialTag?: string;
  initialOrder?: 'asc' | 'desc';
}

export default function BlogFilters({
  initialQ = '',
  initialTag = '',
  initialOrder = 'desc',
}: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQ);
  const [tag, setTag] = useState(initialTag);
  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (tag.trim()) params.set('tag', tag.trim());
    if (order !== 'desc') params.set('order', order);

    const qs = params.toString();
    router.push(`/dev-blog${qs ? `?${qs}` : ''}`);
  };

  const handleReset = () => {
    setQuery('');
    setTag('');
    setOrder('desc');
    router.push('/dev-blog');
  };

  const hasActiveFilters = Boolean(query || tag || order !== 'desc');

  return (
    <form
      onSubmit={handleFilter}
      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-end backdrop-blur-sm"
    >
      <div className="flex-1 min-w-0">
        <label htmlFor="blog-search" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
          Search Articles
        </label>
        <input
          id="blog-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Quantitative research, regime shift, Kelly sizing..."
          maxLength={200}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
        />
      </div>

      <div className="w-full md:w-44">
        <label htmlFor="blog-tag" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
          Filter by Tag
        </label>
        <input
          id="blog-tag"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="e.g. backtesting"
          maxLength={60}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
        />
      </div>

      <div className="w-full md:w-36">
        <label htmlFor="blog-order" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
          Sort Order
        </label>
        <select
          id="blog-order"
          value={order}
          onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-mono transition-colors cursor-pointer"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="flex items-center gap-2 pt-1 md:pt-0">
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-sm font-bold rounded-lg transition-all cursor-pointer shadow-md hover:shadow-emerald-500/20"
        >
          Filter
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded-lg transition-all cursor-pointer border border-slate-700/60"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
