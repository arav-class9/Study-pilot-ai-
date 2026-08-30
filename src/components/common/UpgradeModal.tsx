import React from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionTier } from '../../types';
import { Crown, Check, X, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, setIsUpgradeModalOpen, user, usageToday, upgradeSubscription } = useApp();
  const touchStartY = React.useRef<number>(0);
  if (!isUpgradeModalOpen) return null;



  const tiers: {
    id: SubscriptionTier;
    name: string;
    tagline: string;
    price: string;
    period: string;
    highlight?: boolean;
    badge?: string;
    limits: {
      aiQuestions: string;
      quizzes: string;
      notes: string;
    };
    features: string[];
  }[] = [
    {
      id: 'free',
      name: 'Free Scholar',
      tagline: 'Essential AI study companion',
      price: '₹0',
      period: 'forever',
      limits: {
        aiQuestions: '5 / day',
        quizzes: '2 / day',
        notes: '2 / day',
      },
      features: [
        'NCERT/CBSE Question Solver',
        'Basic Adaptive Quizzes',
        'Standard Study Notes',
        'Personal Streak & XP Tracker',
      ],
    },
    {
      id: 'plus',
      name: 'Pilot Plus',
      tagline: 'For ambitious students aiming for 90%+',
      price: '₹99',
      period: 'per month',
      highlight: true,
      badge: 'Most Popular',
      limits: {
        aiQuestions: '50 / day',
        quizzes: '25 / day',
        notes: '25 / day',
      },
      features: [
        'Everything in Free',
        'Multimodal Image Question Scanner',
        'AI Weakness Radar Analytics',
        '20-Minute Weakness Recovery Drills',
        'Custom Timetable Auto-Rescheduling',
        'Export Notes to PDF / Markdown',
      ],
    },
    {
      id: 'pro',
      name: 'Pilot Pro',
      tagline: 'The ultimate board & competitive exam coach',
      price: '₹199',
      period: 'per month',
      badge: 'Uncapped Power',
      limits: {
        aiQuestions: 'Unlimited',
        quizzes: 'Unlimited',
        notes: 'Unlimited',
      },
      features: [
        'Everything in Plus',
        'Unlimited AI Doubt Solving & OCR',
        'Challenger / JEE / NEET Foundation Mode',
        'Audio Voice Tutor (TTS Walkthroughs)',
        'Personalized 1-on-1 Exam Strategy',
        'Priority High-Speed Server GPU processing',
      ],
    },
  ];


  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (diffY > 80) {
      setIsUpgradeModalOpen(false);
    }
  };

  return (
    <div
      id="upgrade-modal-overlay"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative">
          <button
            onClick={() => setIsUpgradeModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
              <span>Transparent Academic Plans</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Upgrade Your Study Acceleration
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
              StudyPilot AI is designed to make elite, 1-on-1 personalized academic coaching affordable for every student.
            </p>
          </div>

          {/* Today's Usage Bar */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-200">Today's Usage ({user.subscriptionPlan.toUpperCase()} Plan):</span>
            <div className="flex items-center gap-4 text-slate-300">
              <span>🤖 AI Questions: <strong className="text-white">{usageToday.aiQuestions}</strong></span>
              <span>🧠 Quizzes: <strong className="text-white">{usageToday.quizGenerations}</strong></span>
              <span>📝 Notes: <strong className="text-white">{usageToday.notesGenerated}</strong></span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50">
          {tiers.map((tier) => {
            const isCurrent = user.subscriptionPlan === tier.id;

            return (
              <div
                key={tier.id}
                id={`pricing-card-${tier.id}`}
                className={`rounded-2xl p-5 sm:p-6 bg-white border flex flex-col justify-between transition-all relative ${
                  tier.highlight
                    ? 'border-indigo-600 shadow-xl ring-2 ring-indigo-600/20'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                {tier.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs ${
                      tier.highlight
                        ? 'bg-indigo-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {tier.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{tier.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{tier.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{tier.price}</span>
                    <span className="text-xs text-slate-500">/{tier.period}</span>
                  </div>

                  {/* Limits Badge */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Doubt Solutions:</span>
                      <strong className="text-slate-900">{tier.limits.aiQuestions}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Quiz Generations:</span>
                      <strong className="text-slate-900">{tier.limits.quizzes}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Notes Sheets:</span>
                      <strong className="text-slate-900">{tier.limits.notes}</strong>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold text-xs cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => upgradeSubscription(tier.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
                        tier.highlight
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      Switch to {tier.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cancel anytime with 1-click. No hidden fees.</span>
          </div>
          <span>Educational guarantee • Student-first privacy</span>
        </div>
      </motion.div>
    </div>
  );
};
