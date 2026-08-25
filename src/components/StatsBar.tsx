import React, { useMemo, useState } from 'react';
import { Users, Trophy, Flame, CheckCircle2, BarChart2, Sparkles, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Builder } from '../types';

interface StatsBarProps {
  totalBuilders: number;
  teamsAssembled: number;
  avgSynergy: number;
  hackathonReadyCount: number;
  builders?: Builder[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      count: number;
      fill: string;
      percentage?: number;
    };
  }>;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl shadow-xl text-xs z-50">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
          <span className="font-bold text-slate-900 dark:text-white">{data.name}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-white font-semibold">{data.count}</strong> builders{' '}
          {data.percentage !== undefined && (
            <span className="text-[11px] text-slate-400">({data.percentage}%)</span>
          )}
        </p>
      </div>
    );
  }
  return null;
};

export const StatsBar: React.FC<StatsBarProps> = ({
  totalBuilders,
  teamsAssembled,
  avgSynergy,
  hackathonReadyCount,
  builders = [],
}) => {
  const [chartMode, setChartMode] = useState<'domains' | 'skills'>('domains');

  // Compute domain distribution
  const domainData = useMemo(() => {
    const counts: Record<string, number> = {
      'AI/ML': 0,
      'Frontend': 0,
      'Backend': 0,
      'UI/UX': 0,
    };

    builders.forEach((b) => {
      b.domains?.forEach((d) => {
        if (d === 'AI/ML' || d === 'Frontend' || d === 'Backend' || d === 'UI/UX') {
          counts[d] = (counts[d] || 0) + 1;
        }
      });
    });

    const totalDomainInstances = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    const colors: Record<string, string> = {
      'AI/ML': '#8b5cf6',
      'Frontend': '#6366f1',
      'Backend': '#10b981',
      'UI/UX': '#f59e0b',
    };

    return [
      {
        name: 'AI/ML',
        count: counts['AI/ML'] || 0,
        fill: colors['AI/ML'],
        percentage: Math.round(((counts['AI/ML'] || 0) / totalDomainInstances) * 100),
      },
      {
        name: 'Frontend',
        count: counts['Frontend'] || 0,
        fill: colors['Frontend'],
        percentage: Math.round(((counts['Frontend'] || 0) / totalDomainInstances) * 100),
      },
      {
        name: 'Backend',
        count: counts['Backend'] || 0,
        fill: colors['Backend'],
        percentage: Math.round(((counts['Backend'] || 0) / totalDomainInstances) * 100),
      },
      {
        name: 'UI/UX',
        count: counts['UI/UX'] || 0,
        fill: colors['UI/UX'],
        percentage: Math.round(((counts['UI/UX'] || 0) / totalDomainInstances) * 100),
      },
    ];
  }, [builders]);

  // Compute top individual skills distribution
  const topSkillsData = useMemo(() => {
    const skillCounts: Record<string, number> = {};

    builders.forEach((b) => {
      b.skills?.forEach((skill) => {
        const cleaned = skill.trim();
        if (cleaned) {
          skillCounts[cleaned] = (skillCounts[cleaned] || 0) + 1;
        }
      });
    });

    const sorted = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], index) => {
        const palette = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];
        return {
          name,
          count,
          fill: palette[index % palette.length],
        };
      });

    return sorted.length > 0
      ? sorted
      : [
          { name: 'PyTorch', count: 5, fill: '#8b5cf6' },
          { name: 'React', count: 7, fill: '#6366f1' },
          { name: 'Node.js', count: 4, fill: '#10b981' },
          { name: 'FastAPI', count: 4, fill: '#0ea5e9' },
          { name: 'Figma', count: 3, fill: '#f59e0b' },
          { name: 'Docker', count: 3, fill: '#ec4899' },
        ];
  }, [builders]);

  const activeChartData = chartMode === 'domains' ? domainData : topSkillsData;

  const stats = [
    {
      id: 'stat-active-builders',
      label: 'Active Talent Pool',
      value: `${totalBuilders}`,
      icon: Users,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      tag: 'Verified Directory',
      detail: 'Across SRM IST & Tech Hubs',
    },
    {
      id: 'stat-teams-assembled',
      label: 'Squads Assembled',
      value: `${teamsAssembled}`,
      icon: Trophy,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      tag: 'Competition',
      detail: 'Sprint-Ready Teams',
    },
    {
      id: 'stat-avg-synergy',
      label: 'Avg Squad Synergy',
      value: `${avgSynergy}%`,
      icon: Flame,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60',
      tag: 'Equilibrium',
      detail: 'Cross-Domain Balance',
    },
    {
      id: 'stat-hackathon-ready',
      label: '24h Sprint Ready',
      value: `${Math.round((hackathonReadyCount / (totalBuilders || 1)) * 100)}%`,
      icon: CheckCircle2,
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-950/60',
      tag: 'Confirmed',
      detail: 'Weekend Availability',
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {item.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {item.value}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.tag}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Small Recharts Bar Chart: Skill & Domain Distribution */}
      <div
        id="stats-skill-distribution-chart"
        className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Skill & Domain Distribution</span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                  ({totalBuilders} Builders Registered)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live breakdown of expertise across the talent directory
              </p>
            </div>
          </div>

          {/* Toggle between Core Domains and Top Tech Skills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setChartMode('domains')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                chartMode === 'domains'
                  ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Core Domains</span>
            </button>
            <button
              onClick={() => setChartMode('skills')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                chartMode === 'skills'
                  ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Top Skills</span>
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="h-32 sm:h-36 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeChartData}
              margin={{ top: 8, right: 12, left: -20, bottom: 4 }}
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
              <Bar dataKey="count" radius={[6, 6, 2, 2]} maxBarSize={48}>
                {activeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Pill Badges under chart */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            {activeChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Interactive chart • Hover for details
          </span>
        </div>
      </div>
    </div>
  );
};



