import React, { useState } from 'react';
import { UserProfile, ProPricingPlan } from '../types';
import { upgradeUserToPro } from '../lib/firebase';
import {
  X,
  Sparkles,
  Zap,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  CreditCard,
  QrCode,
  ArrowRight,
  Award,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onProUpgraded: (updatedUser: UserProfile) => void;
}

const PLANS: ProPricingPlan[] = [
  {
    id: 'hacker_pass',
    name: 'MATCHERS CREW PRO PASS',
    price: '₹199',
    originalPrice: '₹499',
    duration: 'Full Campus Season Access',
    badge: 'ESSENTIAL',
    features: [
      'Priority AI Matchmaking Algorithm (Fast-Track)',
      'Unlock All Student Mobile & WhatsApp Numbers',
      'Unlock SRM Official Emails & LinkedIn Profiles',
      'Verified Pro Hacker Badge on Profile',
      'Access to 24h Tactical Roadmap Engine',
    ],
    popular: false,
  },
  {
    id: 'squad_pass',
    name: 'SQUAD PRO BUNDLE',
    price: '₹399',
    originalPrice: '₹999',
    duration: 'Full Team (4 Members)',
    badge: 'MOST POPULAR',
    features: [
      'Everything in Hacker Pro for all 4 teammates',
      'Zero-Latency Gemini 3.7 Flash AI Computations',
      'Full Student Contact Dossier + Resume Exports',
      'Priority Judge & Sponsor Intro Queue',
      'Exclusive NVIDIA NGC GPU Voucher Claim ($200)',
      'Automated Domain Conflict Eliminator',
    ],
    popular: true,
  },
  {
    id: 'campus_lifetime',
    name: 'CAMPUS LIFETIME',
    price: '₹799',
    originalPrice: '₹1,999',
    duration: 'Permanent Campus Access',
    badge: 'MAX VALUE',
    features: [
      'Lifetime Pro access across all 2026-2027 hackathons',
      'Unlimited Squad exports and Cloud sync',
      'Direct Recruiter & Startup Founder Outreach',
      'VIP Discord Role & Hackathon Mentorship',
    ],
    popular: false,
  },
];

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onProUpgraded,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'hacker_pass' | 'squad_pass' | 'campus_lifetime'>('squad_pass');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'srm_erp'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMode, setSuccessMode] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsProcessing(true);
    try {
      await upgradeUserToPro(user.uid, selectedPlan);
      
      const updated: UserProfile = {
        ...user,
        isPro: true,
        proPlan: selectedPlan,
        proActivatedAt: new Date().toISOString(),
      };
      
      onProUpgraded(updated);
      setSuccessMode(true);
    } catch (err: any) {
      console.error('Upgrade error:', err);
      alert('Error activating Pro status: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="pro-upgrade-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="pro-upgrade-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-slate-900 dark:text-white text-sm font-bold">
                  Matchers Crew Pro Version
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                  Pro Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Priority Matchmaking & Confidential Student Contact Dossier
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

        {/* Content Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {successMode ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pro Membership Activated!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Your account is now upgraded to <span className="text-indigo-600 dark:text-indigo-400 font-semibold">PRO</span>. Priority matchmaking algorithms and student contact dossiers are unlocked.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 max-w-lg mx-auto text-left">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <div className="text-[10px] text-slate-500 font-medium">Phone & WhatsApp</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">UNLOCKED</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-1" />
                  <div className="text-[10px] text-slate-500 font-medium">SRM Emails</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">UNLOCKED</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl col-span-2 sm:col-span-1">
                  <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <div className="text-[10px] text-slate-500 font-medium">Priority Match</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">ACTIVE</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition"
              >
                Explore Unlocked Builders
              </button>
            </div>
          ) : (
            <>
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Priority Matchmaking Engine
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Zero-queue AI algorithms with Gemini 3.7 Flash optimize for 100% 4-discipline equilibrium, factoring in real project goals and past hackathon wins.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Full Student Contact Dossier
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Direct access to student Mobile numbers, one-click WhatsApp chats, official SRM email addresses, LinkedIn profiles, and verified CGPA records.
                  </p>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                    Select Pro Tier:
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Instant Database Unlock</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-semibold uppercase rounded-full">
                            {plan.badge}
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-300">
                            {plan.name}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                              {plan.price}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              {plan.originalPrice}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {plan.duration}
                          </div>

                          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
                            {plan.features.map((f, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <span className="leading-tight">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                          <div
                            className={`w-full py-1.5 text-center rounded-lg text-xs font-semibold transition ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  Payment Method (Instant Confirmation):
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / GPay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cards / NetBank</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('srm_erp')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'srm_erp'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Campus ERP</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!user ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>Sign in required to bind Pro subscription to your profile</span>
                    </div>
                    <button
                      onClick={onOpenAuth}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition"
                    >
                      Sign In Now
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="font-semibold">Activating Pro Status in Database...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="font-semibold">Upgrade to Pro & Unlock All Details ({PLANS.find(p => p.id === selectedPlan)?.price})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                <div className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Refund Guarantee within 72h • Official SRM IST × NVIDIA Partner</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


