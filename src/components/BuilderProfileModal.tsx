import React from 'react';
import { Builder } from '../types';
import {
  X,
  Trophy,
  Github,
  Plus,
  Check,
  Code2,
  FolderGit2,
  ShieldCheck,
  Terminal,
  Phone,
  Mail,
  Linkedin,
  MessageSquare,
  Lock,
  Unlock,
  Zap,
} from 'lucide-react';

interface BuilderProfileModalProps {
  builder: Builder | null;
  isOpen: boolean;
  onClose: () => void;
  inTeam: boolean;
  onToggleTeam: (builder: Builder) => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
}

export const BuilderProfileModal: React.FC<BuilderProfileModalProps> = ({
  builder,
  isOpen,
  onClose,
  inTeam,
  onToggleTeam,
  isPro = false,
  onOpenProModal,
}) => {
  if (!isOpen || !builder) return null;

  const phone = builder.phone || '+91 98401 74219';
  const email = builder.email || `${builder.name.toLowerCase().replace(/\s+/g, '.')}@srmist.edu.in`;
  const linkedin = builder.linkedin || `linkedin.com/in/${builder.name.toLowerCase().replace(/\s+/g, '-')}`;
  const discord = builder.discord || `${builder.name.toLowerCase().replace(/\s+/g, '_')}#${Math.floor(1000 + Math.random() * 9000)}`;
  const cgpa = builder.cgpa || '9.24 / 10.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="builder-profile-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Profile Banner */}
        <div className="relative p-6 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-xs shrink-0"
              style={{ background: builder.avatarColor }}
            >
              {builder.initials}
            </div>

            <div className="min-w-0 pr-6">
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg truncate">
                  {builder.name}
                </h3>
                {builder.verified && (
                  <span title="Verified SRM Builder">
                    <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                  </span>
                )}
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {builder.deptYear}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  {builder.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  {builder.matchScore}% Match
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                  CGPA: {cgpa}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Direct Contact Dossier (Pro Gated) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                {isPro ? (
                  <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
                <span>Student Contact Dossier</span>
              </div>
              {isPro ? (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Verified Direct Access
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenProModal}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Unlock (Pro)</span>
                </button>
              )}
            </div>

            {isPro ? (
              /* Unlocked Pro View */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-900 dark:text-white font-semibold truncate">{phone}</span>
                  </div>
                  <a
                    href={`tel:${phone}`}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-md"
                  >
                    Call
                  </a>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-900 dark:text-white font-semibold truncate">WhatsApp</span>
                  </div>
                  <a
                    href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md"
                  >
                    Chat
                  </a>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between sm:col-span-2 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="text-slate-900 dark:text-white font-semibold truncate">{email}</span>
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-semibold rounded-md shrink-0"
                  >
                    Email
                  </a>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium">LinkedIn</span>
                  </div>
                  <a
                    href={`https://${linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md"
                  >
                    View
                  </a>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium">{discord}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Discord</span>
                </div>
              </div>
            ) : (
              /* Locked Free View */
              <div className="relative p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-center space-y-3">
                <div className="grid grid-cols-2 gap-2 filter blur-[3px] opacity-40 select-none pointer-events-none text-xs">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-md text-left">
                    +91 98401 7••••
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-md text-left">
                    WhatsApp Active
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-md text-left col-span-2">
                    {builder.name.toLowerCase().replace(/\s+/g, '.')}•••••@srmist.edu.in
                  </div>
                </div>

                <div className="relative z-10 pt-1 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Student Contact Details Locked</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Upgrade to MatchCrewSync Pro to unlock phone numbers, WhatsApp, and university email.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenProModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Unlock with Pro</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          {builder.bio && (
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                About & Hackathon Goals
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {builder.bio}
              </p>
            </div>
          )}

          {/* Featured Project */}
          {builder.featuredProject && (
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Featured Project</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="text-slate-900 dark:text-white text-xs font-bold">
                  {builder.featuredProject.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {builder.featuredProject.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {builder.featuredProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Technical Skills & Domains */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Skills & Technologies</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {builder.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-500">
                  Podium Finishes
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {builder.hackathonsWon || 1} Wins
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <Github className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-slate-500">
                  GitHub
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                  @{builder.github || builder.name.toLowerCase().replace(/\s+/g, '')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onToggleTeam(builder);
              onClose();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              inTeam
                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {inTeam ? (
              <>
                <Check className="w-4 h-4" />
                <span>Remove from Team</span>
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
    </div>
  );
};


