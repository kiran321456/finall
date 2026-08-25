import React from 'react';
import { Search, ArrowUpDown, X, Sparkles, Filter } from 'lucide-react';
import { DomainType } from '../types';

interface FilterBarProps {
  query: string;
  setQuery: (q: string) => void;
  activeDomain: string;
  setActiveDomain: (d: string) => void;
  onlyHackathonReady: boolean;
  setOnlyHackathonReady: (v: boolean) => void;
  sortBy: 'matchScore' | 'hackathonsWon' | 'name';
  setSortBy: (s: 'matchScore' | 'hackathonsWon' | 'name') => void;
}

const DOMAIN_OPTIONS = [
  'All Domains',
  'AI/ML',
  'Frontend',
  'Backend',
  'UI/UX',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  query,
  setQuery,
  activeDomain,
  setActiveDomain,
  onlyHackathonReady,
  setOnlyHackathonReady,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="flex flex-col gap-3.5 mb-6">
      {/* Search and Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="input-builder-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name, college, or skills (PyTorch, React, Figma)..."
            className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-xs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              id="select-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl pl-8 pr-7 py-2.5 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="matchScore">Sort: Match Score</option>
              <option value="hackathonsWon">Sort: Most Wins</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          <button
            id="toggle-hackathon-ready"
            onClick={() => setOnlyHackathonReady(!onlyHackathonReady)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition cursor-pointer shadow-xs ${
              onlyHackathonReady
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyHackathonReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <span className="whitespace-nowrap">24h Ready</span>
          </button>
        </div>
      </div>

      {/* Domain Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {DOMAIN_OPTIONS.map((domain) => {
          const isActive = activeDomain === domain;
          return (
            <button
              key={domain}
              id={`filter-domain-${domain.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setActiveDomain(domain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {domain}
            </button>
          );
        })}
      </div>
    </div>
  );
};



