import React, { useEffect, useState } from 'react';
import { Builder, TeamSynergyAnalysis } from '../types';
import {
  BrainCircuit,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SynergyDeepDiveModalProps {
  team: (Builder | null)[];
  isOpen: boolean;
  onClose: () => void;
}

export const SynergyDeepDiveModal: React.FC<SynergyDeepDiveModalProps> = ({
  team,
  isOpen,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<TeamSynergyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMembers = team.filter(Boolean) as Builder[];

  useEffect(() => {
    if (!isOpen || activeMembers.length === 0) return;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/analyze-synergy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamMembers: activeMembers,
            competitionContext: 'Campus Hackathon Squad Assembly & 24H Sprint',
          }),
        });

        if (!res.ok) {
          throw new Error('Analysis request failed');
        }

        const data: TeamSynergyAnalysis = await res.json();
        setAnalysis(data);
      } catch (err: any) {
        console.error(err);
        setError('Could not generate deep synergy analysis.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [isOpen, activeMembers.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="synergy-deep-dive-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-base">
                Squad Synergy & 24H Roadmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Squad Synergy & Equilibrium Analysis
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <div className="text-slate-900 dark:text-white font-bold text-sm">
                Synthesizing multi-domain telemetry & roadmap milestones...
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Analyzing complementary API interfaces, model deployment pipelines, and demo deliverable deadlines.
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Score & Tier Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Balance Equilibrium Rating
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                    <span>{analysis.balanceRating}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                      Tier 1 Squad
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Composite Score
                  </div>
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {analysis.overallScore}%
                  </div>
                </div>
              </div>

              {/* Tactical Strengths & Vulnerabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tactical Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {analysis.tacticalStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Vulnerability Watch</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {analysis.vulnerabilities.map((vuln, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{vuln}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 24h Hackathon Milestone Roadmap */}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>24-Hour Hour-by-Hour Execution Roadmap</span>
                </div>
                <div className="space-y-2">
                  {analysis.hackathonRoadmap.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0">
                          {step.hours}
                        </span>
                        <div>
                          <div className="text-slate-900 dark:text-white text-xs font-semibold">
                            {step.keyDeliverable}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {step.phase}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-right shrink-0">
                        Lead: <strong className="text-indigo-600 dark:text-indigo-400 font-medium">{step.owner}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Strategic Recommendation */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>MatchCrewSync Strategic Directive</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {analysis.recommendation}
                </p>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 text-xs">
              {error || 'No analysis available.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};



