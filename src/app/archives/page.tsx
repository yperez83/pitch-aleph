import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogHeader } from '@/components/BlogNav';

export const metadata: Metadata = {
  title: 'Archives & Core Case Studies | Pitch Aleph',
  description:
    'Dedicated historical archives of the 4 core foundational match scenarios used to train and calibrate PitchAleph v1.0, plus official Swagger API reference documentation.',
  openGraph: {
    title: 'Archives | Pitch Aleph',
    description: 'Foundational training scenarios and engine API documentation.',
    type: 'website'
  }
};

interface CoreScenario {
  id: string;
  code: string;
  title: string;
  match: string;
  statusType: 'success' | 'mitigated';
  statusLabel: 'Big Success' | 'Mitigated Loss';
  description: string;
  ev: string;
  href: string;
}

const CORE_SCENARIOS: CoreScenario[] = [
  {
    id: '2022',
    code: 'TEST 01: ALPHA GENERATION',
    title: 'Alpha Inflection',
    match: 'ARG vs FRA (2022 World Cup Final)',
    statusType: 'success',
    statusLabel: 'Big Success',
    description:
      'Demonstrated high-conviction pre-match and in-play value capture. Captured early momentum asymmetry and market mispricing to lock in decisive alpha.',
    ev: '+18.4% EV',
    href: '/#case/2022'
  },
  {
    id: '2018',
    code: 'TEST 02: TAIL RISK / VARIANCE',
    title: 'Tail Risk Mitigation',
    match: 'GER vs KOR (2018 World Cup Group)',
    statusType: 'mitigated',
    statusLabel: 'Mitigated Loss',
    description:
      'Defensive capital preservation against historical heavy favorite collapse. Dynamic down-weighting preserved portfolio principal when public money was wiped out.',
    ev: '+15.0% EV (Protected)',
    href: '/#case/2018'
  },
  {
    id: 'ksa',
    code: 'TEST 03: UNDERDOG INEFFICIENCY',
    title: 'Underdog Inefficiency',
    match: 'KSA vs ARG (2022 World Cup Group)',
    statusType: 'success',
    statusLabel: 'Big Success',
    description:
      'Exploited extreme market bias and inflated lines on heavy favorites. Identified statistical parity in possession transitions to capture massive underdog alpha.',
    ev: '+42.0% EV',
    href: '/#case/ksa'
  },
  {
    id: 'ned',
    code: 'TEST 04: DYNAMIC HEDGING',
    title: 'Late-Game Dynamic Hedging',
    match: 'NED vs ARG (2022 World Cup QF)',
    statusType: 'mitigated',
    statusLabel: 'Mitigated Loss',
    description:
      'Continuous simplex rebalancing as match volatility exploded in stoppage time. Mitigated downside risk through automated in-play draw convergence.',
    ev: '+9.5% EV (Hedging)',
    href: '/#case/ned'
  }
];

export default function ArchivesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <BlogHeader current="archives" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
        {/* Page Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            HISTORICAL RESEARCH &amp; REPOSITORY ARCHIVES
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Pitch Aleph Archives
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Foundational research datasets, core training scenarios for PitchAleph v1.0, and official API integration references.
          </p>

          {/* Quick Sub-Navigation Pills */}
          <div className="flex flex-wrap items-center gap-3 mt-6 font-mono text-xs">
            <a
              href="#core-studies"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold hover:bg-emerald-500/25 transition-all shadow-sm"
            >
              📚 Core Case Studies
            </a>
            <a
              href="#api-docs"
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-all"
            >
              ⚡ API Docs (Swagger UI)
            </a>
          </div>
        </div>

        {/* Section 1: How it was used to train PitchAleph v1.0 */}
        <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            <span>🧬</span>
            <span>Training &amp; Calibration Foundations</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How Core Scenarios Trained PitchAleph v1.0
          </h2>
          <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-3">
            <p>
              Before deploying full-season backtesting and live telemetry feeds, PitchAleph v1.0 was calibrated against 4 adversarial high-variance World Cup matches. These historical games represented extreme testing regimes designed to eliminate favorite-bias hallucinations, measure tail-risk vulnerability, and validate mathematical edge extraction under real market bookmaker pricing.
            </p>
            <p>
              By tuning multi-class Poisson-Weibull distributions and XGBoost spatial decay parameters against these specific fixtures, the engine achieved mathematical convergence on two core outcomes: maximizing capital growth during high-probability mispricings (<strong className="text-emerald-400">Big Success</strong>) and locking in stop-loss positions when favorites collapsed (<strong className="text-amber-400">Mitigated Loss</strong>).
            </p>
          </div>
        </section>

        {/* Section 2: Core Case Studies Grid */}
        <section id="core-studies" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                CALIBRATION SUITE
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">Core Interactive Case Studies</h2>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Big Success</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Mitigated Loss</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORE_SCENARIOS.map((item) => {
              const isSuccess = item.statusType === 'success';

              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all ${
                    isSuccess
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/30'
                      : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-950/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 font-mono text-xs">
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider">
                        {item.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {item.statusLabel}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {item.match}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono">
                    <span
                      className={`text-xs font-bold ${
                        isSuccess ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {item.ev}
                    </span>

                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        isSuccess
                          ? 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 hover:border-emerald-400 shadow-sm shadow-emerald-500/10'
                          : 'bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 hover:border-amber-400 shadow-sm shadow-amber-500/10'
                      }`}
                    >
                      <span>Interactive Simulation</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: API Docs Nested Resource */}
        <section
          id="api-docs"
          className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              REST &amp; OPENAPI SPECIFICATION
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Pitch Aleph API Reference &amp; Swagger Docs
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Full REST API specification for programmatic access to Monte Carlo simulations, live edge calculations, backtesting telemetry, and historical match archives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 font-mono text-xs">
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-center transition-all"
            >
              Raw OpenAPI JSON ↗
            </a>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 text-center"
            >
              Open Swagger UI Docs ↗
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
