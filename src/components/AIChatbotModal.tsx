import React, { useState, useRef, useEffect } from 'react';
import { Builder, ChatMessage, AgentMode, GroundingSource, FactCheckVerdict } from '../types';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  User,
  Bot,
  ShieldCheck,
  Plus,
  Check,
  ChevronRight,
  CreditCard,
  Layers,
  Users,
  Terminal,
  ExternalLink,
  Minimize2,
  Maximize2,
  Globe,
  Leaf,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Link2
} from 'lucide-react';
import Markdown from 'react-markdown';

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (builder: Builder) => void;
  onToggleTeam: (builder: Builder) => void;
  team: Builder[];
  allBuilders: Builder[];
  onOpenAutoMatch?: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'welcome-msg',
  sender: 'assistant',
  mode: 'general',
  text: `### ⚡ **Match Crew Real-Time Intelligence & Fact-Checking Agent**

Welcome to your live research, verification, and talent intelligence companion grounded in real-time Google Search!

Select an operational mode or ask anything:

- 🌐 **Current Events & News**: Ask for breaking developments, technological breakthroughs, and real-time updates.
- 🌍 **Climate & Environment**: Inquire about live climate metrics, renewable energy milestones, environmental policies, and clean tech.
- 🛡️ **Fact-Checker & Verifier**: Submit claims, rumors, or stats to receive verified truth ratings, primary source evidence, and cross-checks.
- ⚡ **Squad & Talent Graph**: Search campus builders, inspect student skills, and configure 4-discipline hackathon squads.

Choose a mode above or click any prompt below!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  quickFollowUps: [
    'Fact check: Did global renewable investments surpass fossil fuels?',
    'What are the latest breaking breakthroughs in AI agents this week?',
    'What is the current global consensus on climate tipping points?'
  ],
  category: 'general'
};

const MODE_CHIPS: Record<AgentMode, { label: string; query: string }[]> = {
  current_events: [
    { label: '📰 Latest AI releases this week', query: 'What are the most significant breaking AI model and agent releases announced this week?' },
    { label: '🚀 Space & quantum breakthroughs', query: 'What are the latest discoveries and announcements in space exploration and quantum computing?' },
    { label: '💻 Top open-source dev tools 2026', query: 'What are the trending open source developer tools and frameworks today?' },
    { label: '🏆 Global hackathons & competitions', query: 'What major global hackathons and tech student innovation challenges are active right now?' }
  ],
  climate: [
    { label: '🌡️ Global temperature anomalies', query: 'What are the latest verified climate temperature records and global anomaly reports?' },
    { label: '☀️ Renewable energy milestones', query: 'What are the newest records in solar and battery storage deployment globally?' },
    { label: '🌿 Green AI & CleanTech hackathons', query: 'How are engineers applying AI and IoT to climate action and carbon reduction?' },
    { label: '🌊 Ocean & polar ice trends', query: 'What do recent satellite observations show regarding ocean temperatures and polar ice sheets?' }
  ],
  fact_check: [
    { label: '🔍 Fact check: Quantum computing commercial viability', query: 'Fact check: Has quantum computing achieved practical commercial advantage in encryption or optimization?' },
    { label: '🌱 Fact check: EV lifecycle emissions', query: 'Fact check: Are electric vehicles lower in total lifecycle carbon emissions compared to gasoline vehicles?' },
    { label: '☕ Fact check: Coffee & cardiovascular health', query: 'Fact check: What does current medical research conclude about moderate coffee consumption and cardiovascular health?' },
    { label: '🤖 Fact check: AI code quality & vulnerabilities', query: 'Fact check: Does AI-assisted coding increase or decrease security vulnerabilities in software repositories?' }
  ],
  squad_intel: [
    { label: '👤 Aarav Sharma profile', query: 'Show details and featured projects for Aarav Sharma' },
    { label: '💳 Payment & fee details', query: 'What are the registration fees, payment modes, and refund policy?' },
    { label: '🛠️ How to use platform', query: 'How do I assemble a squad, use the synergy radar, and export roster?' },
    { label: '🏆 Top Hackathon winners', query: 'Who are the builders with the highest hackathon podium wins?' }
  ],
  general: [
    { label: '🌐 Breaking tech news', query: 'What are the biggest breaking stories in tech and software this week?' },
    { label: '🛡️ Fact check a claim', query: 'Fact check: Did researchers confirm new rooms-temperature superconductor claims?' },
    { label: '🌍 Global climate update', query: 'What are the latest findings from international climate accords and clean energy transition?' },
    { label: '⚡ Top campus builders', query: 'Who are the top AI/ML and full-stack builders available in Match Crew?' }
  ]
};

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({
  isOpen,
  onClose,
  onViewProfile,
  onToggleTeam,
  team,
  allBuilders,
  onOpenAutoMatch
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [activeMode, setActiveMode] = useState<AgentMode>('general');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string, overrideMode?: AgentMode) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const currentMode = overrideMode || activeMode;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      mode: currentMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInputPrompt('');
    }
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          mode: currentMode
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      let matchedBuilders: Builder[] = [];
      if (Array.isArray(data.suggestedBuilders) && data.suggestedBuilders.length > 0) {
        matchedBuilders = data.suggestedBuilders;
      } else if (Array.isArray(data.suggestedBuilderIds) && data.suggestedBuilderIds.length > 0) {
        matchedBuilders = data.suggestedBuilderIds
          .map((id: string) => allBuilders.find((b) => b.id === id))
          .filter(Boolean) as Builder[];
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is the requested information.',
        mode: currentMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedBuilders: matchedBuilders,
        quickFollowUps: data.quickFollowUps || [],
        category: data.category,
        groundedInSearch: data.groundedInSearch,
        sources: data.sources || [],
        searchQueries: data.searchQueries || [],
        factCheckVerdict: data.factCheckVerdict
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        mode: currentMode,
        text: `### ⚠️ Connection Notice\n\nI was unable to complete the live request: ${err.message}. Please try again or click one of the suggested prompts below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickFollowUps: [
          'Fact check: Is global clean energy investment accelerating?',
          'What are the latest AI breakthroughs this week?',
          'Show top AI/ML engineers in Match Crew'
        ]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
  };

  const getVerdictStyle = (verdict: FactCheckVerdict['verdict']) => {
    switch (verdict) {
      case 'Verified True':
      case 'Mostly True':
        return {
          badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        };
      case 'Partially True':
      case 'Misleading':
        return {
          badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
        };
      case 'Debunked / False':
        return {
          badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
          icon: <XCircle className="w-4 h-4 text-rose-500" />
        };
      default:
        return {
          badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
          icon: <HelpCircle className="w-4 h-4 text-indigo-500" />
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-chatbot-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="ai-chatbot-drawer"
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:w-[540px] ${
          isExpanded ? 'sm:w-[820px] h-[92vh]' : 'h-[88vh] sm:h-[720px]'
        } max-h-[96vh] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center relative">
              <Bot className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 dark:text-white text-xs font-bold">
                  Real-Time Intelligence & Fact-Checker
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Search className="w-2.5 h-2.5" />
                  Search Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Current Events • Climate Insights • Fact-Checking • Talent Graph
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Compact View' : 'Expand View'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleClearHistory}
              title="Clear Conversation"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              title="Close Chat"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agent Operational Mode Selector */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMode('general')}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeMode === 'general'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>All-in-One</span>
          </button>
          <button
            onClick={() => setActiveMode('current_events')}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeMode === 'current_events'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3 h-3 text-sky-400" />
            <span>Current Events</span>
          </button>
          <button
            onClick={() => setActiveMode('climate')}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeMode === 'climate'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Leaf className="w-3 h-3 text-emerald-500" />
            <span>Climate & Eco</span>
          </button>
          <button
            onClick={() => setActiveMode('fact_check')}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeMode === 'fact_check'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-amber-500" />
            <span>Fact-Checker</span>
          </button>
          <button
            onClick={() => setActiveMode('squad_intel')}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeMode === 'squad_intel'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3 h-3 text-indigo-400" />
            <span>Squad Intel</span>
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isBot
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[88%] space-y-2.5 ${isBot ? 'text-left' : 'text-right'}`}>
                  <div
                    className={`p-3.5 rounded-2xl ${
                      isBot
                        ? 'bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
                        : 'bg-indigo-600 text-white font-medium'
                    }`}
                  >
                    {/* Fact Check Verdict Card */}
                    {isBot && msg.factCheckVerdict && (
                      <div className="mb-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            {getVerdictStyle(msg.factCheckVerdict.verdict).icon}
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              Fact-Check Assessment
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              getVerdictStyle(msg.factCheckVerdict.verdict).badgeBg
                            }`}
                          >
                            {msg.factCheckVerdict.verdict}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              Claim Investigated:
                            </span>{' '}
                            <span className="italic font-medium">"{msg.factCheckVerdict.claim}"</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-slate-400">Confidence Meter:</span>
                            <div className="flex-1 max-w-[140px] h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${msg.factCheckVerdict.confidenceScore}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {msg.factCheckVerdict.confidenceScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Markdown Body */}
                    {isBot ? (
                      <div className="prose prose-xs max-w-none text-slate-800 dark:text-slate-200 space-y-2 leading-relaxed font-sans [&>h3]:text-indigo-600 dark:[&>h3]:text-indigo-400 [&>h3]:text-xs [&>h3]:font-bold [&>h3]:mt-0 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:space-y-1 [&>p]:my-1.5 [&>p>strong]:text-slate-900 dark:[&>p>strong]:text-white [&>p>strong]:font-semibold [&>code]:bg-slate-200 dark:[&>code]:bg-slate-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:text-indigo-700 dark:[&>code]:text-indigo-300 [&>code]:font-mono [&>code]:text-[11px]">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                        {msg.text}
                      </p>
                    )}

                    {/* Google Search Grounding Sources */}
                    {isBot && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Verified Search Sources ({msg.sources.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, sIdx) => {
                            let domain = 'web source';
                            try {
                              domain = new URL(src.url).hostname.replace(/^www\./, '');
                            } catch (e) {
                              domain = src.title;
                            }
                            return (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${src.title}\n${src.url}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition shadow-2xs"
                              >
                                <Globe className="w-2.5 h-2.5 text-slate-400" />
                                <span className="font-medium max-w-[150px] truncate">{src.title || domain}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Search Queries Executed */}
                    {isBot && msg.searchQueries && msg.searchQueries.length > 0 && (
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                        <Search className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>Live Queries:</span>
                        {msg.searchQueries.map((sq, sqIdx) => (
                          <span
                            key={sqIdx}
                            className="px-1.5 py-0.5 rounded-sm bg-slate-200/60 dark:bg-slate-800 font-mono text-[9px] text-slate-600 dark:text-slate-300"
                          >
                            "{sq}"
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-2 pt-1 border-t ${
                        isBot
                          ? 'border-slate-200/60 dark:border-slate-800 text-slate-400'
                          : 'border-white/20 text-white/70'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Interactive Builder Cards inside Bot Message */}
                  {isBot && msg.suggestedBuilders && msg.suggestedBuilders.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Referenced Profiles ({msg.suggestedBuilders.length})</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.suggestedBuilders.map((builder) => {
                          const isInTeam = team.some((m) => m.id === builder.id);
                          return (
                            <div
                              key={builder.id}
                              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition flex items-center justify-between gap-3 shadow-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ background: builder.avatarColor }}
                                >
                                  {builder.initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-900 dark:text-white font-semibold text-xs truncate">
                                      {builder.name}
                                    </span>
                                    {builder.verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {builder.role} • {builder.deptYear}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                                      {builder.matchScore}% Match
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {builder.hackathonsWon || 1} Wins
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => onViewProfile(builder)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                                >
                                  <span>View</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </button>
                                <button
                                  onClick={() => onToggleTeam(builder)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                                    isInTeam
                                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                  }`}
                                >
                                  {isInTeam ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>In Team</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Quick Action Chips */}
                  {isBot && msg.quickFollowUps && msg.quickFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickFollowUps.map((promptText, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(promptText)}
                          className="text-left px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 text-xs transition flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{promptText}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 ml-1">
                  Searching web & synthesizing with Gemini 3.7 Flash...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Suggestion Chips according to Active Mode */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {MODE_CHIPS[activeMode].map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(chip.query)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs transition cursor-pointer font-medium"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                activeMode === 'fact_check'
                  ? 'Enter any statement to fact-check (e.g. "Fact check: Did NASA discover...")'
                  : activeMode === 'climate'
                  ? 'Ask about climate metrics, emissions, renewable energy records...'
                  : activeMode === 'current_events'
                  ? 'Ask about breaking tech, world events, recent announcements...'
                  : 'Ask current events, climate info, fact checks, or student profiles...'
              }
              disabled={isLoading}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
