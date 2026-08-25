export type DomainType = 'Frontend' | 'Backend' | 'AI/ML' | 'UI/UX';

export type AvailabilityStatus = 
  | 'Ready for 24h Hackathon'
  | 'Available Weekends'
  | 'Semester Capstone'
  | 'Sprint Mode (48h)';

export interface Builder {
  id: string;
  name: string;
  initials: string;
  role: string;
  deptYear: string;
  skills: string[];
  domains: DomainType[];
  matchScore: number;
  availability: AvailabilityStatus;
  avatarColor: string;
  bio?: string;
  github?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  discord?: string;
  cgpa?: string;
  hackathonsWon?: number;
  featuredProject?: {
    title: string;
    description: string;
    tags: string[];
  };
  strengths?: string[];
  verified?: boolean;
  proExclusive?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPro: boolean;
  proPlan?: 'hacker_pass' | 'squad_pass' | 'campus_lifetime' | null;
  proActivatedAt?: string;
  phone?: string;
  college?: string;
}

export interface ProPricingPlan {
  id: 'hacker_pass' | 'squad_pass' | 'campus_lifetime';
  name: string;
  price: string;
  originalPrice: string;
  duration: string;
  badge: string;
  features: string[];
  popular?: boolean;
}

export interface PresetTeam {
  label: string;
  description: string;
  members: string[];
  focusArea: string;
}

export interface DomainSynergy {
  key: DomainType;
  label: string;
  color: string;
  percentage: number;
}

export interface AIAutoMatchResult {
  team: Builder[];
  synergyScore: number;
  tacticalPlan: string;
  domainCoverage: Record<string, string>;
  roleAssignments: {
    builderName: string;
    assignedRole: string;
    focus: string;
  }[];
  geminiExplanation: string;
}

export interface TeamSynergyAnalysis {
  overallScore: number;
  balanceRating: 'Sub-Optimal' | 'Balanced' | 'High-Synergy' | 'World-Class';
  tacticalStrengths: string[];
  vulnerabilities: string[];
  hackathonRoadmap: {
    phase: string;
    hours: string;
    keyDeliverable: string;
    owner: string;
  }[];
  recommendation: string;
}

export type AgentMode = 'current_events' | 'climate' | 'fact_check' | 'squad_intel' | 'general';

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface FactCheckVerdict {
  claim: string;
  verdict: 'Verified True' | 'Mostly True' | 'Partially True' | 'Misleading' | 'Debunked / False' | 'Unverified';
  confidenceScore: number;
  keyEvidence: string[];
  context?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: AgentMode;
  suggestedBuilders?: Builder[];
  quickFollowUps?: string[];
  category?: 'builder_lookup' | 'guide' | 'payment' | 'general' | 'synergy' | 'current_events' | 'climate' | 'fact_check';
  groundedInSearch?: boolean;
  sources?: GroundingSource[];
  searchQueries?: string[];
  factCheckVerdict?: FactCheckVerdict;
}

export interface ChatApiResponse {
  reply: string;
  suggestedBuilderIds?: string[];
  quickFollowUps?: string[];
  category?: 'builder_lookup' | 'guide' | 'payment' | 'general' | 'synergy' | 'current_events' | 'climate' | 'fact_check';
  groundedInSearch?: boolean;
  sources?: GroundingSource[];
  searchQueries?: string[];
  factCheckVerdict?: FactCheckVerdict;
}

