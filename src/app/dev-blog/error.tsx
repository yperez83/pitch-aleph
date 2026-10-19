'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Postparticle Blog Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 mx-auto mb-4 flex items-center justify-center font-mono text-xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Unable to Load Content
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          A temporary error occurred while fetching published articles. Please verify network connectivity or try again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg transition-colors border border-slate-700/60"
          >
            Return to App
          </Link>
        </div>
      </div>
    </div>
  );
}
