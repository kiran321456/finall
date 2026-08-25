import React from 'react';
import { Builder } from '../types';
import { Plus, Check, Trophy, ExternalLink, ShieldCheck, Phone, Mail, Zap, Lock } from 'lucide-react';

interface BuilderCardProps {
  builder: Builder;
  inTeam: boolean;
  onToggleTeam: (builder: Builder) => void;
  onViewProfile: (builder: Builder) => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
}

export const BuilderCard: React.FC<BuilderCardProps> = ({
  builder,
  inTeam,
  onToggleTeam,
  onViewProfile,
  isPro = false,
  onOpenProModal,
}) => {
  const getScoreBadge = (score: number) => {
    if (score >= 95) {
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (score >= 90) {
      return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  const isHackathonReady = builder.availability.includes('24h') || builder.availability.includes('Sprint');

  return (
    <div
      id={`builder-card-${builder.id}`}
      className={`rounded-2xl bg-white dark:bg-[#111827] transition-all duration-200 p-5 flex flex-col justify-between border shadow-sm hover:shadow-md ${
        inTeam
          ? 'border-indigo-500/80 dark:border-indigo-400/80 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10 bg-indigo-50/10 dark:bg-indigo-950/10'
          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div>
        {/* Header with Avatar & Details */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0"
              style={{ background: builder.avatarColor }}
            >
              {builder.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {builder.name}
                </span>
                {builder.verified && (
                  <span title="Verified Campus Builder">
                    <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                  </span>
                )}
                {isPro && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {builder.deptYear}
              </p>
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${getScoreBadge(
              builder.matchScore
            )}`}
          >
            {builder.matchScore}% Match
          </div>
        </div>

        {/* Role & Domain Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold">
            {builder.role}
          </span>
          {builder.domains.map((domain) => (
            <span
              key={domain}
              className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-100 dark:border-indigo-900/50"
            >
              {domain}
            </span>
          ))}
          {builder.hackathonsWon ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-800/60">
              <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
              {builder.hackathonsWon} wins
            </span>
          ) : null}
        </div>

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {builder.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
          {builder.skills.length > 4 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-slate-500">
              +{builder.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Quick Contact Dossier Bar */}
        <div className="mt-3.5 py-2 px-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="text-[11px] font-medium">Direct Dossier</span>
          </div>
          {isPro ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
              <Check className="w-3 h-3" />
              UNLOCKED
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenProModal) onOpenProModal();
              }}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Unlock (Pro)</span>
            </button>
          )}
        </div>

        {/* Bio */}
        {builder.bio && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
            {builder.bio}
          </p>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isHackathonReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {builder.availability}
            </span>
          </div>

          <button
            onClick={() => onViewProfile(builder)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition cursor-pointer"
          >
            <span>Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          id={`btn-toggle-team-${builder.id}`}
          onClick={() => onToggleTeam(builder)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            inTeam
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
              : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
          }`}
        >
          {inTeam ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>In Squad</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Assign to Squad</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};


