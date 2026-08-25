import React, { useState } from 'react';
import { Builder, AIAutoMatchResult } from '../types';
import {
  Zap,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Terminal,
  Lock,
} from 'lucide-react';

interface AutoMatchWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTeam: (team: Builder[]) => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
}

const SAMPLE_PROMPTS = [
  'Build an AI MedTech agent that diagnoses ultrasound & CT medical images in real-time for rural clinics.',
  'Develop a Web3 high-throughput decentralized exchange with sub-10ms matching engine and on-chain ZK verification.',
  'Create an autonomous multi-drone fleet coordinator using ROS2 and real-time WebSockets telemetry map.',
  'Design an agentic developer copilot that performs AST code refactoring and generates automated pull requests.',
];

export const AutoMatchWizardModal: React.FC<AutoMatchWizardModalProps> = ({
  isOpen,
  onClose,
  onApplyTeam,
  isPro = false,
  onOpenProModal,
}) => {
  const [problemStatement, setProblemStatement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIAutoMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemStatement, isProPriority: isPro }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate match');
      }

      const data: AIAutoMatchResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Auto-match generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result && result.team) {
      onApplyTeam(result.team);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="auto-match-wizard-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 dark:text-white font-bold text-base">
                  AI Squad Auto-Match
                </h3>
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    PRO PRIORITY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gemini 3.7 Flash • Heuristic Skill-Gap Synthesis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pro Banner / Priority Mode */}
        {isPro ? (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span className="font-semibold">Pro Priority Matchmaking Active</span>
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">100% Target Equilibrium</span>
          </div>
        ) : (
          <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Standard Queue Matchmaking</span>
            </div>
            <button
              onClick={onOpenProModal}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              ⚡ Upgrade for Pro Priority
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Problem Statement Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Project Vision or Hackathon Challenge</span>
            </label>
            <textarea
              id="input-problem-statement"
              rows={3}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="e.g., Build an autonomous agent mesh that scans radiology scans and produces doctor-verified diagnoses in 24 hours..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Quick sample chips */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Challenge Templates:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setProblemStatement(prompt)}
                  className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition text-xs text-slate-700 dark:text-slate-300 line-clamp-2 cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Result Output */}
          {result && (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
                    Optimal Squad Synthesized
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {result.synergyScore}% Synergy
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  4 Disciplines Balanced
                </div>
              </div>

              {/* Tactical Plan Overview */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Tactical Architecture Strategy
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  {result.tacticalPlan}
                </p>
              </div>

              {/* Selected Squad */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Suggested 4-Member Roster
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.team.map((builder) => (
                    <div
                      key={builder.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: builder.avatarColor }}
                        >
                          {builder.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {builder.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {builder.role}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">
                        {builder.matchScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {result ? (
              <button
                id="btn-apply-ai-squad"
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to Active Roster</span>
              </button>
            ) : (
              <button
                id="btn-generate-ai-squad"
                onClick={handleGenerate}
                disabled={isLoading || !problemStatement.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Equilibrium...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Equilibrium Match</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

