import React from 'react';
import { PRESET_TEAMS } from '../data/mockBuilders';
import { PresetTeam } from '../types';
import { Sparkles, Layers } from 'lucide-react';

interface PresetsBarProps {
  activePreset: string | null;
  onSelectPreset: (preset: PresetTeam) => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  activePreset,
  onSelectPreset,
}) => {
  return (
    <div className="mb-6 p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Curated Squad Blueprints
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
          1-click load pre-balanced 4-member teams
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESET_TEAMS.map((preset) => {
          const isSelected = activePreset === preset.label;
          return (
            <button
              key={preset.label}
              id={`preset-${preset.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onSelectPreset(preset)}
              title={preset.description}
              className={`group px-3.5 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs'
              }`}
            >
              <span>{preset.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {preset.members.length} members
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};



