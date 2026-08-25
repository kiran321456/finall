/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Builder, PresetTeam, UserProfile } from './types';
import { INITIAL_BUILDERS } from './data/mockBuilders';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { PresetsBar } from './components/PresetsBar';
import { FilterBar } from './components/FilterBar';
import { BuilderCard } from './components/BuilderCard';
import { TeamSidebar } from './components/TeamSidebar';
import { AutoMatchWizardModal } from './components/AutoMatchWizardModal';
import { BuilderProfileModal } from './components/BuilderProfileModal';
import { SynergyDeepDiveModal } from './components/SynergyDeepDiveModal';
import { AddBuilderModal } from './components/AddBuilderModal';
import { AIChatbotModal } from './components/AIChatbotModal';
import { AuthModal } from './components/AuthModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  auth,
  syncUserProfile,
  logoutUser,
  saveUserSquad,
  loadUserSquad,
  saveCustomBuilderToDb,
  loadBuildersFromDb,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles, Users, RefreshCw, Bot, MessageSquare, Zap, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'mcs_team_v1';

export default function App() {
  const [builders, setBuilders] = useState<Builder[]>(INITIAL_BUILDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<(Builder | null)[]>([null, null, null, null]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // User & Auth & Pro State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // Filters & Search
  const [query, setQuery] = useState('');
  const [activeDomain, setActiveDomain] = useState('All Domains');
  const [onlyHackathonReady, setOnlyHackathonReady] = useState(false);
  const [sortBy, setSortBy] = useState<'matchScore' | 'hackathonsWon' | 'name'>('matchScore');

  // Modals & Drawers
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAddBuilderOpen, setIsAddBuilderOpen] = useState(false);
  const [isSynergyModalOpen, setIsSynergyModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Builder | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'warning' | 'info' = 'success'
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Listen to Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUser(profile);
          addToast(
            `Welcome back, ${profile.displayName || 'Builder'}!`,
            profile.isPro ? '⭐ Pro Membership is Active.' : 'Connected to Firestore Database.',
            'success'
          );

          // Load user's persistent squad from cloud Firestore
          const cloudSquadIds = await loadUserSquad(firebaseUser.uid);
          if (cloudSquadIds && cloudSquadIds.length > 0) {
            setTeam((prev) => {
              const restored: (Builder | null)[] = [null, null, null, null];
              cloudSquadIds.forEach((id, idx) => {
                if (idx < 4) {
                  restored[idx] = builders.find((b) => b.id === id) || null;
                }
              });
              return restored;
            });
            addToast('Cloud Squad Restored', 'Synchronized your team from Firestore.', 'info');
          }
        } catch (e) {
          console.error('User sync error:', e);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [builders]);

  // 2. Fetch builders from Server API and Firestore Database on load
  useEffect(() => {
    const initBuilders = async () => {
      let combined = [...INITIAL_BUILDERS];
      try {
        // Try local server API
        const res = await fetch('/api/builders');
        if (res.ok) {
          const apiData: Builder[] = await res.json();
          if (Array.isArray(apiData) && apiData.length > 0) {
            combined = apiData;
          }
        }
      } catch (err) {
        console.warn('API fallback to mock:', err);
      }

      try {
        // Try Firestore database persistent records
        const cloudBuilders = await loadBuildersFromDb();
        if (cloudBuilders && cloudBuilders.length > 0) {
          const existingIds = new Set(combined.map((b) => b.id));
          const uniqueCloud = cloudBuilders.filter((b) => !existingIds.has(b.id));
          combined = [...uniqueCloud, ...combined];
        }
      } catch (dbErr) {
        console.warn('Firestore builders query skipped:', dbErr);
      }

      setBuilders(combined);
      restoreTeamFromStorage(combined);
      setIsLoading(false);
    };

    initBuilders();
  }, []);

  const restoreTeamFromStorage = (builderPool: Builder[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (Array.isArray(ids)) {
          const restored: (Builder | null)[] = [null, null, null, null];
          ids.forEach((id, idx) => {
            if (idx < 4) {
              restored[idx] = builderPool.find((b) => b.id === id) || null;
            }
          });
          setTeam(restored);
        }
      }
    } catch (e) {
      console.error('Storage restore error:', e);
    }
  };

  // 3. Save squad to local storage and sync to Firestore if user logged in
  useEffect(() => {
    const ids = team.map((m) => (m ? m.id : null)).filter(Boolean) as string[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

    if (user?.uid) {
      saveUserSquad(user.uid, ids);
    }
  }, [team, user]);

  const activeMemberIds = useMemo(() => {
    return team.filter(Boolean).map((m) => m!.id);
  }, [team]);

  const activeTeamMembers = useMemo(() => {
    return team.filter((m): m is Builder => m !== null);
  }, [team]);

  // Toggle builder in team
  const handleToggleTeam = (builder: Builder) => {
    setTeam((prev) => {
      const existingIdx = prev.findIndex((m) => m && m.id === builder.id);
      if (existingIdx !== -1) {
        // Remove
        const next = [...prev];
        next[existingIdx] = null;
        addToast(`Removed ${builder.name}`, 'Slot is now available.', 'info');
        return next;
      }

      // Add to first empty slot
      const emptyIdx = prev.findIndex((m) => m === null);
      if (emptyIdx === -1) {
        addToast('Team is Full', 'Remove a member before adding another.', 'warning');
        return prev;
      }

      const next = [...prev];
      next[emptyIdx] = builder;
      addToast(
        `Added ${builder.name} to Slot ${emptyIdx + 1}`,
        `${builder.role} joined the active roster.`,
        'success'
      );
      return next;
    });
    setActivePreset(null);
  };

  const handleRemoveSlot = (index: number) => {
    const member = team[index];
    setTeam((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    if (member) {
      addToast(`Removed ${member.name}`, `Slot ${index + 1} cleared.`, 'info');
    }
    setActivePreset(null);
  };

  const handleClearTeam = () => {
    setTeam([null, null, null, null]);
    setActivePreset(null);
    addToast('Roster Cleared', 'All 4 team slots have been emptied.', 'info');
  };

  const handleSelectPreset = (preset: PresetTeam) => {
    setActivePreset(preset.label);
    const selected = preset.members
      .map((name) => builders.find((b) => b.name === name))
      .filter(Boolean) as Builder[];

    const newTeam: (Builder | null)[] = [null, null, null, null];
    selected.forEach((member, idx) => {
      if (idx < 4) {
        newTeam[idx] = member;
      }
    });

    setTeam(newTeam);
    addToast(`Loaded "${preset.label}"`, preset.description, 'success');
  };

  const handleApplyAIAutoMatch = (aiTeam: Builder[]) => {
    const newTeam: (Builder | null)[] = [null, null, null, null];
    aiTeam.forEach((member, idx) => {
      if (idx < 4) {
        newTeam[idx] = member;
      }
    });
    setTeam(newTeam);
    setActivePreset(null);
    addToast(
      user?.isPro ? '⚡ Pro Priority Match Applied!' : 'AI Auto-Match Applied!',
      'Squad loaded into active roster slots.',
      'success'
    );
  };

  const handleAddCustomBuilder = async (builderData: Partial<Builder>) => {
    const newBuilder: Builder = {
      id: `builder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: builderData.name || 'Anonymous Builder',
      initials: (builderData.name || 'A B')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      role: builderData.role || 'Full-Stack Dev',
      deptYear: builderData.deptYear || 'SRM IST • Campus Builder',
      skills: builderData.skills || ['React', 'TypeScript', 'Python'],
      domains: builderData.domains || ['Frontend'],
      matchScore: builderData.matchScore || 95,
      availability: builderData.availability || 'Ready for 24h Hackathon',
      avatarColor: builderData.avatarColor || 'linear-gradient(135deg, #EAB308, #CA8A04)',
      bio: builderData.bio || 'Campus builder registered for Prompt Wars 2026.',
      github: builderData.github || '',
      email: builderData.email || '',
      phone: builderData.phone || '',
      whatsapp: builderData.whatsapp || '',
      linkedin: builderData.linkedin || '',
      cgpa: builderData.cgpa || '9.00 / 10.0',
      hackathonsWon: 1,
      verified: true,
    };

    try {
      // Save directly to Firestore database for persistent storage
      await saveCustomBuilderToDb(newBuilder, user?.uid);
    } catch (err) {
      console.warn('Firestore write error:', err);
    }

    try {
      // Also post to Express server
      await fetch('/api/builders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBuilder),
      });
    } catch (e) {
      // Ignored
    }

    setBuilders((prev) => [newBuilder, ...prev]);
    addToast(
      'Profile Registered in Database!',
      `${newBuilder.name} is now stored in Firestore and visible in the directory.`,
      'success'
    );
  };

  const handleExportMarkdown = async () => {
    const active = team.filter(Boolean) as Builder[];
    if (!active.length) return;

    const avgScore = Math.round(active.reduce((sum, b) => sum + b.matchScore, 0) / active.length);

    const markdown = `# 🚀 MatchCrewSync — Hackathon Squad Roster
**Competition Target:** Prompt Wars 2026 (NVIDIA x SRM IST)
**Overall Synergy Score:** ${avgScore}%
**Team Size:** ${active.length}/4 Members

${active
  .map(
    (member, idx) => `### Slot ${idx + 1}: ${member.role} — ${member.name} (${member.matchScore}% Match)
- **Institution / Dept:** ${member.deptYear}
- **Domains:** ${member.domains.join(', ')}
- **Core Skills:** ${member.skills.join(', ')}
- **Availability:** ${member.availability}
${member.email ? `- **Official Email:** ${member.email}` : ''}
${member.phone ? `- **Phone:** ${member.phone}` : ''}
${member.github ? `- **GitHub:** https://github.com/${member.github}` : ''}
`
  )
  .join('\n')}
---
*Generated by MatchCrewSync AI v2.4 (Gemini 3.7 Flash & Firestore Database)*
`;

    try {
      await navigator.clipboard.writeText(markdown);
      addToast('Roster Copied!', 'Markdown team summary copied to clipboard.', 'success');
    } catch (e) {
      addToast('Export Ready', 'Check browser console or clipboard permission.', 'info');
      console.log(markdown);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    addToast('Signed Out', 'You have been logged out of MatchCrewSync.', 'info');
  };

  const handleProUpgraded = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    addToast(
      '⭐ PRO ACCESS UNLOCKED!',
      'Priority matchmaking and full student contact dossier are now active.',
      'success'
    );
  };

  // Filtered & Sorted Builders
  const filteredBuilders = useMemo(() => {
    return builders
      .filter((b) => {
        // Domain match
        const matchesDomain =
          activeDomain === 'All Domains' || b.domains.includes(activeDomain as any);

        // Hackathon Ready filter
        const matchesHackathon =
          !onlyHackathonReady ||
          b.availability.includes('24h') ||
          b.availability.includes('Sprint');

        // Query match (name, skills, role, dept)
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.role.toLowerCase().includes(q) ||
          b.deptYear.toLowerCase().includes(q) ||
          b.skills.some((s) => s.toLowerCase().includes(q));

        return matchesDomain && matchesHackathon && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'matchScore') {
          return b.matchScore - a.matchScore;
        }
        if (sortBy === 'hackathonsWon') {
          return (b.hackathonsWon || 0) - (a.hackathonsWon || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [builders, activeDomain, onlyHackathonReady, query, sortBy]);

  const hackathonReadyCount = builders.filter(
    (b) => b.availability.includes('24h') || b.availability.includes('Sprint')
  ).length;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Header Bar with Auth, Pro, and Directory Status */}
      <Header
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenAddBuilder={() => setIsAddBuilderOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProModal={() => setIsProModalOpen(true)}
        onLogout={handleLogout}
        user={user}
        builderCount={builders.length}
      />

      {/* Pro Promotional Banner if on Free Tier */}
      {!user?.isPro && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
            </span>
            <span>
              <strong className="text-slate-900 dark:text-white font-semibold">Match Crew Pro Version:</strong> Priority AI Matchmaking + Full Student Mobile Contacts & WhatsApp Unlocked.
            </span>
          </div>
          <button
            onClick={() => setIsProModalOpen(true)}
            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition cursor-pointer text-xs shadow-xs"
          >
            Get Pro Version (₹199)
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-7 max-w-[1440px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-7 items-start">
          {/* Left Column: Hero, Stats, Presets, Filters, Builder Grid */}
          <div className="flex-1 min-w-0 w-full">
            {/* Title Section */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Talent Graph Equilibrium</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Assemble Your Squad
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                Squad at your preference — discover verified campus builders, evaluate AI synergy compatibility matrices, and let real-time radar eliminate domain blindspots with <span className="font-semibold text-slate-900 dark:text-slate-200">Match Crew Intelligence</span>.
              </p>
            </div>

            {/* Top Metric Stats & Skills Distribution Bar Chart */}
            <StatsBar
              totalBuilders={builders.length}
              teamsAssembled={14}
              avgSynergy={94}
              hackathonReadyCount={hackathonReadyCount}
              builders={builders}
            />

            {/* Quick Competition Presets */}
            <PresetsBar
              activePreset={activePreset}
              onSelectPreset={handleSelectPreset}
            />

            {/* Search, Filter, and Sort Controls */}
            <FilterBar
              query={query}
              setQuery={setQuery}
              activeDomain={activeDomain}
              setActiveDomain={setActiveDomain}
              onlyHackathonReady={onlyHackathonReady}
              setOnlyHackathonReady={setOnlyHackathonReady}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Builder List Header / Status */}
            <div className="flex items-center justify-between mt-6 mb-3.5 border-b border-slate-200/80 dark:border-slate-800/80 pb-2.5">
              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  Showing <strong className="text-slate-900 dark:text-white font-semibold">{filteredBuilders.length}</strong> active talent nodes
                </span>
              </div>

              {(query || activeDomain !== 'All Domains' || onlyHackathonReady) && (
                <button
                  onClick={() => {
                    setQuery('');
                    setActiveDomain('All Domains');
                    setOnlyHackathonReady(false);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            {/* Builders Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-5 shadow-xs"
                  />
                ))}
              </div>
            ) : filteredBuilders.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center my-4 shadow-xs">
                <Users className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-slate-900 dark:text-white font-bold text-base">
                  No builders match active criteria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Adjust domain filters or query tokens, or register a new campus builder node.
                </p>
                <button
                  onClick={() => {
                    setQuery('');
                    setActiveDomain('All Domains');
                    setOnlyHackathonReady(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBuilders.map((builder) => (
                  <BuilderCard
                    key={builder.id}
                    builder={builder}
                    inTeam={activeMemberIds.includes(builder.id)}
                    onToggleTeam={handleToggleTeam}
                    onViewProfile={(b) => setSelectedProfile(b)}
                    isPro={user?.isPro || false}
                    onOpenProModal={() => setIsProModalOpen(true)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Active Team & Skill-Gap Engine */}
          <TeamSidebar
            team={team}
            onRemoveSlot={handleRemoveSlot}
            onClearTeam={handleClearTeam}
            onExportMarkdown={handleExportMarkdown}
            onOpenSynergyModal={() => setIsSynergyModalOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Match Crew • Gemini 3.7 Flash • Firestore Database</span>
          </div>
          <div>
            Powering <strong className="text-slate-700 dark:text-slate-300 font-semibold">Campus Builders & Squads</strong>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AutoMatchWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onApplyTeam={handleApplyAIAutoMatch}
        isPro={user?.isPro || false}
        onOpenProModal={() => setIsProModalOpen(true)}
      />

      <BuilderProfileModal
        builder={selectedProfile}
        isOpen={Boolean(selectedProfile)}
        onClose={() => setSelectedProfile(null)}
        inTeam={Boolean(selectedProfile && activeMemberIds.includes(selectedProfile.id))}
        onToggleTeam={handleToggleTeam}
        isPro={user?.isPro || false}
        onOpenProModal={() => setIsProModalOpen(true)}
      />

      <SynergyDeepDiveModal
        team={team}
        isOpen={isSynergyModalOpen}
        onClose={() => setIsSynergyModalOpen(false)}
      />

      <AddBuilderModal
        isOpen={isAddBuilderOpen}
        onClose={() => setIsAddBuilderOpen(false)}
        onAddBuilder={handleAddCustomBuilder}
      />

      {/* AI Tactical Chatbot Assistant Modal */}
      <AIChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onViewProfile={(b) => setSelectedProfile(b)}
        onToggleTeam={handleToggleTeam}
        team={activeTeamMembers}
        allBuilders={builders}
        onOpenAutoMatch={() => {
          setIsChatbotOpen(false);
          setIsWizardOpen(true);
        }}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          addToast('Authentication Complete', 'Signed into your builder profile.', 'success');
        }}
      />

      {/* Pro Membership & Purchase Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        user={user}
        onOpenAuth={() => {
          setIsProModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onProUpgraded={handleProUpgraded}
      />

      {/* Floating Tactical AI Assistant Trigger */}
      <button
        id="btn-floating-chatbot-trigger"
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 group cursor-pointer"
        aria-label="Open AI Assistant"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
        </div>
        <div className="text-left">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide leading-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Search
          </div>
          <div className="text-xs text-slate-900 dark:text-white font-bold leading-tight mt-0.5">
            AI Fact-Checker
          </div>
        </div>
      </button>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
