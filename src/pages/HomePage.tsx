import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Play, 
  Brain, 
  BookOpen, 
  ClipboardList, 
  BarChart3, 
  Star,
  FileText,
  Target,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  X,
  Compass,
  GraduationCap
} from 'lucide-react';
import robotImage from '../assets/images/cute_robot_reading_1789570270647.jpg';
import { triggerHaptic } from '../utils/androidBridge';
import { SEOHead } from '../components/seo/SEOHead';
import { getCanonicalUrl } from '../services/seoService';

export const HomePage: React.FC = () => {
  const { 
    setActiveTab, 
    user, 
    quizAttempts, 
    topicProgressList,
    learningProfile 
  } = useApp();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Calculate dynamic progress based on user profile and telemetry data
  const progressPercentage = useMemo(() => {
    if (typeof user?.masteryScore === 'number' && user.masteryScore > 0) {
      return Math.min(100, Math.round(user.masteryScore));
    }
    if (typeof learningProfile?.masteryScore === 'number' && learningProfile.masteryScore > 0) {
      return Math.min(100, Math.round(learningProfile.masteryScore));
    }
    if (topicProgressList && topicProgressList.length > 0) {
      const sum = topicProgressList.reduce((acc, curr) => acc + (curr.masteryScore || curr.accuracy || 0), 0);
      return Math.min(100, Math.round(sum / topicProgressList.length));
    }
    if (quizAttempts && quizAttempts.length > 0) {
      const sum = quizAttempts.reduce((acc, curr) => acc + (curr.accuracy || 0), 0);
      return Math.min(100, Math.round(sum / quizAttempts.length));
    }
    return 65; // Baseline starting score
  }, [user?.masteryScore, learningProfile?.masteryScore, topicProgressList, quizAttempts]);

  const featureHighlights = [
    { icon: Brain, title: 'AI Powered', desc: 'Personalized learning\nfor every student', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/60' },
    { icon: BookOpen, title: 'NCERT Integrated', desc: 'All NCERT books &\nchapters', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
    { icon: ClipboardList, title: 'Smart Quizzes', desc: 'Test your knowledge\n& track progress', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/60' },
    { icon: BarChart3, title: 'Track Progress', desc: 'See your growth\nwith detailed reports', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/60' },
    { icon: Star, title: '24/7 Support', desc: 'Help whenever\nyou need it', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-950/60' }
  ];

  const exploreFeatures = [
    { 
      id: 'ncert', 
      title: 'NCERT Books', 
      desc: 'Read, study and get summaries from all NCERT books.', 
      icon: BookOpen,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-950/60'
    },
    { 
      id: 'practice', 
      title: 'Create Quiz', 
      desc: 'Generate quizzes from any chapter or topic.', 
      icon: ClipboardList,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-950/60'
    },
    { 
      id: 'tutor', 
      title: 'AI Doubt Solver', 
      desc: 'Ask anything, get instant explanations.', 
      icon: Sparkles,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60'
    },
    { 
      id: 'plan', 
      title: 'Study Planner', 
      desc: 'Plan your study and stay on track.', 
      icon: Lightbulb,
      iconColor: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-950/60'
    },
    { 
      id: 'notes', 
      title: 'Notes & Summary', 
      desc: 'Get crisp notes and key points.', 
      icon: FileText,
      iconColor: 'text-rose-500 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-950/60'
    },
    { 
      id: 'exam', 
      title: 'Practice Tests', 
      desc: 'Improve with chapter-wise and full-length tests.', 
      icon: Target,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/60'
    }
  ];

  const handleWatchVideo = () => {
    triggerHaptic('selection');
    // Open tour walkthrough event for full walkthrough modal
    window.dispatchEvent(new CustomEvent('open-study-tour'));
    setIsVideoModalOpen(true);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-12 pb-16">
      <SEOHead
        metadata={{
          title: 'Student Study Dashboard | StudyPilot AI',
          description: 'Personalized student study dashboard with daily revision plans, adaptive quizzes, and active recall progress.',
          canonicalUrl: getCanonicalUrl('/dashboard'),
          robots: 'noindex, nofollow',
        }}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-blue-100/80 dark:border-slate-800 rounded-3xl overflow-hidden mt-2 sm:mt-6 shadow-sm">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 dark:from-indigo-900/20 to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-16 relative z-10">
          
          {/* Hero Left Content */}
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Your AI Study Companion</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              Learn Smarter <br />
              with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Study Pilot AI</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Get personalized study plans, instant doubt solutions, AI-powered quizzes and more — all in one place.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveTab('tutor');
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-full flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              
              <button 
                onClick={handleWatchVideo}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold px-8 py-3.5 rounded-full flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                </div>
                <span>Watch Video</span>
              </button>
            </div>
          </div>

          {/* Hero Right Content - Illustration */}
          <div className="relative h-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            {/* Decorative Floating text */}
            <div className="absolute top-4 left-4 lg:-left-12 rotate-[-12deg] z-20">
              <p className="font-extrabold text-blue-700 dark:text-blue-400 text-lg sm:text-2xl leading-tight font-serif italic opacity-90">
                Better<br/>Learning<br/>Brighter<br/>Future
              </p>
            </div>

            {/* Checklist Floating Card */}
            <div className="absolute -right-2 sm:right-4 top-1/4 bg-white/90 dark:bg-slate-800/95 backdrop-blur shadow-xl border border-slate-100 dark:border-slate-700 rounded-2xl p-4 z-20 hidden sm:block">
              <ul className="space-y-3">
                {['Study', 'Practice', 'Improve', 'Succeed'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Main Illustration */}
            <div className="relative w-full max-w-[500px] aspect-square rounded-full flex items-center justify-center z-10 p-4">
              <div className="absolute inset-0 bg-blue-200/50 dark:bg-indigo-600/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
              <img 
                src={robotImage} 
                alt="AI Robot studying" 
                className="w-full h-full object-contain drop-shadow-2xl z-10 scale-[1.1] sm:scale-100 origin-bottom"
                style={{ 
                  WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 100%)',
                  maskImage: 'radial-gradient(circle, black 65%, transparent 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Strip */}
      <section className="py-2 border-b border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featureHighlights.map((feature, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${feature.bg} ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{feature.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid: Explore Features + Keep Going Card */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12 pt-6">
        
        {/* Left Column: Explore Features */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Explore Our Features</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Everything you need to ace your exams, in one place.</p>
            </div>
            <button 
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('ncert');
              }}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {exploreFeatures.map((feat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveTab(feat.id);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-blue-900/5 rounded-3xl p-6 flex items-start gap-5 text-left group transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${feat.iconBg} ${feat.iconColor}`}>
                  <feat.icon className="w-7 h-7" strokeWidth={2} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pr-6">{feat.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all mt-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Keep Going Progress Card */}
        <div className="xl:col-span-1 pt-2 sm:pt-0">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800/90 border border-blue-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm relative overflow-hidden h-full min-h-[400px] flex flex-col">
            
            {/* Background Decorative Mountain Graphic */}
            <div className="absolute bottom-0 left-0 right-0 h-48 opacity-40 pointer-events-none">
               <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-200/50 dark:from-indigo-900/30 to-transparent" />
               <svg className="absolute bottom-0 w-full h-32 text-blue-200 dark:text-slate-800" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="currentColor" fillOpacity="0.5" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
               </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 fill-amber-500" />
                </div>
                <h3 className="text-xl font-extrabold text-blue-700 dark:text-blue-400">Keep Going!</h3>
              </div>
              
              <p className="text-slate-700 dark:text-slate-200 font-medium text-lg leading-snug mb-8">
                Small steps every day<br/>lead to big results.
              </p>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-5 border border-white/50 dark:border-slate-700 shadow-sm mb-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Your Learning Progress</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <p className="font-serif italic text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  "The expert in anything was once a beginner."
                </p>
                <p className="text-sm font-bold mt-2 text-slate-500 dark:text-slate-400">— Helen Hayes</p>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveTab('progress');
                }}
                className="mt-6 w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer text-center"
              >
                View Analytics &amp; Mastery Report
              </button>
            </div>
            
          </div>
        </div>

      </section>

      {/* Video / Tour Modal */}
      {isVideoModalOpen && (
        <div 
          onClick={() => setIsVideoModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">StudyPilot AI Tour</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quick interactive video walkthrough</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mb-3 animate-pulse">
                <GraduationCap className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-extrabold text-lg text-white mb-1">Study Smarter with AI</h4>
              <p className="text-xs text-slate-300 max-w-md mb-4">
                Personalized study timetable, interactive NCERT textbook page quizzes, Socratic voice tutor, and exam simulation.
              </p>
              <button 
                onClick={() => {
                  setIsVideoModalOpen(false);
                  window.dispatchEvent(new CustomEvent('open-study-tour'));
                }}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Compass className="w-4 h-4" />
                <span>Launch Interactive Walkthrough</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <button 
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setActiveTab('ncert');
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                📖 NCERT Books
              </button>
              <button 
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setActiveTab('tutor');
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                🤖 AI Tutor
              </button>
              <button 
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setActiveTab('practice');
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                ✍️ Quiz Engine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
