import React from 'react';
import { Builder, DomainType } from '../types';
import { DOMAIN_CONFIG } from '../data/mockBuilders';
import {
  X,
  Sparkles,
  Copy,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Trash2,
  Layers,
  Server,
  Cpu,
  Palette,
  Users,
} from 'lucide-react';

interface TeamSidebarProps {
  team: (Builder | null)[];
  onRemoveSlot: (index: number) => void;
  onClearTeam: () => void;
  onExportMarkdown: () => void;
  onOpenSynergyModal: () => void;
}

const SLOT_CONFIG = [
  { label: 'Slot 1', defaultDomain: 'Frontend', roleHint: 'Frontend Lead', icon: Layers },
  { label: 'Slot 2', defaultDomain: 'Backend', roleHint: 'Backend & DB', icon: Server },
  { label: 'Slot 3', defaultDomain: 'AI/ML', roleHint: 'AI / ML Specialist', icon: Cpu },
  { label: 'Slot 4', defaultDomain: 'UI/UX', roleHint: 'UI/UX Designer', icon: Palette },
];

const DOMAIN_ICONS: Record<DomainType, any> = {
  Frontend: Layers,
  Backend: Server,
  'AI/ML': Cpu,
  'UI/UX': Palette,
};

export const TeamSidebar: React.FC<TeamSidebarProps> = ({
  team,
  onRemoveSlot,
  onClearTeam,
  onExportMarkdown,
  onOpenSynergyModal,
}) => {
  const activeMembers = team.filter(Boolean) as Builder[];
  const memberCount = activeMembers.length;

  // Calculate domain coverage
  const domainCoverage: Record<DomainType, number> = {
    Frontend: 0,
    Backend: 0,
    'AI/ML': 0,
    'UI/UX': 0,
  };

  activeMembers.forEach((member) => {
    member.domains.forEach((d) => {
      domainCoverage[d] = Math.min(100, domainCoverage[d] + (member.matchScore >= 95 ? 60 : 45));
    });
  });

  const isOptimal = DOMAIN_CONFIG.every(
    (cfg) => activeMembers.some((m) => m.domains.includes(cfg.key))
  ) && memberCount === 4;

  // Detect duplicate primary roles
  const roleCounts: Record<string, number> = {};
  activeMembers.forEach((m) => {
    roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
  });
  const duplicateRole = Object.entries(roleCounts).find(([, count]) => count >= 2)?.[0];
  const missingDomain = DOMAIN_CONFIG.find(
    (cfg) => !activeMembers.some((m) => m.domains.includes(cfg.key))
  );

  const avgScore = memberCount
    ? Math.round(activeMembers.reduce((sum, m) => sum + m.matchScore, 0) / memberCount)
    : 0;

  return (
    <aside
      id="team-sidebar-panel"
      className="w-full lg:w-[360px] shrink-0 rounded-2xl bg-white dark:bg-[#111827] p-5 h-fit lg:sticky lg:top-24 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-all"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-slate-900 dark:text-white font-bold text-sm">
              Active Squad Roster
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {memberCount}/4 Slots filled •{' '}
            <span className={isOptimal ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
              {isOptimal ? 'Optimal balance' : 'In progress'}
            </span>
          </p>
        </div>

        {memberCount > 0 && (
          <button
            id="btn-clear-team"
            onClick={onClearTeam}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 4 Team Slots */}
      <div className="mt-4 space-y-2">
        {SLOT_CONFIG.map((slot, index) => {
          const member = team[index];
          const SlotIcon = slot.icon;

          return (
            <div
              key={slot.label}
              id={`team-slot-${index + 1}`}
              className={`rounded-xl p-3 transition-all ${
                member
                  ? 'border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
              }`}
            >
              {member ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ background: member.avatarColor }}
                    >
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-slate-900 dark:text-white text-xs font-bold truncate">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <span>{member.role}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{member.matchScore}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-remove-slot-${index + 1}`}
                    onClick={() => onRemoveSlot(index)}
                    title="Remove from team"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between py-1 px-1">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <SlotIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {slot.label}: {slot.roleHint}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-600">
                    Empty
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SKILL-GAP RADAR */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Skill Balance Radar
            </span>
          </div>
          {memberCount > 0 && (
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60">
              {avgScore}% synergy
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {DOMAIN_CONFIG.map((item) => {
            const Icon = DOMAIN_ICONS[item.key];
            const coverage = domainCoverage[item.key] || 0;

            return (
              <div key={item.key} id={`synergy-meter-${item.key.toLowerCase()}`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    {item.label}
                  </span>
                  <span
                    className={`font-semibold ${
                      coverage >= 70
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : coverage > 0
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {coverage}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out bg-indigo-600 dark:bg-indigo-400"
                    style={{
                      width: `${coverage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Alerts */}
      <div className="mt-4">
        {isOptimal ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <strong className="font-bold">Optimal Synergy Achieved ({avgScore}%)</strong>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                Full-stack domain coverage verified with zero skill voids.
              </p>
            </div>
          </div>
        ) : duplicateRole && missingDomain ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              Duplicate <strong className="font-bold">{duplicateRole}</strong> role detected.
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Recommended: Add a <strong>{missingDomain.label}</strong> specialist.
              </p>
            </div>
          </div>
        ) : memberCount > 0 ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Add {4 - memberCount} more builder{4 - memberCount > 1 ? 's' : ''} to complete squad balance.
            </p>
          </div>
        ) : null}
      </div>

      {/* AI Execution Roadmap Button */}
      {memberCount > 0 && (
        <button
          id="btn-open-synergy-deepdive"
          onClick={onOpenSynergyModal}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold transition cursor-pointer"
        >
          <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>AI Execution Roadmap</span>
        </button>
      )}

      {/* Export Button */}
      <button
        id="btn-export-markdown"
        onClick={onExportMarkdown}
        disabled={memberCount === 0}
        className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
      >
        <Copy className="w-4 h-4" />
        <span>Export Roster (.md)</span>
      </button>
    </aside>
  );
};


