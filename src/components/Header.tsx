import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Users,
  UserPlus,
  Zap,
  Bot,
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  onOpenWizard: () => void;
  onOpenAddBuilder: () => void;
  onOpenChatbot: () => void;
  onOpenAuth: () => void;
  onOpenProModal: () => void;
  onLogout: () => void;
  user: UserProfile | null;
  builderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWizard,
  onOpenAddBuilder,
  onOpenChatbot,
  onOpenAuth,
  onOpenProModal,
  onLogout,
  user,
  builderCount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-bold">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Match <span className="text-indigo-600 dark:text-indigo-400">Crew</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Squad at your preference
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Total Pool Counter */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{builderCount} Builders Active</span>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-button"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Pro Upgrade Pill */}
          {user?.isPro ? (
            <button
              id="btn-pro-status-active"
              onClick={onOpenProModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>PRO ACTIVE</span>
            </button>
          ) : (
            <button
              id="btn-get-pro-glowing"
              onClick={onOpenProModal}
              className="glow-btn-pro inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-slate-950 text-xs font-bold shadow-sm transition hover:opacity-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
              <span className="relative z-10">GET PRO</span>
            </button>
          )}

          {/* AI Chatbot Assistant */}
          <button
            id="btn-open-chatbot-header"
            onClick={onOpenChatbot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Agent</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Add Builder */}
          <button
            id="btn-register-builder"
            onClick={onOpenAddBuilder}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Join Directory</span>
          </button>

          {/* AI Auto-Match Wizard */}
          <button
            id="btn-auto-match-wizard"
            onClick={onOpenWizard}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Match</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {user.displayName || 'Builder'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-3 space-y-3 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'Campus Builder'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email || 'No email attached'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Cloud Sync Active
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Membership:</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {user.isPro ? 'PRO ACCESS' : 'FREE TIER'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Active Program:</span>
                      <span className="font-medium text-slate-900 dark:text-white">Campus Hackathons</span>
                    </div>
                  </div>

                  {!user.isPro && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProModal();
                      }}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Upgrade to Pro (₹199)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

